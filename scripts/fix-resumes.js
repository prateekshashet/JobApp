const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureUploadsDirectory() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
  try {
    await fs.access(uploadsDir);
    console.log('Uploads directory exists:', uploadsDir);
  } catch (err) {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  }
}

async function fixMissingResumes() {
  try {
    // Ensure uploads directory exists
    await ensureUploadsDirectory();

    // Find all applications with resume URLs
    const applications = await prisma.application.findMany({
      where: {
        resumeUrl: { not: null }
      },
      select: {
        id: true,
        resumeUrl: true
      }
    });

    // Find all profiles with resume URLs
    const profiles = await prisma.profile.findMany({
      where: {
        resumeUrl: { not: null }
      },
      select: {
        id: true,
        resumeUrl: true
      }
    });

    console.log(`Found ${applications.length} applications and ${profiles.length} profiles with resume URLs`);

    let fixedApplications = 0;
    let fixedProfiles = 0;

    // Check and fix application resume URLs
    for (const app of applications) {
      if (app.resumeUrl && !app.resumeUrl.startsWith('http')) {
        const filePath = path.join(process.cwd(), 'public', app.resumeUrl);
        try {
          await fs.access(filePath);
        } catch (err) {
          console.log(`Missing resume for application ${app.id}: ${app.resumeUrl}`);
          await prisma.application.update({
            where: { id: app.id },
            data: { resumeUrl: null }
          });
          fixedApplications++;
        }
      }
    }

    // Check and fix profile resume URLs
    for (const profile of profiles) {
      if (profile.resumeUrl && !profile.resumeUrl.startsWith('http')) {
        const filePath = path.join(process.cwd(), 'public', profile.resumeUrl);
        try {
          await fs.access(filePath);
        } catch (err) {
          console.log(`Missing resume for profile ${profile.id}: ${profile.resumeUrl}`);
          await prisma.profile.update({
            where: { id: profile.id },
            data: { resumeUrl: null }
          });
          fixedProfiles++;
        }
      }
    }

    console.log(`\nFixed ${fixedApplications} applications and ${fixedProfiles} profiles with missing resumes`);
    console.log('Resume cleanup completed successfully!');
  } catch (error) {
    console.error('Error fixing resume URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixMissingResumes().catch(console.error);
