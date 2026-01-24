# Repo Map Ownership Rules (Source of Truth)

## 1) Schema ownership is explicit
- **The repo that contains the Supabase migration is the schema owner** for that table.
- `repo-map/schemas.md` is the canonical reference for ownership.

## 2) Shared tables require coordination
- If a table is marked **shared** (used by multiple repos), any change to:
  - columns / types / constraints / indexes
  - RLS policies
  - triggers / functions
  must be coordinated with all repos listed as users.

## 3) New tables must self-document
- Every new table must include a SQL comment stating:
  - owning repo/domain
  - purpose (1–2 sentences)
  - primary access pattern (read-heavy/write-heavy/event log/etc.)
- Example:
  ```sql
  COMMENT ON TABLE public.foo IS 'Owner: ciq-automations. Purpose: Stores campaign publisher assignments. Access: Write-heavy during campaign setup, read-heavy during execution.';
  ```

## 4) Deprecations must be declared
- Deprecating a table, function, edge function, or API route requires:
  - marking it in the repo-map metadata (or overrides)
  - adding a replacement path (what to use instead)
  - a removal date or milestone if applicable

## 5) Duplicates and aliases must be explicit
- If a repo is a duplicate/copy/fork for analysis or transition, it must be labeled:
  - `status: duplicate | archived | analysis-copy`
  - `alias_of: <canonical-repo>`
- The assistant and search layers should treat the canonical repo as the default.
