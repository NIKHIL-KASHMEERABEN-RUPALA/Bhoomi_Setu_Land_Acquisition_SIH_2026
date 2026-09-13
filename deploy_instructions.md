# BhoomiSetu ML Model Hosting & API Key Quickstart Guide

This guide explains how to run, manage API keys, and host your **Land Acquisition Early Warning System (BhoomiSetu)** machine learning model.

---

## 1. Fast Local Hosting (Ready Immediately)

To start the model hosting service right now on your machine:

```powershell
python run_server.py
```

- **Interactive Web Portal & Playground**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/api/v1/health`

---

## 2. API Key Management

Authentication is enforced via API keys. Your initial Master API Key has been generated and saved to [api_keys.json](file:///d:/coding/Random%20Stuff/Hackathon/api_keys.json) and [.env](file:///d:/coding/Random%20Stuff/Hackathon/.env).

### View Existing Keys
```powershell
python key_manager.py list
```

### Get Active Master Key
```powershell
python key_manager.py get-default
```

### Generate a New API Key
```powershell
python key_manager.py create --name "Hackathon Evaluation Team"
```

### Revoke an API Key
```powershell
python key_manager.py revoke --key <key_string_or_key_id>
```

---

## 3. How to Call the Model API

### Authentication Headers
Pass your key in any of the following ways:
- **Header**: `X-API-Key: <your_key>` *(Recommended)*
- **Bearer Token**: `Authorization: Bearer <your_key>`
- **Query Param**: `?api_key=<your_key>`

### Example 1: cURL
```bash
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "project_id": "PRJ_DEMO_01",
    "state": "Maharashtra",
    "district": "Pune",
    "project_type": "Highways",
    "project_cost": 1450.0,
    "land_acquired_pct": 38.5,
    "possession_pct": 28.0,
    "compensation_pending_pct": 62.4,
    "court_case_count": 8,
    "legal_case_count": 12
  }'
```

### Example 2: Python (`requests`)
```python
import requests

url = "http://localhost:8000/api/v1/predict"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "project_id": "PRJ_NH_48",
    "state": "Maharashtra",
    "district": "Pune",
    "project_cost": 1450.0,
    "land_acquired_pct": 38.5,
    "possession_pct": 28.0,
    "compensation_pending_pct": 62.4,
    "court_case_count": 8
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

### Example 3: JavaScript (`fetch`)
```javascript
const res = await fetch("http://localhost:8000/api/v1/predict", {
  method: "POST",
  headers: {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    project_id: "PRJ_EXPRESSWAY",
    state: "Uttar Pradesh",
    district: "Lucknow",
    court_case_count: 10
  })
});
const result = await res.json();
console.log(result);
```

---

## 4. Free Public Hosting (Instant Worldwide HTTPS URL)

If you need a live public URL for remote hackathon judges or team members without deploying to cloud:

### Option A: Cloudflare Tunnel (Recommended - 100% Free, No Account Needed)
1. Download `cloudflared` (or run via winget):
   ```powershell
   winget install Cloudflare.cloudflared
   ```
2. Start the tunnel to your local server:
   ```powershell
   cloudflared tunnel --url http://localhost:8000
   ```
3. Cloudflare will print a public HTTPS URL (e.g. `https://random-words.trycloudflare.com`). Anyone worldwide can now send requests to your model API!

### Option B: Ngrok
```powershell
ngrok http 8000
```

---

## 5. Cloud Hosting Options

### Option A: Render (Free Web Service)
1. Push this folder to a GitHub repository.
2. Go to [dashboard.render.com](https://dashboard.render.com/) -> **New Web Service**.
3. Select your repository.
4. Render will automatically detect [render.yaml](file:///d:/coding/Random%20Stuff/Hackathon/render.yaml) or set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add an Environment Variable: `BHOOMI_API_KEY=your_chosen_api_key`.

### Option B: Hugging Face Spaces (Docker Space)
1. Create a new Space on [Hugging Face](https://huggingface.co/spaces) with **Docker** SDK.
2. Push the files ([Dockerfile](file:///d:/coding/Random%20Stuff/Hackathon/Dockerfile), `app.py`, `key_manager.py`, `models/`, `static/`, `requirements.txt`).
3. Set Secret `BHOOMI_API_KEY` in Space Settings.
4. Your model API will be hosted with free 16GB RAM and public HTTPS URL.

### Option C: Docker Container
```powershell
docker build -t bhoomisetu-api .
docker run -p 8000:8000 -e BHOOMI_API_KEY="your_api_key" bhoomisetu-api
```
