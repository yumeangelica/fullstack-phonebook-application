describe('fullstack-phonebook-application', () => {
  it('frontend shows form', () => {
    cy.visit('https://fullstack-phonebook-application.fly.dev/')
    cy.contains('Add a new')
    cy.contains('name:')
    cy.contains('number:')
    cy.contains('add')
  })
})