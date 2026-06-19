describe('Environment Simulator End-to-End Tests', () => {

    const testUser = {
        username: 'e2e_ui_tester',
        password: 'e2e_password'
    };

    const mockMicros = [
        { ip: '1.2.3.4', sensor: 'FAKE', measure: 'temperature', name: 'Fake Fermentation 1' }
    ];

    const mockPayload = {
        username: testUser.username,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        iat: Math.floor(Date.now() / 1000)
    };
    const fakeToken = 'header.' + btoa(JSON.stringify(mockPayload)) + '.signature';

    beforeEach(() => {
        // Setup intercepts for login and microcontrollers
        cy.intercept('POST', '**/login', {
            statusCode: 200,
            body: { accessToken: fakeToken, refreshToken: 'mock-refresh-token' }
        }).as('loginRequest');

        cy.intercept('POST', '**/refresh', {
            statusCode: 200,
            body: { accessToken: fakeToken, refreshToken: 'mock-refresh-token' }
        }).as('refreshRequest');

        cy.intercept('GET', '**/microcontrollers', {
            statusCode: 200,
            body: mockMicros
        }).as('getMicros');

        cy.intercept('GET', '**/temperature*', {
            statusCode: 200,
            body: []
        }).as('getTemperature');

        cy.intercept('GET', '**/humidity*', {
            statusCode: 200,
            body: []
        }).as('getHumidity');

        cy.intercept('GET', '**/measures/history*', {
            statusCode: 200,
            body: []
        }).as('getMeasureHistory');

        // Setup intercept for the simulation pattern endpoint
        cy.intercept('POST', '**/simulation/pattern', {
            statusCode: 200,
            body: { success: true }
        }).as('setPattern');

        cy.viewport(1280, 720);
    });

    describe('Simulator Interaction', () => {
        beforeEach(() => {
            // Login flow
            cy.visit('/');
            cy.contains('Acceder').click({ force: true });
            cy.get('input[formControlName="username"]', { timeout: 10000 }).should('be.visible').type(testUser.username);
            cy.get('input[formControlName="password"]').should('be.visible').type(testUser.password);
            cy.get('button[type="submit"]').should('not.be.disabled').click();
            cy.wait('@loginRequest');
            cy.visit('/dashboard');
            cy.wait('@getMicros');
        });

        it('Should display the environment simulator when fake microcontrollers are present', () => {
            cy.get('app-environment-simulator').should('be.visible');
            cy.contains('Fermentation Environment Simulator').should('be.visible');
        });

        it('Should allow selecting "stalled" and show a success toast', () => {
            // Find the mat-select inside the simulator and click it
            cy.get('app-environment-simulator mat-select').click();
            
            // Select the "stalled" option from the opened mat-options
            cy.get('mat-option').contains('Stalled Fermentation').click();

            // Click the apply button
            cy.get('app-environment-simulator button').contains('Apply Pattern').click();

            // Wait for the intercept
            cy.wait('@setPattern');

            // Verify that the notification was called (toast appears)
            cy.get('.cdk-overlay-container').should('contain.text', 'Simulation pattern updated successfully');
        });
    });
});
