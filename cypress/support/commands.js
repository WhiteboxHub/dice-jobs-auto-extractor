// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })




  
 Cypress.Commands.add('loginDice', () => {
    const username = Cypress.config("Dice_username");
    
    const password = Cypress.config("Dice_password");


    // Increase pageLoadTimeout for this specific visit\

    cy.visit('https://www.dice.com/dashboard/login');
  
    // Type username and password, then click submit button
    cy.get('input[placeholder="Please enter your email"][type="email"][name="email"]').type(username);
    cy.get('button[data-testid="sign-in-button"]').click().wait(2000);
    cy.get('input[placeholder="Enter Password"]').type(password);
    cy.get('button[data-testid="submit-password"]').click();
    cy.wait(5000);
    
  
    // Optionally, add assertions or further actions after login
});

Cypress.Commands.add('visitDiceJobsPage', ({ keyword, start, pageSize}) => {
    
    const url = `https://www.dice.com/jobs?q=${(keyword)}&page=${start}&pageSize=${pageSize}`;
    cy.log(url);
    cy.visit(url,{ failOnStatusCode: false });
    cy.wait(5000);
});

