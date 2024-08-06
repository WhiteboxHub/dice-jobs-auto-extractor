const path = require('path');
const { format } = require('date-fns');

const resultsDir = 'cypress/fixtures/extracted/';
const logsDir = 'cypress/logs/';
const logFileName = `${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}Jobids.log`;

// Helper function to ensure directory existence
const ensureDirectoryExistence = (dir) => {
  cy.task('ensureDirectoryExistence', dir);
};

// Helper function to log messages to a file
const logToFile = (message) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const logMessage = `[${timestamp}] ${message}\n`;
  cy.log(logMessage);
  cy.writeFile(path.join(logsDir, logFileName), logMessage, { flag: 'a+', timeout: 5000 });
};

// Function to split an array into chunks
const splitArrayIntoChunks = (array, chunkSize) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

describe('Dice Jobs Scraper', () => {
  const keywords = Cypress.config('jobKeywords');

  before(() => {
    ensureDirectoryExistence(resultsDir);
    ensureDirectoryExistence(logsDir);
  });

  keywords.forEach((keyword) => {
    const jobIdsFileName = `${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}-${keyword}.json`;
    const filePath = path.join(resultsDir, jobIdsFileName);
    let jobIdSet = new Set();

    beforeEach(() => {
      cy.writeFile(path.join(logsDir, logFileName), `=== Starting Dice Jobs Scraper Tests for keyword: "${keyword}" ===\n`, { flag: 'a+' }, { timeout: 5000 });
      jobIdSet = new Set(); // Reset jobIdSet for each keyword
    });

    it(`should fetch jobs for "${keyword}"`, function () {
      logToFile(`Fetching jobs for keyword: "${keyword}"`);
      const pageSize = Cypress.config('pageCount');
      const startPage = 1;
      const endPage = pageSize;
      const increment = 100;
      let keepLooping = true;

      const performSearch = async () => {
        if (!keepLooping) {
          logToFile(`Stopping search loop for keyword: "${keyword}"`);
          return;
        }

        await cy.visitDiceJobsPage({ keyword, start: startPage, pageSize });

        await cy.get('.card-title-link.normal', { timeout: 5000 }).each(($el) => {
          const jobId = $el.attr('id');
          if (jobId) {
            jobIdSet.add(jobId);
            logToFile(`Job ID ${jobId} added to set for keyword "${keyword}"`);
          }
        });

        if (Cypress.$('.card-title-link.normal').length === 0) {
          logToFile(`No more job cards found for keyword "${keyword}". Stopping.`);
          keepLooping = false;
        } else {
          for (let pageNumber = startPage; pageNumber <= endPage; pageNumber++) {
            cy.contains('a.page-link', `${pageNumber}`).click({ force: true });
            cy.get('.card-title-link.normal', { timeout: 10000 }).each(($el) => {
              const jobId = $el.attr('id');
              if (jobId) {
                jobIdSet.add(jobId);
                logToFile(`Job ID ${jobId} added to set for keyword "${keyword}"`);
              }
            });
            if (Cypress.$('.card-title-link.normal').length === 0) {
              logToFile(`No more job cards found for keyword "${keyword}". Stopping.`);
              keepLooping = false;
            }
            cy.wait(1000); // Adjust time based on your page's animation duration
          }
        }
      };

      performSearch();
    });

    afterEach(() => {
      const jobIds = Array.from(jobIdSet);
      if (jobIds.length > 0) {
        const chunkSize = 20;
        const chunks = splitArrayIntoChunks(jobIds, chunkSize);
        chunks.forEach((chunk, index) => {
          const chunkFileName = `${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}-${keyword}-chunk-${index + 1}.json`;
          const chunkFilePath = path.join(resultsDir, chunkFileName);
          cy.task('writeJsonFile', { filePath: chunkFilePath, data: { ids: chunk } })
            .then(() => {
              logToFile(`=== Job IDs chunk ${index + 1} saved to: ${chunkFilePath} ===`);
            })
            .catch((err) => {
              logToFile(`Error saving chunk ${index + 1}: ${err.message}`);
            });
        });
      } else {
        logToFile('No job IDs collected to save.');
      }
    });
  });
});
