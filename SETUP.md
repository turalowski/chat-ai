# Setup

The app can run against Supabase in Docker, which needs no account, or against a hosted Supabase project. It only reads the Supabase URL and anon key from `.env.local`, so switching between them doesn't change any code.

## Requirements

- Docker
- Node.js 20
- An [OpenAI](https://platform.openai.com) API key
- A [Pinecone](https://www.pinecone.io) index with 1536 dimensions

## Run with Supabase in Docker

```bash
npm install
npm run db:start      # starts Supabase and applies the migrations
cp .env.example .env.local
npx supabase@2.122.0 status       # shows the local API URL and anon key
```

Copy the API URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`, and fill in the remaining values (see [Environment variables](#environment-variables)). Then start the app:

```bash
npm run dev
```

Open http://localhost:3000 and register. Any email address works, because no email is sent locally.

### Local addresses

| Service | Address |
| --- | --- |
| App | http://localhost:3000 |
| Supabase API | http://127.0.0.1:55321 |
| Supabase Studio | http://127.0.0.1:55323 |
| Local email inbox | http://127.0.0.1:55324 |

These use the `553xx` range so they don't clash with other Supabase projects on the default ports.

### Database commands

| Command | What it does |
| --- | --- |
| `npm run db:start` | Starts Supabase. Run this before `npm run dev` |
| `npm run db:stop` | Stops Supabase and keeps the data |
| `npm run db:reset` | Deletes all local data and reapplies the migrations |

### Tests

With local Supabase running, `npm run test:rls` tries to break the access rules using two users and an anonymous client. It refuses to run against a hosted project, and leaves its test users in the local database until the next `npm run db:reset`.

## How registration works

| | Supabase in Docker | Hosted Supabase |
| --- | --- | --- |
| After submitting the form | You're logged in straight away | You're asked to check your mailbox |
| Confirmation email | None | Sent by Supabase if email confirmation is on, which is its default |
| Accounts | Stored in the Docker database | Stored in your hosted project |

Local and hosted accounts are separate, so you need to register again after switching.

### Test the email flow locally

1. Set `enable_confirmations = true` under `[auth.email]` in `supabase/config.toml`.
2. Restart Supabase with `npm run db:stop` and `npm run db:start`.
3. Register, then open the local inbox at http://127.0.0.1:55324.

Local Supabase catches every email in this inbox and sends nothing to real addresses. Its email uses the default template, so the link doesn't go through `/api/auth/confirm` as it does on hosted Supabase with the template below.

## Use a hosted Supabase project

1. Create an empty project at [supabase.com](https://supabase.com). The migration creates the tables, so it fails on a project that already has them.

2. Apply the migration:

   ```bash
   npx supabase@2.122.0 link --project-ref <your-project-ref>
   npx supabase@2.122.0 db push
   ```

3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` to the values from your project's API settings, and restart the app.

4. In the Supabase dashboard, configure authentication:
   - **URL Configuration:** set the Site URL to the address of your app.
   - **Email Templates:** point the confirmation link at `{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=email`.
   - **SMTP:** add your own email provider if other people will register, because Supabase's built-in email is heavily limited.

`supabase/config.toml` only applies locally, so these settings have to be made in the dashboard.

## Environment variables


| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key. |
| `OPENAI_API_KEY` | OpenAI API key, used for embeddings and answers |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX_NAME` | Name of your Pinecone index |
| `PINECONE_ENVIRONMENT` | Must not be empty, because the app checks for it at startup. Any value works |
| `PINECONE_NAME_SPACE` | Leave empty. Documents are stored in the default namespace, so chat finds nothing if this is set |
| `CHROME_EXECUTABLE_PATH` | Path to a local Chrome binary, used in development to convert web pages to PDF |
| `CHROMIUM_PACK_URL` | URL of a `@sparticuz/chromium-min` pack, required when deployed to convert web pages to PDF |
