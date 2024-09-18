const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    baseUrl: 'https://www.dice.com/',
    includeShadowDom: true,
    pageLoadTimeout: 100000,
    defaultCommandTimeout: 10000,
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
         'RESTAssured',
         'Playwright',
         'Puppeteer'
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
'MLops',
'MLFlow',
'Generative ai',
'neural networks',
'Spark with ML',
'NLP',
'HuggingFace',
'tensorflow',
'Pytorch',
'Keras'
        ]
      },
     
    },

    setupNodeEvents(on, config) {
      // Load plugins file for custom tasks
      require('./cypress/plugins/index')(on, config);
      
      // Return the updated config
      return config;
    },
  },
});
