const fs = require('fs');
const path = require('path');
const os = require('os');
const nodemailer = require('nodemailer'); // Ensure nodemailer is imported

// Function to ensure directory existence
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

// Function to append a message to a file
const appendToFile = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, `${message}\n`, 'utf8');
    return true;
  } catch (err) {
    console.error('Error appending to file:', err);
    return false;
  }
};

module.exports = (on, config) => {
  on('task', {
    ensureDirectoryExistence(filePath) {
      ensureDirectoryExistence(filePath);
      return null;
    },
    writeJsonFile({ filePath, data }) {
      return new Promise((resolve, reject) => {
        try {
          const jsonData = JSON.stringify(data, null, 2);
          ensureDirectoryExistence(filePath); // Ensure the directory exists before writing the file
          fs.writeFile(filePath, jsonData, 'utf8', (err) => {
            if (err) {
              console.error('Error writing JSON file:', err);
              return reject(err.message);
            }
            console.log('JSON file written successfully');
            resolve(null);
          });
        } catch (err) {
          console.error('Error writing JSON file:', err);
          reject(err.message);
        }
      });
    },
    logInfo(message) {
      const logPath = path.join(__dirname, '..', 'logs', 'info.log');
      ensureDirectoryExistence(logPath); // Ensure the directory exists before appending to the file
      const result = appendToFile(logPath, message);
      return result ? null : 'Error logging info';
    },
    logError(message) {
      const logPath = path.join(__dirname, '..', 'logs', 'error.log');
      ensureDirectoryExistence(logPath); // Ensure the directory exists before appending to the file
      const result = appendToFile(logPath, message);
      return result ? null : 'Error logging error';
    },
    sendEmail({ subject, body }) {
      return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'dicedetails1@gmail.com',
            pass: 'hyqn gdee qoks erdq', // Ensure these credentials are kept secure
          },
        });
    
        let mailOptions = {
          from: 'dicedetails1@gmail.com',
          to: 'shivapatel098k@gmail.com', // Replace with the correct recipient email address
          subject: subject,
          text: body,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            return reject(error); // Reject the promise if there's an error
          }
          console.log('Email sent:', info.response);
          resolve(info.response); // Resolve the promise with the email response
        });
      });
    
    
    },
  });

  return config;
};
