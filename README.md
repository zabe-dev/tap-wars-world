# tapwars.world

Install with `bun install`, then run `bun run dev`.
Run checks with `bun test` and `bun run build`. Start production with `bun run start`.
Use Node.js 24+ if running Next.js through Node; the GeoIP package requires it.

## Dokploy environment

Copy `.env.example` into Dokploy's environment settings and replace the
placeholders with secrets from your PostgreSQL service. Set `DATABASE_URL` to
the connection string supplied by that service, keep `PORT=3000`, and set
`TRUSTED_PROXY_HOPS=1` when traffic reaches the app through Dokploy's Traefik
proxy. The production start command runs the Drizzle migration before Next.js
starts, so a new database gets its tables automatically.

## Dokploy location detection

The server uses a local GeoIP database to look up the visitor's approximate
country and city. No browser permission or external lookup request is required.
Cities may be missing or inaccurate, particularly with VPNs or mobile networks.
Unavailable locations display “Location unknown”; their taps still count.

For a direct Internet -> Dokploy Traefik -> app deployment:

1. Route the domain through Dokploy's Traefik proxy.
2. Keep the application port private; only Traefik should reach it.
3. Set `TRUSTED_PROXY_HOPS=1` in the application's Dokploy environment.
4. Rebuild and restart the application.

The default is `0`: forwarded headers are ignored until proxy trust is enabled.
The app selects the visitor from the right-hand side of `X-Forwarded-For`.
Do not blindly increase the hop count. If a CDN or extra proxy is involved,
verify the actual chain first, restrict ingress to those proxies, and configure
Traefik's `forwardedHeaders.trustedIPs` for the specific upstream proxy ranges.
Never enable `forwardedHeaders.insecure` in production.
Do not expose a route that bypasses the trusted proxy.

When proxy location is unavailable (including localhost), the browser discovers
its public IP directly through ipify once per page session, then sends that IP
to our server for local country lookup. No GPS permission is requested.
ipify receives the browser's public IP as part of this request. If blocked,
taps still count with an explicit unavailable-location message.
The fallback is browser-reported and spoofable; never use it for authorization,
prizes or fraud prevention. A valid trusted-proxy location always takes priority.
VPNs report the exit location, not necessarily the visitor's physical country.
Verify after deployment
using a public connection: `POST /api/tap` returns the detected city/country.
Vercel-specific location headers are no longer used.

## GeoIP data

This product includes GeoLite data created by MaxMind, available from
https://www.maxmind.com/. The bundled database can be stale.
Before production, obtain a free MaxMind GeoLite license key and update:

```sh
# Set LICENSE_KEY securely in the update job environment first.
node node_modules/geoip-lite/scripts/updatedb.js
```

Refresh regularly according to MaxMind's license terms; restart the app after
updating. No key is required for normal lookups. For a persistent database mount,
set `GEODATADIR` to the same absolute directory in the update job and app.
Keep the GeoIP package and its data directory in the runtime image. The current
build uses normal `next start`, not a trimmed standalone image.

## Counter storage

When `DATABASE_URL` is configured, country totals are stored in PostgreSQL and
incremented atomically. The first start applies the Drizzle migration and seeds
a small top-10 starting ranking so battles are visible immediately. Without a
database URL, local development uses the same seeded in-memory ranking.
