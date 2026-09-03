# Pinterest natural-photo release

This is the current release. Deploy the updated Netlify site before importing a CSV so Pinterest can fetch every new photograph.

## Recommended upload

- Upload `pinterest-natural-all-remaining-93.csv` once.
- Do not also upload the birthday and crochet split files; those contain the same 93 Pins.
- If you prefer separate campaigns, upload both `pinterest-natural-birthday-remaining.csv` and `pinterest-natural-crochet-remaining.csv` instead of the combined file.
- The six Pins already created by Pinterest were removed from the remaining files. Use `pinterest-natural-replace-existing-6.csv` only after deleting or replacing those six old creatives.

The schedule starts September 5, 2026. It spreads 30 Pins from 00:10 through 23:34 in the Pinterest account timezone, with the last three Pins on September 8. The six optional replacements are spaced every four hours on September 9.

All 99 creative files in `public/pinterest/editorial/pins/` are full-frame, natural iPhone-style photographs. There are no large template panels. SEO keywords and click hooks live in the title, description and destination metadata.

The superseded template-style CSVs and images are intentionally excluded from this release.
