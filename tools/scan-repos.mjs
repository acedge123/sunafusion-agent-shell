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

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const overrides = loadOverrides();

  const repoDirs = fs.readdirSync(WORKSPACE_REPOS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(WORKSPACE_REPOS_DIR, d.name))
    .filter(d => fs.existsSync(path.join(d, ".git")));

  const inventory = [];
  const routesAndFunctions = [];
  
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
    
    // Merge override information
    const override = overrides[name] || {};
    
    if (supabaseFunctions.length > 0 || apiRoutes.pages.length > 0 || apiRoutes.app.length > 0) {
      routesAndFunctions.push({
        name,
        origin,
        supabaseFunctions,
        apiRoutes,
        override
      });
    }

    inventory.push({
      name,
      origin,
      stack,
      entrypoints,
      integrations: [...integrationSet].sort(),
      file_count_sampled: Math.min(files.length, 200),
      fingerprint: sha1(JSON.stringify({ origin, stack, entrypoints, integrations:[...integrationSet] })),
      override
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
}

main();
