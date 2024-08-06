const fs = require('fs');
const path = require('path');


// Function to ensure directory existence
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

// Function to append message to a file
const appendToFile = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, `${message}\n`, 'utf8');
    return true;
  } catch (err) {
    console.error('Error appending to file', err);
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
      try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf8');
        console.log('JSON file written successfully');
        return null;
      } catch (err) {
        console.error('Error writing JSON file', err);
        return err.message;
      }
    },
    logInfo(message) {
      const logPath = path.join(__dirname, '..', 'cypress', 'logs', 'info.log');
      ensureDirectoryExistence(logPath);
      appendToFile(logPath, message);
      return null;
    },
    logError(message) {
      const logPath = path.join(__dirname, '..', 'cypress', 'logs', 'error.log');
      ensureDirectoryExistence(logPath);
      appendToFile(logPath, message);
      return null;
    },
    getFilesFromDirectory(directory) {
      return getFilesFromDirectory(directory);
    },
  });

  return config;
};
