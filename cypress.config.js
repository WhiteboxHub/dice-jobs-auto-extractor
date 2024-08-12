const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    baseUrl: 'https://www.dice.com/',
    includeShadowDom: true,
    pageLoadTimeout: 200000,
    defaultCommandTimeout: 20000,
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1,
    chromeWebSecurity: false,

    // Environment variables for job scraping
    env: {
      pageCount: 100,
      jobKeywords: {
        QA: [
          'Selenium',
          'Appium',
          'JMeter',
          'Cypress',
          'Postman',
          'Quality Engineer'
        ],
        UI: [
          'Frontend Engineer',
          'React',
          'Angular',
          'Node.js',
          'Next.js',
          'Express.js'
        ],
        ML: [
          'Machine Learning',
          'Data Science'
        ]
      },
      targetFolder: 'c:/dice-applications/jobs-to-apply',
    },

    setupNodeEvents(on, config) {
      // Load plugins file for custom tasks
      require('./cypress/plugins/index')(on, config);
      
      // Return the updated config
      return config;
    },
  },
});
