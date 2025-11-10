# Job Application Portal

A full-stack job application portal built with Next.js, TypeScript, Prisma, and SQLite.

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
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js (Credentials provider)
- **File Storage**: Local file storage for resumes

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

3. Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Important**: Replace `your-secret-key-change-this-in-production` with a random string. You can generate one using:
```bash
openssl rand -base64 32
```

4. Initialize the database:
```bash
npm run db:setup
```
This will generate the Prisma client and create the database schema.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** The uploads directory (`public/uploads/resumes`) is created automatically when needed, but you can create it manually if you prefer.

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

### Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables:
   - `DATABASE_URL`: Your database URL (SQLite works on Vercel)
   - `NEXTAUTH_SECRET`: Your secret key
   - `NEXTAUTH_URL`: Your production URL
4. Deploy

### Database Migration

For production, you may want to use PostgreSQL instead of SQLite:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update your `DATABASE_URL` in Vercel to point to your PostgreSQL database
3. Run migrations:
```bash
npx prisma migrate deploy
```

## Environment Variables

- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth (generate a random string)
- `NEXTAUTH_URL`: Base URL of your application

## License

MIT
