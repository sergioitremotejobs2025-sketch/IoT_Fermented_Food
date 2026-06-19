# IoT Microservices - UI Technical Debt

## History Page (Immediate Fixes)
- [x] **Overlapping Labels**: Fixed by implementing `floatLabel="always"` and CSS positioning overrides.
- [x] **Vertical Alignment**: Aligned "Analizar Datos" button and form fields using refined flexbox rules.
- [x] **Contrast & Readability**: Updated chart axis colors to Slate (#64748b) for better contrast.
- [x] **Chart Spacing**: Adjusted margins and padding in the glass-panel containers.
- [x] **Mobile Responsiveness**:
    - [x] Fix Navbar overlap where toolbar items collide with page titles.
    - [x] Correct layout stacking for form inputs on screens < 768px.
    - [x] Add horizontal padding to cards for mobile view.
- [x] **UX Polish**: Improve visibility of "zoom" and "reset" instructions for the interactive chart.
- [x] **Critical: Calendar Button Failure**: Resolved by removing rogue `display: none` CSS.
- [x] **Critical: Datepicker CSS**: Fixed by importing Angular Material prebuilt theme.


## General Dashboard
- [ ] Fix potential 3D hover interference with child button click events.
- [x] **Standardize card heights**: Set consistent 420px height for dashboard cards.
