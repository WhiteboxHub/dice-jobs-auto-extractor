const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

// Define source and destination directories for file copying
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

// Function to clean old JSON files
const cleanOldJsonFiles = () => {
    const directories = ['cypress/fixtures/ml', 'cypress/fixtures/qa', 'cypress/fixtures/ui'];
    const days = 30;
    const now = Date.now();
    const cutoffTime = now - days * 24 * 60 * 60 * 1000;

    directories.forEach((dir) => {
        if (fs.existsSync(dir)) {
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
        } else {
            console.error(`Directory does not exist: ${dir}`);
        }
    });
};

// Schedule task
schedule.scheduleJob('59 16 * * *', () => {
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

        // Copy files after running Cypress tests
        console.log('Copying files...');
        copyFiles(sourceDir, destDir);

        // Clean old JSON files after copying
        console.log('Cleaning old JSON files...');
        cleanOldJsonFiles();
    });
});
