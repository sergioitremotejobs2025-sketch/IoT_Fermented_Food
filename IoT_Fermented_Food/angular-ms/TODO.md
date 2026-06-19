# TODO: Future Functionalities for Angular Microservice (angular-ms)

## 1. Advanced Data Visualization & Export
- [x] **Interactive Time-Series Charts**: Implement historical charts (e.g., using Chart.js or ECharts) with adjustable time ranges (Last 24h, 7 Days, 30 Days) for Temperature and Humidity.
    - [x] Create `MeasureService` mock and write failing tests ensuring `ChartComponent` calls data endpoints with correct time-range parameters.
    - [x] Write component tests to verify the UI dynamically updates to display loading states, error states, and rendering the mock chart canvas.
    - [x] Implement `ChartComponent` logic to pass the tests (Green).
    - [x] Write integration tests simulating user interactions (changing time range dropdowns) and asserting events fire correctly.
    - [x] Execute `ng test --code-coverage` and refactor `ChartComponent` to ensure 100% statement, branch, function, and line coverage.
- [x] **Data Export**: Add functionality to export sensor data history as CSV or JSON reports for external analysis.
    - [x] Write pure utility function unit tests for `ExportCsvUtil` asserting accurate JSON-to-CSV string conversions (including edge cases like null values).
    - [x] Write unit tests for `DataExportService` by spying on and mocking the DOM `Blob` and `document.createElement('a')` APIs to verify download triggers.
    - [x] Implement export core logic.
    - [x] Create UI tests asserting the Export button correctly disables while processing and triggers the service method.
    - [x] Refactor and verify 100% coverage on all export-related files.

## 2. Alerts and Notifications
- [x] **Threshold Configuration UI**: Allow users to set custom minimum and maximum threshold values for sensors (e.g., alert if Temperature > 30°C).
    - [x] Write unit tests for `ThresholdConfigComponent` utilizing Angular Reactive Forms, asserting validity states natively (e.g. `min` strictly less than `max`).
    - [x] Test the submit emission: verify that clicking save patches the correct payload to the mocked `ThresholdService`.
    - [x] Implement the Reactive Form and template to pass the tests.
    - [x] Write tests verifying error handling (e.g., displaying custom error messages when 400 Bad Request is returned).
    - [x] Polish component to meet the 100% code coverage threshold.
- [x] **Real-time Notifications**: Implement a notification center (toast messages or a side panel) to alert users when a sensor metric triggers a threshold or a device disconnects.
    - [x] Write isolated unit tests for `NotificationService`, testing state array mutations (pushing notifications, auto-dismiss `setTimeout` clearing).
    - [x] Test `NotificationPanelComponent` by mocking the `NotificationService` stream and asserting correct list rendering in the DOM.
    - [x] Implement Service and UI.
    - [ ] Write integration specifications providing mock WebSocket/SSE events, ensuring they correctly map to the application's global state stream.
    - [x] Verify 100% test coverage including private methods and subscription cleanup (`ngOnDestroy`).

## 3. Device Management
- [x] **Device Overview Page**: Create a dedicated view to list all registered microcontrollers, showing their current status (Online/Offline), last seen time, and configuration.
    - [x] Write tests for `MicrocontrollersService` asserting correct HTTP GET behavior and data mapping using `HttpTestingController`.
    - [x] Write UI tests for `DeviceOverviewComponent` ensuring accurate `*ngFor` table/list rendering given an array of mock devices.
    - [x] Write tests for pipeline logic: search input filtering and status sorting.
    - [x] Implement components to turn specifications green.
    - [x] Run coverage reports to explicitly guarantee 100% testing on the overview page module.
- [x] **Register/Edit Devices**: UI forms to allow users to add new microcontrollers or pair simulator instances directly from the frontend.
    - [x] Define comprehensive unit tests for `DeviceFormComponent` containing custom async validators (e.g., checking uniqueness) and standard synchronous validators (IP/MAC regex).
    - [x] Implement form group bindings and validators to satisfy the tests.
    - [x] Test component output by simulating button clicks and confirming `DeviceService.create()` or `.update()` is invoked with precise shapes.
    - [x] Create tests simulating 409 Conflict constraints ensuring the UI alerts the user of existing hardware mappings.
    - [x] Attain 100% test coverage across the device editing features.


