# Pinterest Birthday Launch

## Boards for the first wave

- Birthday Party Ideas
- Teen Birthday Party Ideas
- 18th Birthday Party Ideas
- Birthday Ideas by Age
- 1st Birthday Party Ideas
- Party Games

Keep the launch board set small enough that each board quickly develops depth.

## Asset paths

Public Pin URLs after deployment:

`https://YOUR-DOMAIN/pinterest/<article-slug>-pin-1.png`
`https://YOUR-DOMAIN/pinterest/<article-slug>-pin-2.png`
`https://YOUR-DOMAIN/pinterest/<article-slug>-pin-3.png`

Source copies are in `launch-assets/pinterest/`.

## UTM convention

Use:

`utm_source=pinterest`
`utm_medium=organic`
`utm_campaign=birthday_launch`
`utm_content=<slug>_pin1` (or pin2/pin3)

Example destination:

`https://YOUR-DOMAIN/article/teen-birthday-party-ideas?utm_source=pinterest&utm_medium=organic&utm_campaign=birthday_launch&utm_content=teen-birthday-party-ideas_pin1`

## Scheduling principle

For each new article:

- Variant 1: once the article is live and checked
- Variant 2: ~7 days later
- Variant 3: ~14 days later

Do not interpret this as a platform requirement. It is our testing cadence so variants have enough separation to compare performance.

## KPI hierarchy

1. Outbound clicks
2. Outbound click rate
3. Engaged sessions / lead signups from Pinterest traffic
4. Impressions
5. Saves

## Bulk upload

Pinterest currently documents organic bulk Pin creation for Business accounts with up to 200 image/video rows per CSV. Final media URLs must be publicly reachable and every row must use the final article destination—not localhost or a placeholder domain.

After the production domain is live, generate the ready-to-upload 36-row file:

```bash
npm run pinterest:csv -- --site=https://YOUR-DOMAIN --start=YYYY-MM-DD
```

The generator uses Pinterest's exact organic bulk headers, adds unique UTM links, schedules one first-wave Pin per day, then spaces variants two and four weeks later. The output is `launch/pinterest-bulk-upload.csv` in UTF-8 format.
