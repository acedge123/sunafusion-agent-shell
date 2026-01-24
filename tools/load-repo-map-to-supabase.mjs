#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { createClient } from '@supabase/supabase-js';

const REPO_MAP_DIR = path.resolve(process.cwd(), "repo-map");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Load JSON files
const inventory = JSON.parse(fs.readFileSync(path.join(REPO_MAP_DIR, "inventory.json"), "utf8"));
const routesAndFunctionsMd = fs.readFileSync(path.join(REPO_MAP_DIR, "routes-and-functions.md"), "utf8");
const schemas = fs.readFileSync(path.join(REPO_MAP_DIR, "schemas.md"), "utf8");
const integrationGraph = JSON.parse(fs.readFileSync(path.join(REPO_MAP_DIR, "integration-graph.json"), "utf8"));

// Build a map of routes/functions by repo name from markdown
const routesByRepo = new Map();
const sections = routesAndFunctionsMd.split(/^## /m).slice(1);

sections.forEach(section => {
  const lines = section.split('\n');
  const repoName = lines[0].trim();
  if (!repoName) return;
  
  const functions = [];
  const routesPages = [];
  const routesApp = [];
  let currentSection = null;
  
  for (const line of lines) {
    if (line.includes('Supabase Edge Functions:')) {
      const funcsStr = line.split(':')[1]?.trim() || '';
      const funcs = funcsStr.split(',').map(f => f.trim()).filter(Boolean);
      functions.push(...funcs);
    } else if (line.includes('API Routes (Pages):')) {
      currentSection = 'pages';
    } else if (line.includes('API Routes (App):')) {
      currentSection = 'app';
    } else if (line.trim().startsWith('- `') && line.includes('`')) {
      const route = line.match(/`([^`]+)`/)?.[1];
      if (route) {
        if (currentSection === 'pages') {
          routesPages.push(route);
        } else if (currentSection === 'app') {
          routesApp.push(route);
        }
      }
    }
  }
  
  if (functions.length > 0 || routesPages.length > 0 || routesApp.length > 0) {
    routesByRepo.set(repoName, { functions, routesPages, routesApp });
  }
});

// Parse schemas.md to get table ownership
const tablesByRepo = new Map();
const tableOwnership = new Map();

// Extract table info from schemas.md
const schemaSections = schemas.split(/^## /m).slice(1);
schemaSections.forEach(section => {
  const lines = section.split('\n');
  const repoName = lines[0].trim();
  const tables = [];
  const sharedTables = [];
  
  for (const line of lines) {
    if (line.includes('**Owns') && line.includes('table(s):**')) {
      const tablesMatch = line.match(/table\(s\):\*\* (.+)/);
      if (tablesMatch) {
        const tableList = tablesMatch[1].split(',').map(t => t.trim().replace(/`/g, '')).filter(Boolean);
        tables.push(...tableList);
      }
    }
  }
  
  if (tables.length > 0) {
    tablesByRepo.set(repoName, tables);
    tables.forEach(table => {
      if (!tableOwnership.has(table)) {
        tableOwnership.set(table, { owner: repoName, repos: [repoName] });
      } else {
        const info = tableOwnership.get(table);
        if (!info.repos.includes(repoName)) {
          info.repos.push(repoName);
          sharedTables.push(table);
        }
      }
    });
  }
});

// Build full text search content
function buildSearchText(repo) {
  const parts = [];
  parts.push(repo.name);
  if (repo.origin) parts.push(repo.origin);
  parts.push(...(repo.stack || []));
  parts.push(...(repo.integrations || []));
  
  const routes = routesByRepo.get(repo.name);
  if (routes) {
    parts.push(...routes.functions);
    parts.push(...routes.routesPages);
    parts.push(...routes.routesApp);
  }
  
  const tables = tablesByRepo.get(repo.name);
  if (tables) {
    parts.push(...tables);
  }
  
  if (repo.override?.status) {
    parts.push(repo.override.status);
  }
  if (repo.override?.alias_of) {
    parts.push(repo.override.alias_of);
  }
  
  return parts.join(' ');
}

async function loadRepoMap() {
  console.log("📦 Loading repo-map data into Supabase...");
  
  // Clear existing data
  const { error: deleteError } = await supabase
    .from('repo_map')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (deleteError) {
    console.error("⚠️  Warning: Could not clear existing data:", deleteError.message);
  } else {
    console.log("✅ Cleared existing repo_map data");
  }
  
  // Prepare data for insertion
  const records = inventory.repos.map(repo => {
    const routes = routesByRepo.get(repo.name) || { functions: [], routesPages: [], routesApp: [] };
    const tables = tablesByRepo.get(repo.name) || [];
    const tableInfo = tableOwnership.get(tables[0]) || null;
    const isTableOwner = tables.some(t => {
      const info = tableOwnership.get(t);
      return info && info.owner === repo.name;
    });
    const sharedTables = tables.filter(t => {
      const info = tableOwnership.get(t);
      return info && info.repos.length > 1 && info.repos.includes(repo.name);
    });
    
    return {
      repo_name: repo.name,
      origin: repo.origin,
      stack: repo.stack || [],
      integrations: repo.integrations || [],
      supabase_functions: routes.functions || [],
      api_routes_pages: routes.routesPages || [],
      api_routes_app: routes.routesApp || [],
      tables: tables,
      table_owner: isTableOwner,
      shared_tables: sharedTables,
      override: repo.override || {},
      full_text_search: buildSearchText(repo),
      metadata: {
        entrypoints: repo.entrypoints || [],
        file_count_sampled: repo.file_count_sampled,
        fingerprint: repo.fingerprint
      },
      generated_at: inventory.generated_at
    };
  });
  
  // Insert in batches
  const batchSize = 50;
  let inserted = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('repo_map')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
    } else {
      inserted += data.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data.length} repos (${inserted}/${records.length})`);
    }
  }
  
  console.log(`\n✅ Successfully loaded ${inserted} repos into Supabase`);
  console.log("\n📊 Query examples:");
  console.log("  SELECT * FROM search_repo_map('webhook');");
  console.log("  SELECT * FROM repo_map WHERE 'creatoriq' = ANY(integrations);");
  console.log("  SELECT * FROM repo_map WHERE 'meta' = ANY(supabase_functions);");
}

loadRepoMap().catch(console.error);
