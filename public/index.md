# NBR Audit Checker

> Free, privacy-first tool to check whether a 12-digit Bangladesh TIN appears in the National Board of Revenue (NBR) Risk-Based Audit Selection list for Assessment Year 2023–24. The lookup runs entirely in the browser — TINs are never transmitted to any server.

## What this is

The site loads a single JSON dataset of 87,685 records (the 49-zone master list plus the 8-zone supplementary list, both sourced from NBR's 28 April 2026 press release) and performs an O(1) hash lookup client-side. If a TIN is in the list, the tool returns the relevant Zone, Circle, submission type, and assessment year.

## Privacy model

- TINs are never sent over the network.
- All matching happens in the user's browser after the dataset is fetched.
- Analytics record only event names and a `tin_length` field — never TIN digits.

## Pages

- [/](https://check-tin.asif.dev/) — TIN Checker (homepage)
- [/how-it-works](https://check-tin.asif.dev/how-it-works) — Technical explanation
- [/faq](https://check-tin.asif.dev/faq) — Common questions

## Discovery endpoints

- [/robots.txt](https://check-tin.asif.dev/robots.txt)
- [/sitemap.xml](https://check-tin.asif.dev/sitemap.xml)
- [/llms.txt](https://check-tin.asif.dev/llms.txt)
- [/llms-full.txt](https://check-tin.asif.dev/llms-full.txt)
- [/.well-known/api-catalog](https://check-tin.asif.dev/.well-known/api-catalog)
- [/data/audit.json](https://check-tin.asif.dev/data/audit.json) — full dataset

## Source

- Code: https://github.com/Asif2BD/tin-findr
- Author: https://masifrahman.com/
