const fs = require('fs/promises');
const path = require('path');

async function ensureUploadsDir() {
  try {
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    
    // Create directories recursively if they don't exist
    await fs.mkdir(uploadsPath, { recursive: true });
    
    // Create a .gitkeep file if it doesn't exist
    const gitkeepPath = path.join(uploadsPath, '.gitkeep');
    try {
      await fs.access(gitkeepPath);
      console.log('.gitkeep already exists');
    } catch {
      await fs.writeFile(gitkeepPath, '');
      console.log('Created .gitkeep file');
    }
    
    // List files in the directory
    const files = await fs.readdir(uploadsPath);
    console.log('Current files in uploads directory:');
    console.log(files.length > 0 ? files : 'No files found');
    
    console.log('\nUploads directory is ready at:', uploadsPath);
  } catch (error) {
    console.error('Error setting up uploads directory:', error);
    process.exit(1);
  }
}

ensureUploadsDir();
