# Setup Guide

## 1. Prerequisites

Before running BhoomiSetu locally, make sure you have:

- Node.js 18+ or later
- npm
- Python 3.10+
- pip
- optional: Bun (if you want to follow the project’s preferred frontend workflow)

## 2. Frontend setup

From the repository root:

```bash
npm install
npm run dev
```

This starts the Vite frontend on the configured host/port.

### Useful frontend commands

```bash
npm run build
npm run preview
npm run typecheck
npm run lint
```

## 3. Machine learning setup

```bash
cd ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 4. Train the model

From the repo root:

```bash
python3 ml/train.py
```

This generates the model artifacts in `models/`.

## 5. Run predictions

```bash
python3 ml/predict.py
```

## 6. Run what-if simulations

```bash
python3 ml/what_if.py
```

## 7. Start the API service

```bash
uvicorn ml.main_fastapi:app --host 0.0.0.0 --port 8000 --reload
```

Open the FastAPI docs at:

```text
http://localhost:8000/docs
```

## 8. Environment notes

The repo includes an `.env.example` file, which should be copied and configured for local deployment if the app uses environment variables.

Example:

```bash
cp .env.example .env
```

## 9. Local workflow recommendation

For development:

1. start the frontend with `npm run dev`
2. start the ML API with uvicorn
3. validate model output in the browser or API endpoint
4. keep the repo root clean and use docs folder for architecture notes

## 10. Troubleshooting

- If frontend fails to start, confirm Node dependencies are installed.
- If ML scripts fail, ensure the virtual environment is active and dependencies are installed.
- If the model file is missing, run `python3 ml/train.py` before inference.

## 11. Related files

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `ml/README.md`

