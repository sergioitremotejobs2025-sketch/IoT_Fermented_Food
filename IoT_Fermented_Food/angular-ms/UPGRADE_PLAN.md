# 🚀 Angular v18 Upgrade Roadmap

This document outlines the systematic approach to upgrading the `angular-ms` microservice from Angular v15 to v18.

## 📋 Status Dashboard
- **Current Version**: v15.2.x
- **Target Version**: v18.0.x
- **Risk Level**: High (Multi-version jump)

---

## 🛠️ Phase 1: Preparation & Environment (Ready)
- [ ] **Node.js Upgrade**: Ensure Node.js v18.19+ or v20.x is active (v20 recommended).
- [ ] **Dependency Audit**: Identify breaking changes in `ng2-google-charts`, `ngx-lottie`, and `angular-material`.
- [ ] **Git Snapshot**: Create a `feature/ng18-upgrade` branch.

## 🚀 Phase 2: The Migration Jump
- [ ] **v15 -> v16**:
    - `ng update @angular/core@16 @angular/cli@16`
    - Verify `rxjs` compatibility.
    - Address `initialNavigation` change (now `enabledNonBlocking`).
- [ ] **v16 -> v17**:
    - `ng update @angular/core@17 @angular/cli@17`
    - Introduce **Standalone Components** migration (optional but beneficial).
    - Adopt **Control Flow Syntax** (`@if`, `@for`).
- [ ] **v17 -> v18**:
    - `ng update @angular/core@18 @angular/cli@18`
    - Verify `zone.js` status.

## 💎 Phase 3: Modernization (v18 Features)
- [ ] **Signals Integration**: Refactor `LanguageService` and `ThemeService` to use Angular Signals.
- [ ] **Zoneless Setup**: Experiment with `provideExperimentalZonelessChangeDetection()` for performance.
- [ ] **Hydration**: Enable client-side hydration if SSR is implemented.

---

## 🧪 Testing Protocol (TDD)
1. **Incremental Tests**: Run `npm test` after EACH minor version jump.
2. **Regression Suite**: Verify that Dashboard charts and AI predictors still function post-upgrade.
3. **Build Validation**: Perform a production build `npm run build` to catch AOT compilation issues.
