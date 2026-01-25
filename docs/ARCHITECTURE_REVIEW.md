# Architecture Review: Agent Access to Repos & Learnings

## ✅ What's Working Well

### 1. Repo-Map Integration
- **Keyword Detection**: Triggers on queries like "which repo", "where is", "webhook", etc.
- **Context Integration**: Repo-map results added to context via `contextBuilder.ts`
- **Structured Output**: Returns `repos_mentioned[]`, `tables_mentioned[]`, `functions_mentioned[]` for UI
- **Source Panel**: UI shows structured sources with "Open repo" links

### 2. Memory System
- **Lightweight Extraction**: Only stores durable facts/preferences (not every chat)
- **Auto-Loading**: Memories loaded into context for every query
- **Smart Filtering**: Excludes temporary/test data
- **Tagging**: Memories tagged for categorization

## ⚠️ Critical Issues

### 1. **Repo-Map Table is Empty** (BLOCKER)
- Migration created table structure ✅
- **But data was never loaded** ❌
- **Fix**: Run `npm run repo-map:load` (see `docs/LOAD_REPO_MAP.md`)

### 2. **Keyword Detection is Too Narrow**
Current keywords only trigger on explicit phrases:
```typescript
'which repo', 'where is', 'which function', 'which table', 
'webhook', 'webhooks', 'creatoriq', 'shopify', 'bigcommerce'
```

**Problem**: Natural language queries might not match:
- "Show me repos that handle payments" ❌ (no keyword match)
- "What codebase manages user authentication?" ❌ (no keyword match)
- "Find where we integrate with Stripe" ❌ (no keyword match)

**Recommendation**: 
- Use LLM to detect if query is about codebase/repos (more flexible)
- Or expand keyword list significantly
- Or always search repo-map and let relevance score filter

### 3. **Memory Extraction is Basic**
Current approach:
- Keyword-based detection (`prefer`, `system`, `config`, etc.)
- First sentence extraction
- Simple confidence scoring

**Problems**:
- Might miss important facts that don't use keywords
- No way to manually add/edit memories
- No memory deduplication
- No memory search/retrieval optimization

**Recommendation**:
- Use LLM to extract structured facts from responses
- Add manual memory management UI
- Implement memory deduplication (check for similar facts)
- Add memory search/retrieval with semantic similarity

### 4. **No Feedback Loop**
- No way to improve memory extraction based on what's actually useful
- No way to mark memories as outdated/incorrect
- No analytics on which memories are used most

## 🔧 Recommended Improvements

### Short Term (Quick Wins)

1. **Load Repo-Map Data** (CRITICAL)
   ```bash
   npm run repo-map:load
   ```

2. **Expand Keyword Detection**
   - Add more synonyms: "codebase", "repository", "code", "project"
   - Add integration names: "stripe", "paypal", "twilio", etc.

3. **Always Search Repo-Map** (with low threshold)
   - Search on every query
   - Only include results with relevance > 0.3
   - This catches more natural language queries

### Medium Term (Better Architecture)

1. **LLM-Based Query Classification**
   ```typescript
   // Use LLM to classify if query is about codebase
   const isCodebaseQuery = await classifyQuery(query);
   if (isCodebaseQuery) {
     // Search repo-map
   }
   ```

2. **Improved Memory Extraction**
   - Use LLM to extract structured facts
   - Support manual memory management
   - Add memory deduplication

3. **Memory Search Optimization**
   - Use embeddings for semantic search
   - Rank memories by relevance to query
   - Show memory confidence in context

### Long Term (Advanced Features)

1. **Active Learning**
   - Track which memories are actually used
   - Suggest memory updates when facts change
   - Auto-prune unused memories

2. **Codebase Understanding**
   - Parse actual code (not just metadata)
   - Understand relationships between repos
   - Track code changes over time

3. **Contextual Memory**
   - Memories scoped to projects/threads
   - Shared team memories
   - Memory versioning

## 📊 Current Flow

```
User Query
  ↓
Keyword Detection (narrow)
  ↓
Repo-Map Search (if keywords match)
  ↓
Memory Load (always, if authenticated)
  ↓
Context Builder (combines all sources)
  ↓
LLM Synthesis
  ↓
Memory Extraction (if keywords match)
  ↓
Response + Source Data
```

## 🎯 Is This the Right Path?

**Yes, but with caveats:**

✅ **Good Foundation**:
- Separation of concerns (repo-map, memory, context)
- Structured data flow
- UI integration

⚠️ **Needs Work**:
- Repo-map must be loaded (blocker)
- Keyword detection too narrow
- Memory extraction too basic
- No feedback mechanisms

**Recommendation**: 
1. **Fix the blocker** (load repo-map data)
2. **Expand keyword detection** (quick win)
3. **Consider always searching repo-map** (better UX)
4. **Improve memory extraction** (use LLM)

The architecture is sound, but the implementation needs refinement to be truly useful.
