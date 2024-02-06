describe('fullstack-phonebook-application', () => {
  it('frontend shows form', () => {
    cy.visit('https://fullstack-phonebook-application.fly.dev/');
    cy.contains('Add a new');
    cy.contains('name:');
    cy.contains('number:');
    cy.contains('add');
  });

  it('frontend shows filter', () => {
    cy.visit('https://fullstack-phonebook-application.fly.dev/');
    cy.contains('Filter shown with');
    cy.get('input')
      .should('have.value', '');
  });
});
