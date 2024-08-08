const path = require('path');
const { format } = require('date-fns');

const resultsDir = 'cypress/fixtures/'; // Base directory for results
const logsDir = 'logs/';
const targetFolder = path.join('C:/Users/YourUsername/Desktop/', 'dice-applications/jobs-to-apply/'); // Adjusted for desktop path

const logFileName = `${format(new Date(), 'yyyy-MM-dd')}-Jobids.log`;

// Helper function to ensure directory existence
const ensureDirectoryExistence = (dir) => {
  cy.task('ensureDirectoryExistence', dir);
};

// Function to log messages to a file
const logToFile = (message) => {
  const logPath = path.join(logsDir, logFileName);
  cy.task('logInfo', `${format(new Date(), 'yyyy-MM-dd ')} - ${message}`, { logPath });
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
  const keywords = Cypress.env('jobKeywords');

  before(() => {
    ensureDirectoryExistence(resultsDir);
    ensureDirectoryExistence(logsDir);
    ensureDirectoryExistence(targetFolder);
  });

  Object.keys(keywords).forEach((category) => {
    keywords[category].forEach((keyword) => {
      const jobIdsFileName = `${format(new Date(), 'yyyy-MM-dd')}-${category}-${keyword.replace(/\s+/g, '_')}.json`;
      const filePath = path.join(resultsDir, category, jobIdsFileName); // Fixed directory structure
      const targetFilePath = path.join(targetFolder, category, jobIdsFileName);
      let jobIdSet = new Set();

      beforeEach(() => {
        ensureDirectoryExistence(path.join(resultsDir, category));
        ensureDirectoryExistence(path.join(targetFolder, category));
        logToFile(`=== Starting Dice Jobs Scraper Tests for category: "${category}", keyword: "${keyword}" ===\n`);
        jobIdSet = new Set();
      });

      it(`should fetch jobs for "${keyword}"`, function () {
        logToFile(`Fetching jobs for keyword: "${keyword}"`);
        const pageSize = Cypress.env('pageCount');
        const startPage = 1;

        const performSearch = () => {
          cy.visitDiceJobsPage({ keyword, start: startPage, pageSize }).then(() => {
            const fetchJobsFromPage = () => {
              cy.get('.card-title-link.normal').each(($el) => {
                const jobId = $el.attr('id');
                if (jobId) {
                  jobIdSet.add(jobId);
                  logToFile(`Job ID ${jobId} added to set for keyword "${keyword}"`);
                }
              });

              cy.get('li.pagination-next.page-item.ng-star-inserted').then(($nextPageItem) => {
                if ($nextPageItem.hasClass('disabled')) {
                  logToFile(`No more job cards found for keyword "${keyword}". Stopping. It's the last page.`);
                } else {
                  cy.get('li.pagination-next.page-item.ng-star-inserted a.page-link').click();
                  cy.wait(1000).then(fetchJobsFromPage);
                }
              });
            };

            fetchJobsFromPage();
          });
        };

        performSearch();
      });

      afterEach(() => {
        const jobIds = Array.from(jobIdSet);
        if (jobIds.length > 0) {
          const chunkSize = 20;
          const chunks = splitArrayIntoChunks(jobIds, chunkSize);
      
          chunks.forEach((chunk, index) => {
            const timestamp = format(new Date(), 'yyyy-MM-dd');
            const chunkFileName = `${timestamp}-${category}-${keyword.replace(/\s+/g, '_')}-chunk-${index + 1}.json`;
      
            const paths = {
              resultsPath: path.join(resultsDir, category, chunkFileName),
              targetPath: path.join(targetFolder, chunkFileName),
            };
      
            // Ensure category directories exist
            ensureDirectoryExistence(path.join(resultsDir, category));
            ensureDirectoryExistence(path.join(targetFolder, category));
      
            // Write to resultsPath
            cy.task('writeJsonFile', { filePath: paths.resultsPath, data: { ids: chunk } })
              .then(result => {
                if (result) {
                  cy.task('logError', `Error saving chunk ${index + 1} to resultsPath: ${result}`);
                } else {
                  cy.task('logInfo', `=== Job IDs chunk ${index + 1} saved to: ${paths.resultsPath} ===`);
                }
              });
      
            // Write to targetPath
            cy.task('writeJsonFile', { filePath: paths.targetPath, data: { ids: chunk } })
              .then(result => {
                if (result) {
                  cy.task('logError', `Error saving chunk ${index + 1} to targetPath: ${result}`);
                } else {
                  cy.task('logInfo', `=== Job IDs chunk ${index + 1} saved to: ${paths.targetPath} ===`);
                }
              });
          });
        } else {
          cy.task('logInfo', 'No job IDs collected to save.');
        }
      });
    });
  });
});
