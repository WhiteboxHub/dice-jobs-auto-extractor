const cron = require('node-cron');
const { exec } = require('child_process');

// Schedule the job to run daily at 8:00 AM
cron.schedule('0 16 * * *', () => {
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
  });
});
