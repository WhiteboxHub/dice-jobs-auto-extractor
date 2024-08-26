const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const schedule = require('node-schedule');

// Define paths
const fixturesPath = path.join(__dirname, 'cypress', 'fixtures');
const desktopPath = path.join(os.homedir(), 'Desktop', 'jobs_to_apply');

// Function to create directory if it doesn't exist
const ensureDirectoryExists = dirPath => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created at: ${dirPath}`);
    } else {
        console.log(`Directory already exists: ${dirPath}`);
    }
};

// Function to copy directory recursively
const copyDirectory = (src, dest) => {
    ensureDirectoryExists(dest);

    fs.readdirSync(src).forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
};

// Function to remove directory recursively
const removeDirectory = dirPath => {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
            const curPath = path.join(dirPath, file);

            if (fs.lstatSync(curPath).isDirectory()) {
                removeDirectory(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(dirPath);
    }
};

// Function to run Cypress tests
const runCypressTests = () => {
    console.log('Running Cypress tests...');

    exec('npx cypress run', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error running Cypress: ${error.message}`);
            //return;
        }
        // if (stderr) {
        //     console.error(`Cypress stderr: ${stderr}`);
        //     return;
        // }

        console.log(`Cypress stdout: ${stdout}`);

        // Copy the fixtures folder to the desktop
        console.log('Copying fixtures folder to desktop...');
        copyDirectory(fixturesPath, desktopPath);
        console.log('Fixtures copied to desktop.');
    });
};

// Schedule the Cypress test to run at 6 PM, Monday to Friday
schedule.scheduleJob('30 17 * * 1-5', runCypressTests);

// Schedule deletion of the folder after 30 days
schedule.scheduleJob('0 0 0 */30 * *', () => {
    console.log('Deleting jobs_to_apply folder from desktop...');
    removeDirectory(desktopPath);
    console.log('Folder deleted successfully.');
});
