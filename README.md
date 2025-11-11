# Job Application Portal

A full-stack job application portal built with Next.js, TypeScript, Prisma, and MongoDB Atlas.

## Features

### Job Seekers
- Sign up and log in
- Create and edit profile (skills, experience, resume)
- Browse job listings
- Apply to jobs with resume and cover letter
- View submitted applications

### Employers
- Sign up and log in
- Post new job listings
- View own job postings
- View applicants for each job
- Review resumes and cover letters

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: Prisma ORM with MongoDB Atlas
- **Authentication**: NextAuth.js (Credentials provider)
- **File Storage**: AWS S3 (with automatic local fallback for development)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd JobApp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory for local development:
```env
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Important**: Replace `your-secret-key-change-this-in-production` with a random string. You can generate one using:
```bash
openssl rand -base64 32
```

4. Sync the database schema:
```bash
npm run db:sync
```
This will generate the Prisma client and push the schema to your MongoDB cluster.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** In development, resume uploads fall back to `public/uploads/resumes`. Production deployments must use the S3 configuration described below.

## Project Structure

```
JobApp/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── seeker/            # Job seeker pages
│   ├── employer/          # Employer pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── seeker/            # Seeker-specific components
│   └── employer/          # Employer-specific components
├── lib/                   # Utility functions
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/                # Prisma schema
│   └── schema.prisma      # Database schema
└── public/                # Static files
    └── uploads/           # Uploaded files (resumes)
```

## Database Schema

- **User**: Stores user accounts (seekers and employers)
- **Job**: Stores job postings
- **Application**: Stores job applications
- **Profile**: Stores job seeker profiles

## Deployment

### Render (Single Service with MongoDB Atlas)

Follow these steps when you are ready to deploy the full-stack Next.js service on Render backed by MongoDB Atlas.

#### 0. Local prerequisites (commit before deploying)

1. Ensure `prisma/schema.prisma` uses MongoDB:
   ```prisma
   datasource db {
     provider = "mongodb"
     url      = env("MONGODB_URI")
   }
   ```
2. Confirm the `package.json` scripts include:
   ```json
   {
     "postinstall": "prisma generate",
     "db:sync": "prisma db push",
     "build": "next build",
     "start": "next start -p $PORT"
   }
   ```
3. Keep your `.env` up to date locally and run `npm run db:sync` once to verify.
4. Commit and push all changes to GitHub.

#### 1. Configure MongoDB Atlas

1. In **Network Access**, allow `0.0.0.0/0` for quick testing (later replace with Render static outbound IPs if you add that paid add-on).
2. Copy the **Node.js** connection string from Atlas:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
   - URL-encode the password if it contains special characters (PowerShell example: `[System.Web.HttpUtility]::UrlEncode("your-password")`).
3. Use that string for the `MONGODB_URI` environment variable.

#### 2. Create the Render Web Service

1. On Render, select **New → Web Service**, choose your Git repository, and set the environment to **Node** with a region close to your users.
2. Set environment variables:
   - `MONGODB_URI` = the Atlas URI from step 1.
   - `NEXTAUTH_URL` = `https://<your-service>.onrender.com` (or your custom domain).
   - `NEXTAUTH_SECRET` = a 32+ character random string (`openssl rand -base64 32`).
   - `NODE_ENV` = `production`.
   - `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_S3_PUBLIC_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` for resume uploads.
3. Build Command: `npm run db:sync && npm run build`
4. Start Command: `npm run start`
5. Deploy the service. Render runs `db:sync` during the build to align your Prisma schema with MongoDB.

After the first deploy, visit the Render URL to verify authentication, job posting, and application flows. If you later restrict Atlas network access, remember to allowlist Render’s static outbound IPs or a VPC peering option.

### Database Migration

Push the schema against the hosted database from your machine:

```bash
npm install
npx prisma generate
npx prisma db push
```



### Resume Storage Configuration

In production, resumes are uploaded directly to S3 via presigned URLs. Ensure the AWS environment variables above are set. Without them the API falls back to storing files locally, which is only suitable for development.

## Environment Variables

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | Secret key for NextAuth (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Base URL of your app (http://localhost:3000 locally, Vercel URL in prod) |
| `AWS_REGION` | AWS region for your S3 bucket |
| `AWS_S3_BUCKET` | Name of the S3 bucket for resumes |
| `AWS_S3_PUBLIC_URL` | Public base URL for serving uploaded resumes |
| `AWS_ACCESS_KEY_ID` | AWS access key with write permissions to the bucket |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key |

If you use OAuth providers with NextAuth, also add their respective client IDs and secrets.

## License

MIT
