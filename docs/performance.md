# Performance

The API uses compression, bounded parsers, MongoDB pooling defaults, lean reads in performance-sensitive services, pagination schemas, graceful shutdown, and `/health` plus `/ready` probes. Frequently queried models already define field and compound indexes; new query shapes should be verified with `explain('executionStats')` against representative data before adding indexes.

The frontend client has a 15-second timeout. TanStack Query caches inactive data for 10 minutes, avoids focus refetches, retries once, and refetches after reconnect. Vite splits React, query/Axios, maps, charts, and animation libraries into stable chunks. The main application chunk remains about 804 kB minified and route-level lazy imports are the next highest-value improvement. Large source images (many above 1 MB) should be resized and converted to responsive WebP/AVIF assets.

Performance claims require measurement on the deployment environment. No 50/100-user load test was executed in this pass.
