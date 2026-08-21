# CCR Frontend

The Phase 2 Next.js App Router frontend for the zero-PII India Credit Card
Recommender. It collects only monthly spend, annual income, and top category,
then renders the backend's ranked net-benefit recommendations.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Start the backend separately on port `4000`.

In development, `/api/*` is proxied by `next.config.ts` to
`http://localhost:4000/api/*`, so the browser uses a same-origin request. Set
`API_URL` when the backend runs elsewhere. For a deployed frontend, set
`NEXT_PUBLIC_API_URL` to the public API origin.

## Checks

```bash
npm run build
```

## Product rules

- No accounts or personal data are collected.
- Recommendation cards link externally with `noopener noreferrer`.
- Seeded card data and placeholder links are illustrative only; verify all card
	terms and replace affiliate assets before production.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
