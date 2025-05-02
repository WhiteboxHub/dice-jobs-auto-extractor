const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const schedule = require('node-schedule');

// Define paths
const fixturesPath = path.join(__dirname, 'cypress', 'fixtures');
const desktopPath = path.join(os.homedir(), 'Desktop', 'jobs_to_apply');
const archiveFolderPath = path.join(os.homedir(), 'Desktop', 'archived_jobs');

// Function to create directory if it doesn't exist
const ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Directory ensured at: ${dirPath}`);
    } catch (err) {
        console.error(`Error creating directory: ${err.message}`);
    }
};

// Function to copy directory recursively
const copyDirectory = async (src, dest) => {
    await ensureDirectoryExists(dest);

    try {
        const files = await fs.readdir(src);
        for (const file of files) {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            const stat = await fs.lstat(srcPath);

            if (stat.isDirectory()) {
                await copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
        console.log(`Copied ${src} to ${dest}`);
    } catch (err) {
        console.error(`Error copying directory: ${err.message}`);
    }
};

// Function to remove directory recursively
const removeDirectory = async (dirPath) => {
    try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
            const curPath = path.join(dirPath, file);
            const stat = await fs.lstat(curPath);

            if (stat.isDirectory()) {
                await removeDirectory(curPath);
            } else {
                await fs.unlink(curPath);
            }
        }
        await fs.rmdir(dirPath);
        console.log(`Directory removed: ${dirPath}`);
    } catch (err) {
        console.error(`Error removing directory: ${err.message}`);
    }
};

// Function to run Cypress tests
const runCypressTests = () => {
    console.log('Running Cypress tests...');

    exec('npx cypress run', async (error, stdout, stderr) => {
        if (error) {
         //   console.error(`Error running Cypress: ${error.message}`);
           // return;
        }

        console.log(`Cypress stdout: ${stdout}`);
        console.log('Copying fixtures folder to desktop...');

        // Copy the fixtures folder to the desktop
        await copyDirectory(fixturesPath, desktopPath);
        console.log('Fixtures copied to desktop.');
    });
};

// Function to recreate specific directories inside cypress/fixtures
const recreateDirectories = async () => {
    const mlPath = path.join(fixturesPath, 'ML');
    const qaPath = path.join(fixturesPath, 'QA');
    const uiPath = path.join(fixturesPath, 'UI');

    await deleteDirectoryIfExists(mlPath);
    await deleteDirectoryIfExists(qaPath);
    await deleteDirectoryIfExists(uiPath);

    await ensureDirectoryExists(mlPath);
    await ensureDirectoryExists(qaPath);
    await ensureDirectoryExists(uiPath);
    console.log('ML, QA, and UI directories recreated inside cypress/fixtures.');
};

// Function to delete a directory if it exists
const deleteDirectoryIfExists = async (dirPath) => {
    try {
        const exists = await fs.access(dirPath).then(() => true).catch(() => false);

        if (exists) {
            await removeDirectory(dirPath);
        }
    } catch (err) {
        console.error(`Error checking or deleting directory: ${err.message}`);
    }
};

// Function to move files from one directory to another
const moveFiles = async (src, dest) => {
    await ensureDirectoryExists(dest);

    try {
        const files = await fs.readdir(src);
        for (const file of files) {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            const stat = await fs.lstat(srcPath);

            if (stat.isDirectory()) {
                await moveFiles(srcPath, destPath);
            } else {
                await fs.rename(srcPath, destPath);
            }
        }
        await fs.rmdir(src);
        console.log(`Files moved from ${src} to ${dest}`);
    } catch (err) {
        console.error(`Error moving files: ${err.message}`);
    }
};

// Schedule the Cypress test to run at 6 PM, Monday to Friday
schedule.scheduleJob('49 13 * * 1-5', runCypressTests);

// Schedule moving files from the jobs_to_apply folder to the archived_jobs folder every two days at 6 PM
schedule.scheduleJob('40 13 * * *', async () => {
    console.log('Moving files from jobs_to_apply folder to archived_jobs folder...');
    await moveFiles(desktopPath, archiveFolderPath);
    console.log('Files moved successfully.');

    console.log('Recreating specific directories in fixtures...');
    await recreateDirectories();
    console.log('Directories recreated successfully.');
});
