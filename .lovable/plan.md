

# Batch Import Twitter Bookmarks into Wiki Sources

## What this does

Runs a one-time script that reads your 190 Twitter bookmarks from the uploaded JSONL file and inserts them directly into the `wiki_sources` table as `tweet`-type sources, owned by your user ID (`0a7ef2f0-c841-4cbc-9b8b-b7b4545b9edf`).

Each bookmark becomes a wiki source with:
- **source_type**: `tweet`
- **title**: `@authorHandle: first 80 chars of tweet text`
- **source_url**: the tweet URL
- **external_id**: the tweet ID (for deduplication)
- **raw_text**: full tweet text
- **raw_json**: complete bookmark JSON (author info, engagement stats, media, etc.)
- **source_date**: the tweet's `postedAt` timestamp
- **tags**: auto-generated from author handle + `bookmark` tag
- **status**: `raw` (ready for future compilation into wiki pages)

## Steps

1. **Copy the uploaded file** to a working directory
2. **Run a Python script** that:
   - Parses each JSONL line
   - Maps fields to `wiki_sources` columns
   - Uses `psql` to batch-insert all 190 rows with `ON CONFLICT` on `external_id` to skip duplicates
3. **Report** how many rows were inserted

## Technical details

- Uses `psql` with service-role access (already configured in sandbox) to bypass RLS
- Owner ID: `0a7ef2f0-c841-4cbc-9b8b-b7b4545b9edf`
- No schema changes needed -- `wiki_sources` already has all required columns
- After import, bookmarks will appear in the Wiki > Sources tab in the UI

