#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";

const WORKSPACE_REPOS_DIR =
  process.env.REPOS_DIR || path.resolve(process.cwd(), "..");
const OUT_DIR = path.resolve(process.cwd(), "repo-map");
const MAX_FILE_BYTES = 300_000;

const TEXT_EXT = new Set([
  ".md",".txt",".json",".ts",".tsx",".js",".jsx",".py",".sql",".yaml",".yml",".toml",".env.example"
]);

const SKIP_DIRS = new Set([
  "node_modules",".next","dist","build","coverage",".turbo",".vercel",".git",".cache"
]);

function sha1(s){ return crypto.createHash("sha1").update(s).digest("hex"); }

function safeRead(file) {
  try {
    const st = fs.statSync(file);
    if (!st.isFile()) return null;
    if (st.size > MAX_FILE_BYTES) return null;
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXT.has(ext) && path.basename(file) !== "package.json") return null;

    // never ingest secrets
    const base = path.basename(file).toLowerCase();
    if (base === ".env" || base.endsWith(".pem") || base.includes("private")) return null;

    return fs.readFileSync(file, "utf8");
  } catch { return null; }
}

function detectStack(repoDir) {
  const has = (p) => fs.existsSync(path.join(repoDir, p));
  const stacks = [];
  if (has("package.json")) stacks.push("node");
  if (has("next.config.js") || has("next.config.mjs")) stacks.push("nextjs");
  if (has("vite.config.ts") || has("vite.config.js")) stacks.push("vite");
  if (has("supabase")) stacks.push("supabase");
  if (has("requirements.txt") || has("pyproject.toml")) stacks.push("python");
  if (has("deno.json") || has("deno.jsonc")) stacks.push("deno");
  if (has("Dockerfile")) stacks.push("docker");
  return [...new Set(stacks)];
}

function findEntrypoints(repoDir) {
  const candidates = [
    "README.md",
    "package.json",
    "supabase/config.toml",
    "supabase/functions",
    "supabase/migrations",
    "api",
    "backend",
    "server",
    "src/pages/api",
    "src/app/api"
  ];
  return candidates.filter((p) => fs.existsSync(path.join(repoDir, p)));
}

function scanForIntegrations(text) {
  const needles = [
    "supabase", "stripe", "openai", "creatoriq", "vercel", "aws",
    "webhook", "pgvector", "redis", "upstash", "qstash"
  ];
  const t = text.toLowerCase();
  return needles.filter(n => t.includes(n));
}

function walk(repoDir, rel="") {
  const abs = path.join(repoDir, rel);
  let out = [];
  const items = fs.readdirSync(abs, { withFileTypes: true });
  for (const it of items) {
    if (it.isDirectory()) {
      if (SKIP_DIRS.has(it.name)) continue;
      out = out.concat(walk(repoDir, path.join(rel, it.name)));
    } else if (it.isFile()) {
      const p = path.join(abs, it.name);
      const content = safeRead(p);
      if (content) out.push({ path: path.join(rel, it.name), content });
    }
  }
  return out;
}

function repoOrigin(repoDir) {
  try {
    const cfg = fs.readFileSync(path.join(repoDir, ".git", "config"), "utf8");
    const m = cfg.match(/\[remote "origin"\][\s\S]*?url = (.+)\n/);
    return m ? m[1].trim() : null;
  } catch { return null; }
}

function findSupabaseFunctions(repoDir) {
  const functionsDir = path.join(repoDir, "supabase", "functions");
  const functions = [];
  
  if (!fs.existsSync(functionsDir)) return functions;
  
  try {
    const items = fs.readdirSync(functionsDir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        // Check if it's a valid function (has index.ts or index.js)
        const funcPath = path.join(functionsDir, item.name);
        if (fs.existsSync(path.join(funcPath, "index.ts")) || 
            fs.existsSync(path.join(funcPath, "index.js"))) {
          functions.push(item.name);
        }
      }
    }
  } catch (e) {
    // Silently skip if can't read
  }
  
  return functions.sort();
}

function findAPIRoutes(repoDir) {
  const routes = {
    pages: [],
    app: []
  };
  
  // Find routes in src/pages/api/**
  // In Pages Router: src/pages/api/hello.ts -> /api/hello
  const pagesApiDir = path.join(repoDir, "src", "pages", "api");
  if (fs.existsSync(pagesApiDir)) {
    routes.pages = findPagesRoutes(pagesApiDir);
  }
  
  // Find routes in src/app/api/**
  // In App Router: src/app/api/hello/route.ts -> /api/hello
  const appApiDir = path.join(repoDir, "src", "app", "api");
  if (fs.existsSync(appApiDir)) {
    routes.app = findAppRoutes(appApiDir);
  }
  
  return routes;
}

function findPagesRoutes(apiDir) {
  const routes = [];
  
  function walkDir(currentDir, routePath) {
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of items) {
        // Skip .env files and secrets
        if (item.name.startsWith(".") || 
            item.name.toLowerCase().includes("env") ||
            item.name.toLowerCase().includes("secret")) {
          continue;
        }
        
        const itemPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          const nextRoute = routePath ? `${routePath}/${item.name}` : item.name;
          walkDir(itemPath, nextRoute);
        } else if (item.isFile()) {
          // In Pages Router, any .ts/.js file is a route
          const ext = path.extname(item.name).toLowerCase();
          if (ext === ".ts" || ext === ".js" || ext === ".tsx" || ext === ".jsx") {
            const fileName = path.basename(item.name, ext);
            const fullRoute = routePath ? `${routePath}/${fileName}` : fileName;
            routes.push(fullRoute);
          }
        }
      }
    } catch (e) {
      // Silently skip if can't read
    }
  }
  
  walkDir(apiDir, "");
  return [...new Set(routes)].sort();
}

function findAppRoutes(apiDir) {
  const routes = [];
  
  function walkDir(currentDir, routePath) {
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const item of items) {
        // Skip .env files and secrets
        if (item.name.startsWith(".") || 
            item.name.toLowerCase().includes("env") ||
            item.name.toLowerCase().includes("secret")) {
          continue;
        }
        
        const itemPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          const nextRoute = routePath ? `${routePath}/${item.name}` : item.name;
          walkDir(itemPath, nextRoute);
        } else if (item.isFile()) {
          // In App Router, look for route.ts, route.js, etc.
          const ext = path.extname(item.name).toLowerCase();
          const base = path.basename(item.name, ext).toLowerCase();
          if ((ext === ".ts" || ext === ".js" || ext === ".tsx" || ext === ".jsx") &&
              (base === "route" || base === "page")) {
            // The directory containing route.ts is the route path
            routes.push(routePath || "");
          }
        }
      }
    } catch (e) {
      // Silently skip if can't read
    }
  }
  
  walkDir(apiDir, "");
  return [...new Set(routes)].sort();
}

function extractTablesFromSQL(sql) {
  const tables = new Set();
  
  // SQL keywords to exclude
  const sqlKeywords = new Set(['for', 'to', 'from', 'where', 'select', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'if', 'not', 'exists']);
  
  // Match CREATE TABLE statements
  // Handles: CREATE TABLE public.table_name, CREATE TABLE table_name, CREATE TABLE IF NOT EXISTS...
  // More precise: look for CREATE TABLE followed by schema.table or just table
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:([a-z_][a-z0-9_]*)\.)?([a-z_][a-z0-9_]*)/gi;
  let match;
  while ((match = createTableRegex.exec(sql)) !== null) {
    const schema = match[1] ? match[1].toLowerCase() : null;
    const tableName = match[2].toLowerCase();
    
    // Skip SQL keywords and system tables
    if (!sqlKeywords.has(tableName) && 
        !tableName.startsWith('_') && 
        !tableName.includes('pg_') &&
        tableName.length > 1) {
      tables.add(tableName);
    }
  }
  
  return Array.from(tables).sort();
}

function findSupabaseTables(repoDir) {
  const migrationsDir = path.join(repoDir, "supabase", "migrations");
  const tables = new Set();
  
  if (!fs.existsSync(migrationsDir)) return [];
  
  try {
    const files = fs.readdirSync(migrationsDir, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.sql')) {
        const sqlPath = path.join(migrationsDir, file.name);
        const sql = safeRead(sqlPath);
        if (sql) {
          const foundTables = extractTablesFromSQL(sql);
          foundTables.forEach(t => tables.add(t));
        }
      }
    }
  } catch (e) {
    // Silently skip if can't read
  }
  
  return Array.from(tables).sort();
}

function loadOverrides() {
  const overridesPath = path.join(OUT_DIR, "overrides.json");
  try {
    if (fs.existsSync(overridesPath)) {
      return JSON.parse(fs.readFileSync(overridesPath, "utf8"));
    }
  } catch (e) {
    console.warn(`⚠️  Could not load overrides.json: ${e.message}`);
  }
  return {};
}

function loadDomainSummaries() {
  const summariesPath = path.join(OUT_DIR, "DOMAIN_SUMMARIES.md");
  if (!fs.existsSync(summariesPath)) {
    return new Map();
  }
  
  const content = fs.readFileSync(summariesPath, "utf8");
  const summaries = new Map();
  
  // Parse markdown sections
  const sections = content.split(/^## /m).slice(1);
  
  for (const section of sections) {
    const lines = section.split('\n');
    const repoName = lines[0].trim();
    if (!repoName) continue;
    
    // Extract summary content (everything after the repo name)
    const summaryText = section.substring(repoName.length).trim();
    summaries.set(repoName, summaryText);
  }
  
  return summaries;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const overrides = loadOverrides();
  const domainSummaries = loadDomainSummaries();

  const repoDirs = fs.readdirSync(WORKSPACE_REPOS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(WORKSPACE_REPOS_DIR, d.name))
    .filter(d => fs.existsSync(path.join(d, ".git")));

  const inventory = [];
  const routesAndFunctions = [];
  const schemaData = []; // { repo, tables: [] }
  const tableOwnership = new Map(); // table -> { owner: repo, repos: [repo1, repo2] }
  
  for (const repoDir of repoDirs) {
    const name = path.basename(repoDir);
    const stack = detectStack(repoDir);
    const entrypoints = findEntrypoints(repoDir);
    const origin = repoOrigin(repoDir);

    const files = walk(repoDir);
    const integrationSet = new Set();
    for (const f of files.slice(0, 200)) {
      scanForIntegrations(f.content).forEach(x => integrationSet.add(x));
    }

    // Extract Supabase functions and API routes
    const supabaseFunctions = findSupabaseFunctions(repoDir);
    const apiRoutes = findAPIRoutes(repoDir);
    
    // Extract Supabase tables
    const tables = findSupabaseTables(repoDir);
    
    // Merge override information
    const override = overrides[name] || {};
    
    // Track table ownership
    for (const table of tables) {
      if (!tableOwnership.has(table)) {
        tableOwnership.set(table, { owner: name, repos: [name] });
      } else {
        const existing = tableOwnership.get(table);
        if (!existing.repos.includes(name)) {
          existing.repos.push(name);
        }
        // First repo with migration owns it
      }
    }
    
    if (tables.length > 0) {
      schemaData.push({
        name,
        origin,
        tables,
        override
      });
    }
    
    if (supabaseFunctions.length > 0 || apiRoutes.pages.length > 0 || apiRoutes.app.length > 0) {
      routesAndFunctions.push({
        name,
        origin,
        supabaseFunctions,
        apiRoutes,
        override
      });
    }

    // Get domain summary if available
    const domainSummary = domainSummaries.get(name) || null;
    
    inventory.push({
      name,
      origin,
      stack,
      entrypoints,
      integrations: [...integrationSet].sort(),
      file_count_sampled: Math.min(files.length, 200),
      fingerprint: sha1(JSON.stringify({ origin, stack, entrypoints, integrations:[...integrationSet] })),
      override,
      domain_summary: domainSummary
    });
  }

  inventory.sort((a,b) => a.name.localeCompare(b.name));

  const jsonPath = path.join(OUT_DIR, "inventory.json");
  fs.writeFileSync(jsonPath, JSON.stringify({ generated_at: new Date().toISOString(), repos: inventory }, null, 2));

  const md = [
    `# Repo Inventory`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    ``,
    ...inventory.map(r => {
      const parts = [];
      parts.push(`## ${r.name}`);
      parts.push(`- Origin: ${r.origin || "unknown"}`);
      if (r.override?.alias_of) {
        parts.push(`- ⚠️  Alias of: \`${r.override.alias_of}\``);
      }
      if (r.override?.status) {
        parts.push(`- Status: \`${r.override.status}\``);
      }
      parts.push(`- Stack: ${r.stack.join(", ") || "unknown"}`);
      parts.push(`- Entrypoints: ${r.entrypoints.join(", ") || "—"}`);
      parts.push(`- Integrations: ${r.integrations.join(", ") || "—"}`);
      return parts.join("\n");
    })
  ].join("\n");

  fs.writeFileSync(path.join(OUT_DIR, "inventory.md"), md);
  console.log(`✅ Wrote repo-map/inventory.json and repo-map/inventory.md (${inventory.length} repos).`);

  // Write routes and functions report
  routesAndFunctions.sort((a, b) => a.name.localeCompare(b.name));
  
  const routesMd = [
    `# API Routes and Supabase Edge Functions`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    ``,
    ...routesAndFunctions.map(r => {
      const parts = [];
      parts.push(`## ${r.name}`);
      if (r.origin) parts.push(`- Origin: ${r.origin}`);
      if (r.override?.alias_of) {
        parts.push(`- ⚠️  Alias of: \`${r.override.alias_of}\` (duplicate functions may be listed in source repo)`);
      }
      if (r.override?.status) {
        parts.push(`- Status: \`${r.override.status}\``);
      }
      
      if (r.supabaseFunctions.length > 0) {
        parts.push(`- Supabase Edge Functions: ${r.supabaseFunctions.join(", ")}`);
      }
      
      if (r.apiRoutes.pages.length > 0) {
        parts.push(`- API Routes (Pages):`);
        r.apiRoutes.pages.forEach(route => {
          parts.push(`  - \`${route}\``);
        });
      }
      
      if (r.apiRoutes.app.length > 0) {
        parts.push(`- API Routes (App):`);
        r.apiRoutes.app.forEach(route => {
          parts.push(`  - \`${route}\``);
        });
      }
      
      if (r.supabaseFunctions.length === 0 && r.apiRoutes.pages.length === 0 && r.apiRoutes.app.length === 0) {
        parts.push(`- No routes or functions found`);
      }
      
      return parts.join("\n");
    })
  ].join("\n\n");

  fs.writeFileSync(path.join(OUT_DIR, "routes-and-functions.md"), routesMd);
  console.log(`✅ Wrote repo-map/routes-and-functions.md (${routesAndFunctions.length} repos with routes/functions).`);

  // Generate schemas.md
  schemaData.sort((a, b) => a.name.localeCompare(b.name));
  
  const schemasMd = [
    `# Database Schema Ownership`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    ``,
    `This document maps database tables to their owning repositories.`,
    `**Ownership** = the repo where the migration that creates the table lives.`,
    ``,
    `## Table Ownership`,
    ``,
    ...Array.from(tableOwnership.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([table, info]) => {
        const parts = [];
        parts.push(`### \`${table}\``);
        parts.push(`- **Owner:** \`${info.owner}\``);
        if (info.repos.length > 1) {
          parts.push(`- **Also used by:** ${info.repos.filter(r => r !== info.owner).map(r => `\`${r}\``).join(", ")}`);
          parts.push(`- ⚠️  **Shared table** - changes should be coordinated`);
        }
        return parts.join("\n");
      }),
    ``,
    `## Repositories and Their Tables`,
    ``,
    ...schemaData.map(r => {
      const parts = [];
      parts.push(`## ${r.name}`);
      if (r.origin) parts.push(`- Origin: ${r.origin}`);
      if (r.override?.alias_of) {
        parts.push(`- ⚠️  Alias of: \`${r.override.alias_of}\``);
      }
      if (r.override?.status) {
        parts.push(`- Status: \`${r.override.status}\``);
      }
      parts.push(`- **Owns ${r.tables.length} table(s):** ${r.tables.map(t => `\`${t}\``).join(", ")}`);
      return parts.join("\n");
    })
  ].join("\n\n");

  fs.writeFileSync(path.join(OUT_DIR, "schemas.md"), schemasMd);
  console.log(`✅ Wrote repo-map/schemas.md (${tableOwnership.size} tables across ${schemaData.length} repos).`);

  // Generate integration graph
  const graph = {
    nodes: [],
    edges: []
  };

  // Add nodes (repos)
  for (const repo of inventory) {
    graph.nodes.push({
      id: repo.name,
      label: repo.name,
      integrations: repo.integrations,
      hasTables: schemaData.some(s => s.name === repo.name)
    });
  }

  // Add edges based on:
  // 1. Shared tables
  for (const [table, info] of tableOwnership.entries()) {
    if (info.repos.length > 1) {
      // Create edges between all repos that share this table
      for (let i = 0; i < info.repos.length; i++) {
        for (let j = i + 1; j < info.repos.length; j++) {
          const edgeId = `${info.repos[i]}--${info.repos[j]}`;
          const existingEdge = graph.edges.find(e => e.id === edgeId);
          if (existingEdge) {
            if (!existingEdge.sharedTables.includes(table)) {
              existingEdge.sharedTables.push(table);
            }
          } else {
            graph.edges.push({
              id: edgeId,
              source: info.repos[i],
              target: info.repos[j],
              type: "shared_table",
              sharedTables: [table],
              sharedIntegrations: [],
              sharedAPIs: []
            });
          }
        }
      }
    }
  }

  // 2. Shared integrations (external APIs)
  const apiIntegrations = ["creatoriq", "shopify", "bigcommerce", "slack", "gmail", "stripe", "openai"];
  for (const api of apiIntegrations) {
    const reposUsingAPI = inventory.filter(r => r.integrations.includes(api));
    if (reposUsingAPI.length > 1) {
      for (let i = 0; i < reposUsingAPI.length; i++) {
        for (let j = i + 1; j < reposUsingAPI.length; j++) {
          const edgeId = `${reposUsingAPI[i].name}--${reposUsingAPI[j].name}`;
          const existingEdge = graph.edges.find(e => e.id === edgeId);
          if (existingEdge) {
            if (!existingEdge.sharedAPIs.includes(api)) {
              existingEdge.sharedAPIs.push(api);
            }
          } else {
            graph.edges.push({
              id: edgeId,
              source: reposUsingAPI[i].name,
              target: reposUsingAPI[j].name,
              type: "shared_api",
              sharedTables: [],
              sharedIntegrations: [],
              sharedAPIs: [api]
            });
          }
        }
      }
    }
  }

  // 3. Shared integrations (other)
  const otherIntegrations = ["supabase", "aws", "redis", "vercel", "webhook"];
  for (const integration of otherIntegrations) {
    const reposUsingIntegration = inventory.filter(r => r.integrations.includes(integration));
    if (reposUsingIntegration.length > 1) {
      for (let i = 0; i < reposUsingIntegration.length; i++) {
        for (let j = i + 1; j < reposUsingIntegration.length; j++) {
          const edgeId = `${reposUsingIntegration[i].name}--${reposUsingIntegration[j].name}`;
          const existingEdge = graph.edges.find(e => e.id === edgeId);
          if (existingEdge) {
            if (!existingEdge.sharedIntegrations.includes(integration)) {
              existingEdge.sharedIntegrations.push(integration);
            }
          } else {
            graph.edges.push({
              id: edgeId,
              source: reposUsingIntegration[i].name,
              target: reposUsingIntegration[j].name,
              type: "shared_integration",
              sharedTables: [],
              sharedIntegrations: [integration],
              sharedAPIs: []
            });
          }
        }
      }
    }
  }

  // Merge edges with multiple connection types
  const edgeMap = new Map();
  for (const edge of graph.edges) {
    // Normalize key (always use alphabetical order)
    const [source, target] = edge.source < edge.target 
      ? [edge.source, edge.target] 
      : [edge.target, edge.source];
    const key = `${source}--${target}`;
    
    if (edgeMap.has(key)) {
      const existing = edgeMap.get(key);
      existing.sharedTables.push(...edge.sharedTables);
      existing.sharedIntegrations.push(...edge.sharedIntegrations);
      existing.sharedAPIs.push(...edge.sharedAPIs);
      existing.sharedTables = [...new Set(existing.sharedTables)].sort();
      existing.sharedIntegrations = [...new Set(existing.sharedIntegrations)].sort();
      existing.sharedAPIs = [...new Set(existing.sharedAPIs)].sort();
    } else {
      edgeMap.set(key, { 
        id: key,
        source,
        target,
        sharedTables: [...edge.sharedTables].sort(),
        sharedIntegrations: [...edge.sharedIntegrations].sort(),
        sharedAPIs: [...edge.sharedAPIs].sort()
      });
    }
  }
  graph.edges = Array.from(edgeMap.values());

  // Generate graph markdown
  const graphMd = [
    `# Integration Graph`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    ``,
    `Strategic map showing relationships between repositories based on:`,
    `- **Shared Tables**: Repos that share database tables (coordination required for schema changes)`,
    `- **Shared APIs**: Repos using the same external APIs (CIQ, Shopify, BigCommerce, Slack, Gmail, etc.)`,
    `- **Shared Integrations**: Repos using the same infrastructure (Supabase, AWS, Redis, etc.)`,
    ``,
    `## Graph Statistics`,
    ``,
    `- **Nodes (Repos):** ${graph.nodes.length}`,
    `- **Edges (Relationships):** ${graph.edges.length}`,
    `- **Repos with Tables:** ${graph.nodes.filter(n => n.hasTables).length}`,
    ``,
    `## Relationships`,
    ``,
    ...graph.edges
      .sort((a, b) => {
        // Sort by number of connections (most connected first)
        const aCount = a.sharedTables.length + a.sharedAPIs.length + a.sharedIntegrations.length;
        const bCount = b.sharedTables.length + b.sharedAPIs.length + b.sharedIntegrations.length;
        return bCount - aCount;
      })
      .map(edge => {
        const parts = [];
        parts.push(`### \`${edge.source}\` ↔ \`${edge.target}\``);
        
        if (edge.sharedTables.length > 0) {
          parts.push(`- **Shared Tables:** ${edge.sharedTables.map(t => `\`${t}\``).join(", ")}`);
          parts.push(`  - ⚠️  Schema changes require coordination`);
        }
        
        if (edge.sharedAPIs.length > 0) {
          parts.push(`- **Shared APIs:** ${edge.sharedAPIs.join(", ")}`);
        }
        
        if (edge.sharedIntegrations.length > 0) {
          parts.push(`- **Shared Integrations:** ${edge.sharedIntegrations.join(", ")}`);
        }
        
        return parts.join("\n");
      }),
    ``,
    `## Repositories`,
    ``,
    ...graph.nodes
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(node => {
        const connections = graph.edges.filter(e => e.source === node.id || e.target === node.id);
        const parts = [];
        parts.push(`### \`${node.id}\``);
        parts.push(`- **Connections:** ${connections.length}`);
        if (node.hasTables) {
          parts.push(`- **Has database tables**`);
        }
        if (node.integrations.length > 0) {
          parts.push(`- **Integrations:** ${node.integrations.join(", ")}`);
        }
        return parts.join("\n");
      })
  ].join("\n\n");

  fs.writeFileSync(path.join(OUT_DIR, "integration-graph.md"), graphMd);
  
  // Also write JSON for programmatic access
  fs.writeFileSync(
    path.join(OUT_DIR, "integration-graph.json"),
    JSON.stringify({ generated_at: new Date().toISOString(), ...graph }, null, 2)
  );
  
  console.log(`✅ Wrote repo-map/integration-graph.md and integration-graph.json (${graph.edges.length} relationships).`);
}

main();
