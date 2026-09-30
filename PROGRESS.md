## 2026-09-30 — Unused code cleanup

- [x] Remove redundant IP2Location dependency, adapter, and environment setting
- [x] Delete unused header-controls component; remove unused variables and CSS selectors
- [x] Pass tests, unused-symbol check, and production build; removed code remains recoverable from Git

## 2026-09-30 — Reliable approximate location

- [x] Preserve trusted country attribution when city data is missing
- [x] Bound browser caching and verify city/country display
- [x] Add optional device location with browser-only BigDataCloud reverse geocoding
- [x] Verify permission, provider failures, rendered location states, and mobile overflow
- [x] Allow same-origin browser geolocation through Permissions-Policy

## 2026-09-30 — Shared-network city lookup

- [x] Reject empty and placeholder city values from proxy location data
- [x] Retry browser public-IP discovery across both ipify endpoints
- [x] Fall back to the browser-discovered IP when trusted proxy city data is incomplete

## 2026-09-30 — UTC world ranking header

- [x] Rename the leaderboard heading to World Ranking
- [x] Show the current UTC date and time in the ranking header
- [x] Keep server-recorded timestamps in UTC ISO format

## 2026-09-30 — Shared country battles

- [x] Persist one active battle and its frozen ranking values in PostgreSQL
- [x] Count participant taps server-side toward the 250-tap battle goal
- [x] Broadcast battle state through the existing SSE activity stream
- [x] Remove browser-local battle persistence and scoring

## 2026-09-30 — Cross-user tap activity

- [x] Broadcast accepted taps with PostgreSQL LISTEN/NOTIFY
- [x] Deliver activity events to browsers through an SSE stream
- [x] Show same-country taps while keeping rings local to the tapping user

## 2026-09-30 — Production milestone ladder

- [x] Start production milestones at 10,000 total taps
- [x] Add widening 100k–1,000,000,000 milestone targets
- [x] Use the production ladder consistently across environments

## 2026-09-30 — Milestone track UI

- [x] Show the reached date from each milestone record
- [x] Render ten milestone targets, including locked future targets
- [x] Keep only achieved milestones clickable for top-10 snapshots

## 2026-09-30 — Milestone presentation and tap feedback

- [x] Label milestone cards with their recorded tap total
- [x] Open each milestone into a top-10 snapshot modal
- [x] Replace the tap cue with a layered, pitch-stepped browser sound

## 2026-09-30 — Tap milestones

- [x] Save top-10 snapshots at recurring tap milestones
- [x] Return each newly recorded milestone once from the tap API
- [x] Celebrate milestones with client confetti; use smaller intervals in development

## 2026-09-30 — Tap endpoint hardening

- [x] Reject cross-origin browser tap requests and oversized payloads
- [x] Ignore client-selected rate-limit identities behind a trusted proxy
- [x] Keep accepted tap points server-controlled at exactly one

## 2026-09-30 — Battle tap settlement animation

- [x] Replace green rank arrows with an added-taps indicator
- [x] Animate added taps into the frozen ranking score
- [x] Commit battle ranking totals only after the consume animation finishes
- [x] Include 11th place as a valid challenger for the visible 10th-place country

## 2026-09-30 — Competitive ranking loop

- [x] Add country missions with milestone progress bars
- [x] Show live rank movement after an accepted tap
- [x] Add per-visitor burst scoring to suppress rapid spam

## 2026-09-30 — Wikidata facts

- [x] Use the free public Wikidata API for structured country facts
- [x] Generate readable capital, language, currency, area and continent lines
- [x] Keep Wikipedia summaries as a resilient fallback

## 2026-09-30 — General Wikipedia country facts

- [x] Replace unusual-article discovery with direct Wikipedia country summaries
- [x] Keep facts limited to countries currently in the Top 10

## 2026-09-30 — Wikipedia-only trivia

- [x] Remove CountryFactsAPI and all provider parsing/fallback code
- [x] Keep unusual-article index plus local Wikipedia title fallbacks
- [x] Update privacy and README source disclosures

## 2026-09-30 — Fun fact prioritization

- [x] Prefer CountryFactsAPI’s unusual/funny records over general Wikipedia summaries
- [x] Score records for weird signals such as snakes, bans, pyramid schemes and world records
- [x] Keep Wikipedia Unusual articles as the fallback source

## 2026-09-30 — Fact quality filter

- [x] Remove the “best country in the world” opinionated fact
- [x] Add regression coverage for filtered provider content

## 2026-09-30 — Fact loading fallback

- [x] Fix Wikipedia link-index parser for the `query.pages[].links[]` response
- [x] Bump the stale empty cache key
- [x] Add CountryFactsAPI fallback when Wikipedia is blocked or unavailable
- [x] Verify a live `/api/fact?country=CA` response returns a fact

## 2026-09-30 — Loading preview

- [x] Add `/?loading=1` preview with a two-second skeleton delay

## 2026-09-30 — Exact loading skeletons

- [x] Match total skeleton to the rendered digit width
- [x] Match trivia skeleton to its two-line wrapped footprint
- [x] Match ranking skeletons to row spacing and column geometry
- [x] Replace opacity pulses with moving shimmer highlights and respect reduced motion

## 2026-09-30 — Legal pages and loading skeletons

- [x] Add Privacy Policy and Terms of Use pages linked from footer
- [x] Add loading skeletons for total, trivia and ranking data

## 2026-09-30 — Weirder trivia replacements

- [x] Replace tarsier ancestry, nocturnal zoo and diver summaries with hanging coffins, gum restrictions and trickster folklore
- [x] Keep API source wording, necessary context and legal exceptions; retain Top 10 filtering
- [x] Invalidate old fact cache; 29 tests and production build pass

## 2026-09-30 — Stationary ranking dividers

- [x] Move position animation into row content; keep divider borders on static rows
- [x] Verify production build and browser swap: content moves, divider positions remain fixed

## 2026-09-30 — Floating header controls

- [x] Move sound and theme controls outside centered content to the viewport top-right

## 2026-09-30 — Simple footer

- [x] Add compact footer beneath the ranking

## 2026-09-30 — Wikipedia unusual articles

- [x] Use the curated `Wikipedia:Unusual articles` index as the fact source
- [x] Cache linked article titles for seven days and match articles to Top 10 countries
- [x] Fetch summaries on demand and link to the selected unusual article
- [x] Hide missing or ambiguous coverage instead of showing unrelated facts
- [x] Fall back to CountryFactsAPI when Wikipedia is unavailable at runtime

## 2026-09-30 — CountryFactsAPI trivia

- [x] Replace Wikipedia facts with `vantilburger.com/CountryFactsAPI`
- [x] Validate country ownership, descriptions, HTTPS sources and known stale records
- [x] Try another Top 10 country when provider coverage is missing
- [x] Cache country fact pools for 24 hours
- [x] Verify 26 tests and production build

## 2026-09-30 — Unusual country trivia

- [x] Replace generic topics with country-specific curiosities from Wikipedia
- [x] Select the unusual source sentence; no generic fallback or invented details
- [x] Preserve Top 10 eligibility and invalidate the previous trivia cache
- [x] Verify all 11 fetched summaries, 26 tests and production build

## 2026-09-30 — Close demo rankings

- [x] Seed countries from 100–110 taps, one tap apart
- [x] Start Philippines at #8 so taps visibly move it up the board

## 2026-09-30 — Top 10 trivia eligibility

- [x] Share Top 10 selection between leaderboard and trivia
- [x] Hide facts immediately when their country leaves the Top 10; reject mismatched responses
- [x] 24 tests, production build and browser eligibility check pass

## 2026-09-30 — Trivia country flag

- [x] Add country flag before each fact, with an accessible country label

## 2026-09-30 — Plain trivia text

- [x] Remove flag, country name and separator from trivia; preserve source link

## 2026-09-30 — Ranking movement correction

- [x] Remove country confirmation line; retain failure feedback
- [x] Keep tap totals steady; remove score flips and total bounce
- [x] Animate country rows into their new ranking positions
- [x] Production build and browser rank-swap verification pass

## 2026-09-30 — Visible country attribution and minimal controls

- [x] Discover public IP in browser when proxy location is unavailable; dedupe per session
- [x] Show detected/counted country; validate fallback input and prefer trusted proxy location
- [x] Live browser proof: Philippines tap increased its total from 1,284 to 1,285
- [x] Display full trivia text; replace header branding/status with right-aligned sound/theme icons
- [x] Persist theme; verify mobile wrapping, sound toggle and theme reload
- [x] 22 tests and production build pass

## 2026-09-30 — API-backed fact line

- [x] Replace hardcoded facts with Wikipedia summaries, cached for 24 hours
- [x] Minimal single-line source link; remove card and extra controls
- [x] Verify 16 tests, production build and live Wikipedia endpoint
- [x] Resolve localhost attribution with browser public-IP discovery (see newer entry)

## 2026-09-30 — Country trivia

- [x] Replace contribution counter with random trivia from the displayed Top 10
- [x] Add source links and an Another fact button that avoids immediate repeats
- [x] Verify 15 tests, production build and browser fact switching

## 2026-09-30 — Dokploy location and minimal Top 10

- [x] Replace Vercel headers with local GeoIP lookup and explicit trusted proxy hops
- [x] Preserve taps when location is unavailable; support country names beyond the original shortlist
- [x] Remove podium; show ten compact rankings with count flips and animated reordering
- [x] Verify 13 tests, production build, desktop/mobile layout, count flip and location fallback
- [ ] Configure Dokploy proxy trust and update GeoLite data before deployment (see README)
- [ ] Replace seeded in-memory totals with persistent real counts (existing limitation)

## 2026-09-30 — Ring and leaderboard balance

- [x] Centered the tap ring to match the prototype’s single outward pulse
- [x] Expanded the board to Top 11 so the desktop ranking columns split evenly

## 2026-09-30 — Engagement-focused UI polish

- [x] Added clearer live status, contribution feedback, and shared-total context
- [x] Added rounded Nunito visual system and stronger hierarchy
- [x] Balanced the desktop leaderboard with a full-width final row

## 2026-09-30 — Typography and ranking polish

- [x] Switched from Manrope to rounded Nunito typography
- [x] Seeded the live store with ten countries so the Top 10 board fills consistently
- [x] Kept location detection server-side without requesting browser geolocation

## 2026-09-30 — Live counter data

- [x] Load leaderboard totals from `/api/ranking`
- [x] Persist taps through `/api/tap` and render the returned location
- [x] Reduced toast travel distance around the button

## 2026-09-30 — Prototype UI parity

- [x] Replaced the page styling with the supplied World Counter prototype layout
- [x] Added simulated ambient taps, floating location toasts, sound toggle, and tap ring feedback
- [x] Added responsive podium and ranking board with light/dark theme tokens

## 2026-09-30 — First prototype

- [x] Make tap feedback optimistic and verify real browser tap updates total
- [x] Replace decorative glyph icons with Iconify icons
- [x] Reworked visual direction from reference: dark arcade board, giant counter, action button, live toasts
- [x] Next.js + TypeScript + Bun scaffold
- [x] Hono API for ranking and tap recording
- [x] Tap button with animated location toasts
- [x] Podium and animated ranking rows
- [ ] Replace in-memory store with PostgreSQL/Drizzle and shared rate limiting
## 2026-09-30 — First-visit location consent

- [x] Offer optional location in a first-visit modal; remember accept/dismiss for the UTC day
- [x] Reset at 00:00 UTC in open tabs and recheck when background tabs become visible
- [x] Request browser permission only on explicit consent; allow reopening later
- [x] Browser proof: same-day reload stays dismissed; 00:00 UTC reopens; consent performs one lookup
- [x] 38 tests, strict unused-symbol check, mobile layout, and production build pass
## 2026-09-30 — Compact location toasts

- [x] Abbreviate toast country names to ISO codes while keeping city names
- [x] Keep full country names in consent and privacy explanations
- [x] 38 tests and production build pass
## 2026-09-30 — Development consent preview

- [x] Show location consent on every fresh development page load
- [x] Preserve once-per-UTC-day consent behavior in production
## 2026-09-30 — Simpler location consent modal

- [x] Reduce modal copy to one explanation and one disclosure
- [x] Add Iconify icons to both actions
- [x] Add subtle Framer Motion entrance with reduced-motion support
- [x] Browser proof: modal shows two icon buttons and no inline location panel
## 2026-09-30 — Modal IP estimate

- [x] Show the captured IP-based city and country before requesting permission
- [x] Clarify that the estimate needs no browser permission
- [x] Make “Not now” compact relative to the primary action
- [x] Browser proof confirms estimate text and compact button sizing
## 2026-09-30 — Location consent wording

- [x] Replace awkward “Show your city?” heading with “Use your device location?”
## 2026-09-30 — Lightweight dismiss action

- [x] Remove the initial focus ring from “Not now” only
- [x] Focus the dialog itself on open; keep button borders and keyboard focus styling
## 2026-09-30 — Location policy wording

- [x] Align Privacy Policy with modal-only device location and development behavior
- [x] Clarify in Terms that device location does not affect rankings
- [x] Remove stale README wording about a location button
## 2026-09-30 — Use approved device location for taps

- [x] Pass the resolved device city/country from consent into the counter
- [x] Send derived device location with the next tap; keep raw coordinates client-side
- [x] Validate device location on the tap route and use it for attribution
- [x] Update Terms, Privacy, and README disclosures
- [x] Add regression coverage for device-attributed taps

## 2026-09-30 — Remember location consent choice

- [x] Show the consent modal on every fresh visit by default
- [x] Add an optional “Remember my choice” checkbox
- [x] Remembered consent expires after seven days in every environment
- [x] Remove development-only modal behavior and UTC-day consent state
- [x] Simplify location copy, style the checkbox, and title-case legal headings
- [x] Add standard privacy, disclaimer, liability, and indemnity language

## 2026-09-30 — Capital fallback for missing city data

- [x] Use country capitals when IP or device geolocation has no city
- [x] Cover capital fallback in server, browser, and activity displays
