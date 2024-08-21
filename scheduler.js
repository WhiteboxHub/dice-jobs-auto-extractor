const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Schedule the job to run daily at 8:45 AM
cron.schedule('45 15 * * *', () => {
  console.log('Running Cypress tests...');

  // Execute Cypress tests
  exec('npx cypress run', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Cypress tests: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`Cypress stderr: ${stderr}`);
      return;
    }
    console.log(`Cypress stdout: ${stdout}`);

    // Clean old JSON files before copying fixtures
    cleanOldJsonFiles();

    // After cleaning old files, copy the fixtures
    const srcDir = path.join(__dirname, '..', 'cypress', 'fixtures');
    const destDir = path.join(__dirname, 'backup', 'cypress-fixtures');

    // Ensure the destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy the fixtures
    copyDirectory(srcDir, destDir);

    console.log(`Fixtures copied to: ${destDir}`);
  });
});

function copyDirectory(src, dest) {
  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read the contents of the source directory
  fs.readdirSync(src).forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    // Check if the item is a directory or a file
    if (fs.lstatSync(srcPath).isDirectory()) {
      // Recursively copy the directory
      copyDirectory(srcPath, destPath);
    } else {
      // Copy the file
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function cleanOldJsonFiles() {
  const directories = ['cypress/fixtures/ml', 'cypress/fixtures/qa', 'cypress/fixtures/ui'];
  const days = 30;
  const now = Date.now();
  const cutoffTime = now - days * 24 * 60 * 60 * 1000;

  directories.forEach((dir) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${dir}:`, err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(dir, file);

        // Check if the file has a .json extension
        if (path.extname(file) === '.json') {
          // Get the file stats to check its age
          fs.stat(filePath, (err, stats) => {
            if (err) {
              console.error(`Error getting stats of file ${filePath}:`, err);
              return;
            }

            // Delete if the file is older than 30 days
            if (stats.mtime.getTime() < cutoffTime) {
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error(`Error deleting file ${filePath}:`, err);
                } else {
                  console.log(`Deleted old JSON file: ${filePath}`);
                }
              });
            }
          });
        }
      });
    });
  });
}
