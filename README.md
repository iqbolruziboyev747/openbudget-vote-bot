This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## License API (Firebase)

This project now includes backend endpoints for issuing and validating licenses.

Firebase Authentication is configured for email/password and Google sign-in.

### Environment Variables

- `LICENSE_ISSUE_SECRET`: Shared secret for protected issue endpoint.
- `FIREBASE_SERVICE_ACCOUNT_JSON` (optional): Service account JSON for local/dev use.
	- In Firebase App Hosting, Application Default Credentials can be used automatically.
- `PAYME_MERCHANT_ID`: Payme merchant id for checkout URL generation.
- `PAYME_SECRET_KEY`: Payme secret key for webhook Basic auth verification.
- `PAYME_PROJECT_CODE`: Multi-project identifier sent inside Payme `account` payload. Default: `fathrobot`.
- `PAYMENT_CONFIRM_SECRET`: Shared secret that the fixed central webhook uses to confirm successful payments into this project.
- `EA_INGEST_SECRET`: Optional shared secret for EA trade ingest endpoint (`x-ea-secret`).

### Endpoints

- `POST /api/payment`
	- Body:
		- `planId` (`m1`/`m3`/`m6`/`y1`)
		- `userId`
		- `email`
		- `accountId`
	- Result:
		- Creates `checkoutRequests` record
		- Embeds `project`, `payment_id`, `checkout_request_id`, `account_id`, and `confirm_url` into Payme `ac.*` payload
		- Returns `checkoutUrl` to redirect user to Payme

- `POST /api/payment/confirm`
	- Protected by header: `x-payment-confirm-secret: <PAYMENT_CONFIRM_SECRET>`
	- Intended for a fixed central webhook such as:
		- `https://us-central1-fath-node.cloudfunctions.net/paymentWebhook`
	- Body can include:
		- `checkoutRequestId` or `paymentId`
		- `orderId`
		- `transactionId`
		- `provider`
	- Result:
		- Marks the payment as paid
		- Issues license automatically
		- Returns `licenseId`, `licenseKey`, `expiresAt`

- `POST /api/payment/payme/webhook`
	- Optional local fallback webhook.
	- Payme JSON-RPC methods supported:
		- `CheckPerformTransaction`
		- `CreateTransaction`
		- `PerformTransaction`
		- `CancelTransaction`
		- `CheckTransaction`
		- `GetStatement`
	- On successful `PerformTransaction`, license is issued automatically.

- `POST /api/license/issue`
	- Protected by header: `x-license-admin-secret: <LICENSE_ISSUE_SECRET>`
	- Body:
		- `checkoutRequestId` (string, required)
		- `paymentRef` (string, optional)
	- Result:
		- Creates a document in `licenses`
		- Marks `checkoutRequests/{id}` as `paid`
		- Returns `licenseId`, `licenseKey`, and `expiresAt`

- `POST /api/license/validate`
	- Body:
		- `licenseKey` (string, required)
		- `accountId` (string, optional but recommended)
	- Result:
		- Returns `valid: true/false`
		- Tracks `lastValidatedAt` and `validationCount`
		- Auto-marks license as `expired` if expiration date has passed

- `POST /api/ea/trade-result`
	- Optional header (recommended): `x-ea-secret: <EA_INGEST_SECRET>`
	- Body:
		- `licenseKey` (string, required)
		- `accountId` (string, required)
		- `ticket` (string/number, required)
		- `symbol` (string, required)
		- `side` (`buy`/`sell`)
		- `volume` (number)
		- `pnl` (number)
		- `openPrice` (number)
		- `closePrice` (number)
		- `commission` (number)
		- `swap` (number)
		- `openedAt` (ISO date string)
		- `closedAt` (ISO date string)
		- `terminalId` (string, optional)
		- `eaVersion` (string, optional)
	- Result:
		- Validates license + MT5 account binding
		- Upserts one trade record per `licenseId + ticket`
		- Exposes data in user cabinet robot statistics section

### MT5 Expert Advisor Setup (Trade Sync)

To send every closed trade from EA to the website:

1. In MT5 EA inputs, set:
	- `EnableSiteTradeSync = true`
	- `SiteApiBaseUrl = https://fathrobot-5c48d.web.app` (or your domain)
	- `SiteLicenseKey = <user cabinet license key>`
	- `SiteApiSecret = <EA_INGEST_SECRET>` (if enabled on server)
2. In MT5 terminal, allow WebRequest URL:
	- `Tools -> Options -> Expert Advisors -> Allow WebRequest for listed URL`
	- Add your API base URL (e.g. `https://fathrobot-5c48d.web.app`)
3. Save and restart EA. Closed trades will appear in dashboard robot statistics.
