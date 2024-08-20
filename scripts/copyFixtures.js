const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron'); // Ensure you have the `node-cron` package installed

// Define the backup directory with the absolute path
const backupDir = '../Desktop/backup/cypress-fixtures';

// Ensure the backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Define the directory path for JSON files within the backup directory
const directoryPath = path.join(backupDir, 'jsonfiles');

// Function to get the list of files
const getFiles = () => {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    });
};

// Function to run Cypress tests
const runCypress = (file) => {
    return new Promise((resolve, reject) => {
        const command = `npx cypress run --env file="${directoryPath}/${file}"`;
        const cypressProcess = exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing Cypress: ${err}`);
                return reject(err);
            }
            console.log(stdout);
            console.error(stderr);
            resolve();
        });

        // Listen for the 'exit' event to resolve the promise
        cypressProcess.on('exit', resolve);
    });
};

const processFiles = async () => {
    try {
        const files = await getFiles();
        for (const file of files) {
            await runCypress(file);
            console.log(`Finished processing file: ${file}`);
        }
    } catch (error) {
        console.error('Error processing files:', error);
    }
};

// Schedule the job to run daily at 8:00 AM from Monday to Friday
cron.schedule('0 8 * * 1-5', () => {
    console.log('Running Cypress tests...');
    processFiles().then(() => {
        console.log('Finished processing all files.');
    }).catch((error) => {
        console.error('Error during Cypress test execution:', error);
    });
});

console.log('Scheduler is set up. Cypress tests will run daily at 8:00 AM from Monday to Friday.');
