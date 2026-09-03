# Pinterest bulk release

This folder contains Pinterest-ready CSV files using the standard columns already supported by The Curated Pin's launch workflow.

- `pinterest-bulk-crochet.csv`: 27 Pins for 9 Crochet destinations.
- `pinterest-bulk-birthday.csv`: 72 Pins for 24 Birthday destinations.
- `pinterest-bulk-all.csv`: all 99 Pins in one file.
- `pinterest-pin-plan.xlsx`: filterable QA and publishing workbook with the same schedule.

Every article has three original 1000 × 1500 creative variants in `public/pinterest/bulk/`. Six priority destinations use photo-led result creatives; the remaining pins use a text-safe utility layout. Destination URLs include campaign, article, variant and creative-format UTM parameters.

The release starts September 4, 2026 and is spread across the full day at 30 Pins per day. The final nine Pins are scheduled early on September 7. Deploy the site before importing the CSV so every public media URL and article promise is live when Pinterest fetches it.

Use `pinterest-bulk-all.csv` once, or use the Birthday and Crochet files separately—never upload both options or Pins will be duplicated. After seven days, compare outbound clicks for `photo_result` versus `utility_static` in the `pinterest_outbound_test_sep2026` campaign before producing the next batch.
