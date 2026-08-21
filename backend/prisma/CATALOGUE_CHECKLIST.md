# Production Catalogue Checklist

A card is production-ready only when every item below is complete.

Use `verified-catalogue.template.json` as the Phase 3 worksheet. It is intentionally
not consumed by the API until every required field is verified.

## Card record

- [ ] Card name and issuer match the official issuer page.
- [ ] Annual fee and renewal conditions are verified from the latest MITC or official fee schedule.
- [ ] Minimum income is recorded as an annual INR amount and verified from the issuer.
- [ ] Every reward rate is stored as a fraction (`0.05` means 5%).
- [ ] Every reward cap is recorded as a monthly INR reward-value cap.
- [ ] The card has an `Other` multiplier fallback rule.
- [ ] `sourceUrl` points to the official issuer page or MITC document.
- [ ] `lastVerifiedAt` records the date of the latest verification.
- [ ] `isActive` is true only while the data is current.

## Affiliate assets

- [ ] `applyUrl` is a real approved affiliate tracking URL.
- [ ] The outbound URL was tested and reaches the intended application flow.
- [ ] `imageUrl` is an approved affiliate or Cloudinary asset, not a scraped bank logo.
- [ ] Affiliate disclosure and independent-recommendation language remain visible in the frontend.

## Release gate

Do not promote illustrative seed data to production. The current seed records use
placeholder images, example links, and approximate figures. Replace them only after
all checks above are complete, then run:

```bash
npm run prisma:generate
npm run typecheck
npm test
npm run db:push
npm run seed
```

After seeding, verify representative requests for each supported category and check
that inactive cards are absent from the API response.

The seed command also refuses to run when `NODE_ENV=production`. Image assets may
remain pending during curation, but must be replaced before production promotion.

Run `npm run catalogue:check` before importing or promoting a catalogue. The
current worksheet is expected to fail until its null fields are replaced with
verified values and approved affiliate assets.
