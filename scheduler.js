// scripts/runCypressAndCopy.js
const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Schedule the job to run daily at 8:45 AM
cron.schedule('45 8 * * *', () => {
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

    // After tests are complete, copy the fixtures
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
