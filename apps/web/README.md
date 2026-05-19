# AllApartments Web

Local-first Next.js app for the StCloudAptss migration.

## Getting Started

Install dependencies, then run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Dev Data

The app uses `DATABASE_URL` from `.env.local`. To sync indexes and seed local/dev data:

```bash
npx prisma db push
npm run db:seed
```

Seeded accounts all use the password `Password123!`:

- `owner.one@example.com`
- `owner.two@example.com`
- `renter.one@example.com`

The seed command is idempotent. It upserts fixed users, listings, and reviews so local testing has stable data.

## Checks

```bash
npm test
npm run lint
npm run build
```

## API Docs

Run the app locally and open [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
