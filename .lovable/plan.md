

# Fix Wiki Route Redirect Issue

## Root Cause

The `/wiki` route is wrapped in `<RequireAdmin>`, which redirects:
- To `/auth` if not logged in
- To `/` (home page, which looks like a chat launcher) if logged in but not admin

Since your user (`0a7ef2f0-c841-4cbc-9b8b-b7b4545b9ed`) likely doesn't have an `admin` role in the `user_roles` table, you're being bounced to the home page.

## Options

**Option A: Remove admin restriction from Wiki (recommended if Wiki is for all logged-in users)**
- Change `<RequireAdmin><Wiki /></RequireAdmin>` to just `<Wiki />` (or a simpler `<RequireAuth>` wrapper)

**Option B: Add your user as admin in the database**
- Insert a row into `user_roles`: `user_id = '0a7ef2f0-c841-4cbc-9b8b-b7b4545b9ed'`, `role = 'admin'`
- This keeps the admin gate but grants you access

**Option C: Both — add admin role now, and later decide if Wiki should be public**

## Recommended: Option B

Since Learnings is also admin-gated, keeping Wiki admin-only is consistent. We just need to ensure your user has the admin role.

## Steps

1. Create a migration that inserts your user into `user_roles` with `role = 'admin'`
2. No code changes needed — the routing and guard logic are correct

## Files Modified

| File | Change |
|------|--------|
| New migration | `INSERT INTO user_roles (user_id, role) VALUES ('0a7ef2f0-c841-4cbc-9b8b-b7b4545b9ed', 'admin')` |

