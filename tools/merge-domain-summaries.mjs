#!/usr/bin/env node
/**
 * Merge domain summaries from MASTER_DOMAIN_SUMMARY.md into inventory.json
 * 
 * MASTER_DOMAIN_SUMMARY.md contains richer summaries with:
 * - System Role
 * - Primary flows
 * - Upstream/downstream dependencies
 * - Shared tables
 * - Change impact warnings
 * - Refactor Risk
 * 
 * Use this when you can't run a full repo scan but want to update domain summaries.
 */
import fs from "fs";
import path from "path";

const REPO_MAP_DIR = path.resolve(process.cwd(), "repo-map");

function loadDomainSummaries() {
  // Use MASTER_DOMAIN_SUMMARY.md for richer summaries with System Role, Refactor Risk, etc.
  const summariesPath = path.join(REPO_MAP_DIR, "MASTER_DOMAIN_SUMMARY.md");
  if (!fs.existsSync(summariesPath)) {
    console.error("❌ MASTER_DOMAIN_SUMMARY.md not found");
    process.exit(1);
  }
  
  const content = fs.readFileSync(summariesPath, "utf8");
  const summaries = new Map();
  
  // Parse markdown sections - look for ### headers for repo names
  const sections = content.split(/^### /m).slice(1);
  
  for (const section of sections) {
    const lines = section.split('\n');
    const repoName = lines[0].trim();
    if (!repoName) continue;
    
    // Extract summary content (everything after the repo name until next major section)
    // Stop at --- (section divider) or next ## header
    let summaryLines = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('---') || line.startsWith('## ')) break;
      summaryLines.push(line);
    }
    
    const summaryText = summaryLines.join('\n').trim();
    if (summaryText) {
      summaries.set(repoName, summaryText);
    }
  }
  
  console.log(`📖 Loaded ${summaries.size} domain summaries from MASTER_DOMAIN_SUMMARY.md`);
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
