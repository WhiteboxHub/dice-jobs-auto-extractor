const path = require('path');
const { format } = require('date-fns');

// Directories
const resultsDir = 'cypress/fixtures/';
const logsDir = 'logs/';

// Helper function to ensure directory existence
const ensureDirectoryExistence = (dir) => {
  cy.task('ensureDirectoryExistence', dir).then((errorMessage) => {
    if (errorMessage) {
      throw new Error(`Failed to ensure directory existence: ${errorMessage}`);
    }
  });
};

// Function to log messages to a file
const logToFile = (message) => {
  const logFileName = `${format(new Date(), 'yyyy-MM-dd')}-Jobids.log`;
  const logPath = path.join(logsDir, logFileName);
  cy.task('logInfo', `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} - ${message}`, { logPath });
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
  const keywordsByCategory = Cypress.env('jobKeywords');
  const keywordJobCounts = {}; // Object to store job counts for each keyword

  before(() => {
    ensureDirectoryExistence(resultsDir);
    ensureDirectoryExistence(logsDir);
  });

  Object.keys(keywordsByCategory).forEach((category) => {
    let jobIdSet = new Set();

    describe(`Fetching jobs for category "${category}"`, () => {

      before(() => {
        logToFile(`=== Starting Dice Jobs Scraper Tests for category: "${category}" ===\n`);
      });

      keywordsByCategory[category].forEach((keyword) => {
        it(`should fetch jobs for keyword "${keyword}" in category "${category}"`, function () {
          logToFile(`Fetching jobs for keyword: "${keyword}"`);
          const pageSize = Cypress.env('pageCount');
          const startPage = 1;
  
          const performSearch = () => {
            cy.visitDiceJobsPage({ keyword, start: startPage, pageSize }).then(() => {
              const fetchJobsFromPage = () => {
                // Extract URL IDs from job links instead of div IDs
                cy.get('[data-testid="job-search-job-card-link"]').each(($el) => {
                  const href = $el.attr('href');
                  const jobId = href.split('/').pop(); // Extracts the UUID from URL
                  
                  if (jobId) {
                    jobIdSet.add(jobId);
                    logToFile(`URL ID ${jobId} added to set for keyword "${keyword}" in category "${category}"`);
                  }
                });
          
                // Pagination logic (unchanged)
                cy.get('nav[aria-label="Pagination"]').then(($nav) => {
                  const nextButton = $nav.find('[aria-label="Next"]');
                  
                  if (nextButton.length && 
                      nextButton.attr('aria-disabled') !== 'true' && 
                      nextButton.attr('data-disabled') !== 'true') {
                    
                    cy.log('Next page exists. Waiting 50 seconds before proceeding...');
                    cy.wait(20000); // 50 seconds wait
                    
                    cy.wrap(nextButton).click({ force: true });
                    cy.wait(1000);
                    
                    fetchJobsFromPage();
                  } else {
                    logToFile(`No more pages available for keyword "${keyword}". Stopping.`);
                  }
                });
              };
          
              fetchJobsFromPage();
            });
          };
  
          performSearch();
        });
      });

      after(() => {
        const jobIds = Array.from(jobIdSet);
        const jobIdCount = jobIds.length;
        keywordJobCounts[category] = jobIdCount; // Store the count for the category

        logToFile(`Category: ${category}, Job IDs fetched: ${jobIdCount}`);

        if (jobIdCount > 0) {
          const chunkSize = 20;
          const chunks = splitArrayIntoChunks(jobIds, chunkSize);

          chunks.forEach((chunk, index) => {
            const timestamp = format(new Date(), 'yyyy-MM-dd');
            const chunkFileName = `${timestamp}-${category.replace(/\s+/g, '_')}-chunk-${index + 1}.json`;

            const resultsPath = path.join(resultsDir, category, chunkFileName);

            // Ensure category directories exist
            ensureDirectoryExistence(path.dirname(resultsPath));

            // Write to resultsPath
            cy.task('writeJsonFile', { filePath: resultsPath, data: { ids: chunk } })
              .then(result => {
                if (result) {
                  cy.task('logError', `Error saving chunk ${index + 1} to resultsPath: ${result}`);
                } else {
                  cy.task('logInfo', `=== Job IDs chunk ${index + 1} saved to: ${resultsPath} ===`);
                }
              });
          });
        } else {
          cy.task('logInfo', `No job IDs collected for category "${category}".`);
        }
      });
    });
  });

  after(() => {
    logToFile('Dice Jobs Scraper Tests completed.');

    // Generate the email body with counts for all categories
    const emailBody = generateEmailBody(keywordJobCounts);
    cy.task('sendEmail', {
      subject: 'Daily Job Scraper Report',
      body: emailBody,
    }).then(result => {
      if (result) {
        cy.task('logError', `Error sending email: ${result}`);
      } else {
        cy.task('logInfo', `Email sent successfully.`);
      }
    });
  });
});

function generateEmailBody(keywordJobCounts) {
  let body = 'Job Scraper Results:\n\n';
  Object.keys(keywordJobCounts).forEach(category => {
    body += `Category: ${category}, Job IDs fetched: ${keywordJobCounts[category]}\n`;
  });
  return body;
}
