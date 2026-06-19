# Day 2 Plan: The "Red" Phase - AI Service Bootstrapping

This plan outlines the specific tasks to complete **Day 2** of the TDD Mastery roadmap. The goal is to introduce the first unit tests to the `ai-ms` Python service using a TDD approach.

---

## 📋 Task List

### 1. Environment Setup (Bootstrapping Pytest)
Prepare the `ai-ms` microservice for automated testing.
- [x] **Create `test/` directory**: `mkdir -p ai-ms/test`
- [x] **Create `pytest.ini`**: Add standard configuration to `ai-ms/pytest.ini`.
- [x] **Update `requirements.txt`**: Add `pytest`, `pytest-cov`, and `mongomock` for database isolation.
- [x] **Install test dependencies**: `cd ai-ms && pip install -r requirements.txt`

### 2. TDD for `DataProcessor` (Unit Testing)
Implement tests for the core data manipulation logic in `data_processor.py`.
- [x] **Test Case 1: Minimum Data (Red)**: Write a test ensuring `prepare_data` returns `None` if input data is shorter or equal to `look_back`.
- [x] **Test Case 2: Data Scaling (Red)**: Write a test verifying `prepare_data` correctly scales values between 0 and 1.
- [x] **Test Case 3: Shape Verification (Red)**: Write a test ensuring the output `X` has the shape `(N, look_back)`.
- [x] **Implementation (Green)**: Run the tests and ensure they pass with existing or minimal fixes.

### 3. TDD for `Trainer` (Mocking & Integration)
Implement tests for the LSTM model training process in `trainer.py`.
- [x] **Mock MongoDB**: Use `mongomock` to simulate data retrieval for training.
- [x] **Test Case 4: Training flow (Red)**: Write a test verifying `train_model` handles empty data gracefully.
- [x] **Test Case 5: Model Persistence (Red)**: Write a test ensuring the trained model is saved correctly using `joblib`.

### 4. API Endpoint Testing (Flask)
Test the web interface of the AI service.
- [x] **Test Case 6: `/predict` endpoint (Red)**: Write a failing test for invalid input data (e.g., non-numerical lists).
- [x] **Test Case 7: `/train` route (Red)**: Ensure the training process can be triggered via API.

---

## 🛠 Commands for Today

| Task | Command |
| :--- | :--- |
| **Install** | `cd ai-ms && pip install pytest pytest-cov mongomock` |
| **Run Tests** | `cd ai-ms && pytest --cov=src` |
| **Check Results**| `cat ai-ms/test_output.txt` |

---

- [x] Initial `pytest` infrastructure in `ai-ms`.
- [x] At least 10 unit tests for `data_processor.py` and `trainer.py`.
- [x] Updated `CURRENT_COVERAGE.md` showing >50% coverage for `ai-ms`.

---

## 🔝 5. Road to 100% Coverage
Close the gap from 84% to 100% by testing edge cases and missing branches.
- [x] **DataProcessor Coverage (95% -> 100%)**: Test `inverse_transform` with real scaler state (no mock).
- [x] **Trainer Coverage (97% -> 100%)**: Simulate `X is None` from processor during `train()`.
- [x] **API Negative Testing (83% -> 100%)**:
    - [x] Test `/health` endpoint.
    - [x] Test `/train` with missing parameters (400).
    - [x] Test `/train` with failure return from Trainer (500).
    - [x] Test `/predict` with non-existent model (404).
    - [x] Test `/predict` exception handling (500).
- [x] **Model Logic (57% -> 100%)**: Test `create_lstm_model` architecture without mocking the whole function (mocking just `Sequential`).
- [x] **Database Setup (33% -> 100%)**: Test `get_db` with environment variable overrides.
