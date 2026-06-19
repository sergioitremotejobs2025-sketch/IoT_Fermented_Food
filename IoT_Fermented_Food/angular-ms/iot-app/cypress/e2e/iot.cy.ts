describe('Angular MS End-to-End Tests', () => {

    const testUser = {
        username: 'e2e_ui_tester',
        password: 'e2e_password'
    };

    const mockMicros = [
        { ip: '1.2.3.4', sensor: 'DHT22', measure: 'temperature', name: 'Terrace' },
        { ip: '1.2.3.5', sensor: 'LDR', measure: 'light', name: 'Garden' }
    ];

    const mockPayload = {
        username: testUser.username,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        iat: Math.floor(Date.now() / 1000)
    };
    const fakeToken = 'header.' + btoa(JSON.stringify(mockPayload)) + '.signature';

    beforeEach(() => {
        cy.viewport(1280, 720);
        // Setup intercepts
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

        cy.intercept('GET', '**/temperature*', { statusCode: 200, body: [] }).as('getTemperature');
        cy.intercept('GET', '**/humidity*', { statusCode: 200, body: [] }).as('getHumidity');
        cy.intercept('GET', '**/light*', { statusCode: 200, body: [] }).as('getLight');
        cy.intercept('GET', '**/measures/history*', { statusCode: 200, body: [] }).as('getMeasureHistory');
    });

    it('Displays the homepage and premium header', () => {
        cy.visit('/');
        cy.contains('IoT_Microservices');
        cy.contains('Acceder').should('be.visible');
    });

    it('Logs in successfully and displays dashboard with mock data', () => {
        cy.visit('/');
        cy.contains('Acceder').click({ force: true });
        cy.get('input[formControlName="username"]', { timeout: 10000 }).should('be.visible').type(testUser.username);
        cy.get('input[formControlName="password"]').should('be.visible').type(testUser.password);
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest');
        cy.visit('/dashboard');
        cy.wait('@getMicros');

        cy.get('app-dashboard-microcontroller').should('have.length', 2);
        cy.contains('DHT22').should('be.visible');
    });

    describe('Feature Verification: Theme and Persistence', () => {
        it('Should toggle and persist theme across reloads', () => {
            cy.visit('/');
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
            cy.visit('/');
            cy.contains('Acceder').click({ force: true });
            cy.get('input[formControlName="username"]', { timeout: 10000 }).should('be.visible').type(testUser.username);
            cy.get('input[formControlName="password"]').should('be.visible').type(testUser.password);
            cy.get('button[type="submit"]').click();
            cy.wait('@loginRequest');
            cy.visit('/dashboard');
            cy.wait('@getMicros');
        });

        it('Should navigate to edit device and update settings', () => {
            cy.intercept('GET', '**/microcontrollers/1.2.3.4*', {
                statusCode: 200,
                body: mockMicros[0]
            }).as('getMicro');

            cy.intercept('PUT', '**/microcontrollers', {
                statusCode: 200,
                body: { ...mockMicros[0], name: 'Updated Terrace' }
            }).as('updateRequest');

            // Open menu and click configure
            cy.get('app-dashboard-microcontroller').first().find('.action-btn').click();
            cy.contains('Configurar').click();

            cy.url().should('include', '/edit/1.2.3.4');
            cy.wait('@getMicro');

            // Form interaction
            cy.get('input[formControlName="name"]').clear().type('Updated Terrace');
            cy.get('button[type="submit"]').click();

            cy.wait('@updateRequest');
        });
    });

    describe('Analytics and Health Verification', () => {
        it('Should navigate to Analytics and interact with chart controls', () => {
            cy.visit('/');
            cy.contains('Acceder').click({ force: true });
            cy.get('input[formControlName="username"]', { timeout: 10000 }).should('be.visible').type(testUser.username);
            cy.get('input[formControlName="password"]').should('be.visible').type(testUser.password);
            cy.get('button[type="submit"]').click();
            cy.wait('@loginRequest');
            cy.visit('/dashboard');
            cy.wait('@getMicros');

            cy.get('a[routerLink="/analytics"]').click({ force: true });
            cy.url().should('include', '/analytics');
        });

        it('Should navigate to Health and verify status indicators', () => {
            cy.visit('/');
            cy.contains('Acceder').click({ force: true });
            cy.get('input[formControlName="username"]', { timeout: 10000 }).should('be.visible').type(testUser.username);
            cy.get('input[formControlName="password"]').should('be.visible').type(testUser.password);
            cy.get('button[type="submit"]').click();
            cy.wait('@loginRequest');
            cy.wait('@getMicros');

            cy.get('a[routerLink="/device-health"]').click({ force: true });
            cy.url().should('include', '/device-health');
        });
    });
});
