# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   Create a `.env` file in the root directory with:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```
   
   Generate a secret key:
   ```bash
   openssl rand -base64 32
   ```

3. **Setup database:**
   ```bash
   npm run db:setup
   ```
   This will generate Prisma client and create the database.

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## First Steps

1. **As a Job Seeker:**
   - Click "I am a Job Seeker" on the landing page
   - Sign up with your email and password
   - Complete your profile (skills, experience, upload resume)
   - Browse jobs and apply

2. **As an Employer:**
   - Click "I am an Employer" on the landing page
   - Sign up with your email and password
   - Post your first job
   - View applicants

## Troubleshooting

- **Database errors:** Make sure you've run `npm run db:setup`
- **Authentication errors:** Check that `NEXTAUTH_SECRET` is set in `.env`
- **File upload errors:** Ensure `public/uploads/resumes` directory exists
- **Build errors:** Run `npm run db:generate` to regenerate Prisma client

## Deployment

See the README.md for deployment instructions to Vercel.

