# Plan: Integrate Cicero API for Elected Official Lookup

## Context

The Google Civic Information API `representativeInfoByAddress` was shut down April 2025.
Cicero (by Melissa) is the best replacement — it covers all levels of U.S. government:
federal, state (governor + both legislative chambers), county, and municipal.

The current codebase has the schema scaffolding (`User.streetAddress`, `Official`, `UserDistrict`)
but no automated lookup — `UserDistrict` records are manually seeded, and the Ask page
shows *all* officials rather than filtering to the user's representatives.

## Steps

### 1. Add `src/lib/cicero.ts` — Cicero API client

Create a new service module following the established pattern in `action-network.ts`:
- `getApiKey()` / `isEnabled()` guard functions (graceful skip when key unset)
- `ciceroFetch(params)` — HTTP GET to `https://app.cicerodata.com/v3.1/official`
  with `search_loc` (full address string), `key` (API key), and optional `district_type` filter
- `lookupOfficialsByAddress(address)` — accepts `{ street, city, state, zip }`,
  calls Cicero, returns a normalized array of officials with their district info
- Type definitions for the Cicero API response shape

Cicero returns officials grouped by district. Each official includes:
`first_name`, `last_name`, `party`, `office.title`, `office.chamber`,
`district.district_type` (e.g. `NATIONAL_UPPER`, `STATE_LOWER`, `LOCAL`),
`district.label`, plus contact fields (email, url, phone, photo).

We map `district.district_type` to our `chamber` enum:
| Cicero district_type | Our chamber value |
|---|---|
| `NATIONAL_UPPER` | `senate` |
| `NATIONAL_LOWER` | `house` |
| `STATE_EXEC` | `state_exec` |
| `STATE_UPPER` | `state_senate` |
| `STATE_LOWER` | `state_house` |
| `LOCAL` / `LOCAL_EXEC` / `COUNTY` | `local` |

### 2. Expand Prisma schema

- Add `ciceroId` (String, optional, unique) to `Official` model — the Cicero `sk` primary key
  used for deduplication when upserting officials from API responses
- Add `level` (String, optional) to `Official` — stores the raw Cicero `district_type`
  for richer filtering (e.g. "county_legislature" vs "city_council")
- Add `addressLookedUpAt` (DateTime, optional) to `User` — timestamp of last Cicero lookup,
  used to avoid burning credits on repeat lookups for the same address
- Expand `chamber` enum comment to include `"state_exec"` for governors/lt. governors
- Run `npx prisma migrate dev` to generate migration

### 3. Add address collection page — `src/app/address/page.tsx`

A client component with a simple form:
- Street address, city, state (dropdown of 50 states + DC), zip code
- "Find My Officials" submit button
- On submit: POST to new `/api/address` route
- Shows a loading spinner while Cicero lookup runs
- On success: displays the list of matched officials, then redirects to home
- On error: shows a user-friendly message

### 4. Add `/api/address/route.ts` — address submission + Cicero lookup

Server-side API route:
1. `requireAuth()` — must be signed in
2. Validate address fields (street, city, state, zip all required)
3. Call `lookupOfficialsByAddress()` from the new Cicero module
4. For each official returned:
   - `prisma.official.upsert()` keyed on `ciceroId` — create if new, update contact info if existing
5. Delete existing `UserDistrict` records for this user (address changed)
6. Create new `UserDistrict` records linking user to each matched official
7. Update `User` with address fields + set `isAddressVerified = true` + set `addressLookedUpAt = now()`
8. Return the list of matched officials

### 5. Add post-login redirect to address page

In `src/auth.ts`, add a `signIn` callback:
- After successful OAuth sign-in, check if the user has `isAddressVerified === false`
- If so, set the redirect to `/address` instead of `/`
- Returning users with a verified address go straight to home

### 6. Filter officials on the Ask page to user's representatives

Update `src/app/api/officials/route.ts`:
- If the user is authenticated and has `isAddressVerified`, query only officials
  linked via `UserDistrict` for that user
- If not authenticated or no address, fall back to returning all officials
  (or return empty with a prompt to complete address registration)

Update `src/app/ask/page.tsx`:
- Remove the "In production, this list will be limited..." placeholder text
- If no officials returned (user hasn't entered address), show a call-to-action
  linking to `/address`

### 7. Add `CICERO_API_KEY` to env config

- Add to `.env.example` with documentation comment
- Add to `.env` (blank, for local dev graceful skip)

### 8. Add tests

- `src/__tests__/cicero.test.ts` — unit tests for response normalization and
  chamber mapping, using mocked fetch responses
- `src/__tests__/address-api.test.ts` — integration test for the `/api/address`
  route, verifying officials are upserted and UserDistrict records created

### 9. Update seed data

- Add `ciceroId` values to existing seeded officials
- Add state-level and local officials to the seed to demonstrate multi-level coverage
- Update `UserDistrict` mappings to reflect realistic multi-level representation
  (each seeded user gets ~8-12 officials: 2 US senators, 1 US rep, governor,
  1 state senator, 1 state rep, county exec, city council member, etc.)

## Files touched

| File | Change |
|---|---|
| `src/lib/cicero.ts` | **New** — Cicero API client |
| `prisma/schema.prisma` | Add `ciceroId`, `level` to Official; `addressLookedUpAt` to User |
| `src/app/address/page.tsx` | **New** — address collection form |
| `src/app/api/address/route.ts` | **New** — address submission + Cicero lookup |
| `src/auth.ts` | Add redirect logic for unverified addresses |
| `src/app/api/officials/route.ts` | Filter to user's officials via UserDistrict |
| `src/app/ask/page.tsx` | Remove placeholder text, add address CTA |
| `.env.example` | Add `CICERO_API_KEY` |
| `.env` | Add `CICERO_API_KEY` (blank) |
| `prisma/seed.ts` | Add ciceroId + multi-level officials |
| `src/__tests__/cicero.test.ts` | **New** — Cicero client tests |
| `src/__tests__/address-api.test.ts` | **New** — address route tests |

## Execution order

Steps 1-2 first (foundation), then 3-4 (address flow), then 5-6 (integration into existing flows), then 7-9 (config/tests/seed).
