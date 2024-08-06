// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')
Cypress.Commands.add('logInfo', (message) => {
    cy.task('logInfo', message);
  });
  
  Cypress.Commands.add('logError', (message) => {
    cy.task('logError', message);
  });
  // cypress/support/e2e.js or your test spec file

// Handle uncaught exceptions within Cypress test code
Cypress.on('uncaught:exception', (err, runnable) => {
  // Handle the uncaught exception here, e.g., log it or handle it gracefully
  console.error('Uncaught exception occurred:', err.message);
  // Return false to prevent Cypress from failing the test
  return false;
});

// Your test code here...
