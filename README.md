# Portfolio

## Set up a fresh clone

Use Node.js 22 or later and npm. In PowerShell:

```powershell
git clone https://github.com/surajcodingclave/portfolio.git
cd portfolio
npm ci
Copy-Item .env.example .env.local
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Paste the generated value into `NEXTAUTH_SECRET` in `.env.local`. Set `ADMIN_EMAIL` to your email and `ADMIN_PASSWORD` to a strong, unique password. Leave `PORTFOLIO_STORAGE=local` for a single machine with a writable project directory.

Run `npm run dev` and open [the admin dashboard](http://localhost:3000/admin/dashboard). Sign in with the values you set above. Use the dashboard to publish profile, content, appearance, SEO and skills changes, and to manage projects, services, experience and images.

For a production build on one machine, run `npm run build` followed by `npm start`. Set `NEXTAUTH_URL` to the actual origin, including HTTPS for a public deployment. Use a persistent disk and a single application instance with file storage.

## Move existing content

A fresh clone starts with the bundled portfolio content. File storage saves changes and uploaded images to `.data/portfolio.json`. To move those edits to a new machine, copy this file into the new clone's `.data` directory before starting the app. Generate the destination's credentials and session secret locally. Git ignores local credentials, runtime data, installed dependencies and build output.

## Use MongoDB

For a shared or hosted setup, set `PORTFOLIO_STORAGE=mongo` and fill in `MONGODB_URI`. If the database has no admin account for your email, run `npm run admin:create` once from the project directory with `ADMIN_EMAIL` and `ADMIN_PASSWORD` set. This command requires a password of at least 12 characters. The app reads saved content and admin accounts from the database. To access the same portfolio from a second system, configure it to connect to that database.

## Deploy to Vercel

Import the project into Vercel and set these environment variables for Production:

- `PORTFOLIO_STORAGE=mongo`
- `MONGODB_URI` with the MongoDB connection string
- `NEXTAUTH_SECRET` with a newly generated random secret
- `NEXTAUTH_URL` with the deployed HTTPS origin

Create the admin account once before signing in by running `npm run admin:create` locally with `MONGODB_URI`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters in `.env.local`. Do not commit environment files or put database credentials in source code. Deploy after the environment variables are configured.
