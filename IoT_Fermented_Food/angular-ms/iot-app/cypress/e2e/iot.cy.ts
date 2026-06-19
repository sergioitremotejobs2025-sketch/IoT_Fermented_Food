describe('Angular MS End-to-End Tests', () => {

    const testUser = {
        username: 'e2e_ui_tester',
        password: 'e2e_password'
    };

    const mockMicros = [
        { ip: '1.2.3.4', sensor: 'DHT11', measure: 'temp', name: 'Terrace' },
        { ip: '5.6.7.8', sensor: 'YI-AN', measure: 'humidity', name: 'Kitchen' }
    ];

    beforeEach(() => {
        // Setup intercepts
        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: { token: 'mock-jwt-token', user: testUser }
        }).as('loginRequest');

        cy.intercept('GET', '**/arduinos', {
            statusCode: 200,
            body: mockMicros
        }).as('getMicros');

        cy.visit('/');
    });

    it('Displays the homepage and premium header', () => {
        cy.contains('IoT_Microservices');
        cy.contains('Acceder').should('be.visible');
        cy.get('h1').should('have.css', 'font-family').and('include', 'Outfit');
    });

    it('Logs in successfully and displays dashboard with mock data', () => {
        cy.contains('Acceder').click();
        cy.get('input[formControlName="username"]').type(testUser.username);
        cy.get('input[formControlName="password"]').type(testUser.password);
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest');
        cy.wait('@getMicros');

        cy.get('.micro-card').should('have.length', 2);
        cy.contains('Terrace').should('be.visible');
    });

    describe('Feature Verification: Theme and Persistence', () => {
        it('Should toggle and persist theme across reloads', () => {
            cy.get('button[mattooltip="Cambiar tema"]').click();
            cy.get('html').should('have.attr', 'data-theme', 'dark');

            cy.reload();
            cy.get('html').should('have.attr', 'data-theme', 'dark');

            cy.get('button[mattooltip="Cambiar tema"]').click();
            cy.get('html').should('not.have.attr', 'data-theme', 'dark');
        });
    });

    describe('Device Configuration Flow', () => {
        beforeEach(() => {
            // Login for these tests
            cy.contains('Acceder').click();
            cy.get('input[formControlName="username"]').type(testUser.username);
            cy.get('input[formControlName="password"]').type(testUser.password);
            cy.get('button[type="submit"]').click();
            cy.wait(['@loginRequest', '@getMicros']);
        });

        it('Should navigate to edit device and update settings', () => {
            cy.intercept('PUT', '**/arduinos/*', {
                statusCode: 200,
                body: { ...mockMicros[0], name: 'Updated Terrace' }
            }).as('updateRequest');

            // Open menu and click configure
            cy.get('.micro-card').first().find('.action-btn').click();
            cy.contains('Configurar').click();

            cy.url().should('include', '/edit/1.2.3.4');

            // Form interaction
            cy.get('input[formControlName="name"]').clear().type('Updated Terrace');
            cy.get('button[type="submit"]').click();

            cy.wait('@updateRequest');
            cy.contains('Cambiado correctamente').should('be.visible');
        });
    });

    describe('Analytics and Health Verification', () => {
        it('Should navigate to Analytics and interact with chart controls', () => {
            cy.get('a[routerLink="/analytics"]').click();
            cy.url().should('include', '/analytics');
            
            cy.get('.dev-item').should('have.length', 2);
            cy.get('.dev-item').first().click();
            cy.get('.dev-item').first().should('have.class', 'selected');
            cy.get('canvas').should('be.visible');
        });

        it('Should navigate to Health and verify status indicators', () => {
            cy.get('a[routerLink="/device-health"]').click();
            cy.url().should('include', '/device-health');
            
            cy.get('.status-row').should('have.length', 2);
            cy.get('.uptime-bar').should('be.visible');
        });
    });
});
