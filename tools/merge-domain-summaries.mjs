#!/usr/bin/env node
/**
 * Merge domain summaries from DOMAIN_SUMMARIES.md into inventory.json
 * Use this when you can't run a full repo scan but want to update domain summaries.
 */
import fs from "fs";
import path from "path";

const REPO_MAP_DIR = path.resolve(process.cwd(), "repo-map");

function loadDomainSummaries() {
  const summariesPath = path.join(REPO_MAP_DIR, "DOMAIN_SUMMARIES.md");
  if (!fs.existsSync(summariesPath)) {
    console.error("❌ DOMAIN_SUMMARIES.md not found");
    process.exit(1);
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
  
  console.log(`📖 Loaded ${summaries.size} domain summaries from DOMAIN_SUMMARIES.md`);
  return summaries;
}

function main() {
  const inventoryPath = path.join(REPO_MAP_DIR, "inventory.json");
  
  if (!fs.existsSync(inventoryPath)) {
    console.error("❌ inventory.json not found");
    process.exit(1);
  }
  
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
  const domainSummaries = loadDomainSummaries();
  
  let updated = 0;
  let missing = [];
  
  for (const repo of inventory.repos) {
    const summary = domainSummaries.get(repo.name);
    if (summary) {
      repo.domain_summary = summary;
      updated++;
    } else {
      missing.push(repo.name);
    }
  }
  
  // Update generated_at timestamp
  inventory.generated_at = new Date().toISOString();
  
  // Write back
  fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
  
  console.log(`✅ Updated ${updated} repos with domain summaries`);
  
  if (missing.length > 0) {
    console.log(`\n⚠️  ${missing.length} repos missing domain summaries:`);
    missing.forEach(name => console.log(`   - ${name}`));
  }
  
  console.log("\n📦 Now run: node tools/load-repo-map-to-supabase.mjs");
}

main();
