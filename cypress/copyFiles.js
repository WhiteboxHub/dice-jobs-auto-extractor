const fs = require('fs');
const path = require('path');

// Define the source and destination directories
const sourceDir = path.join(__dirname, 'cypress', 'fixtures');
const destDir = path.join(require('os').homedir(), 'Desktop', 'jobs_to_apply');

// Function to copy files
const copyFiles = (source, destination) => {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const files = fs.readdirSync(source);
    files.forEach(file => {
        const srcFile = path.join(source, file);
        const destFile = path.join(destination, file);

        fs.copyFileSync(srcFile, destFile);
        console.log(`Copied ${file} to ${destination}`);
    });
};

// Run the copy operation
copyFiles(sourceDir, destDir);
