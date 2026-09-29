# 🚀 How to Deploy BhoomiSetu to Hugging Face Spaces (in 60 seconds)

### Step 1: Create a Space on Hugging Face
1. Go to **[huggingface.co/spaces](https://huggingface.co/spaces)**.
2. Click **Create new Space**.
3. Fill in:
   - **Space name:** `bhoomi-setu-ews`
   - **License:** `MIT`
   - **SDK:** `Gradio`
   - **Space Hardware:** `CPU Basic (Free)`
4. Click **Create Space**.

---

### Step 2: Upload or Push the Files
You can either upload the files directly via the Hugging Face Web UI, or use Git:

#### Method A: Direct Web UI Upload (Easiest)
In your new Space on Hugging Face:
1. Click **Files and versions** &rarr; **Add file** &rarr; **Upload files**.
2. Upload these 3 files from the `/hf_space` folder:
   - `README.md`
   - `requirements.txt`
   - `app.py`
3. Click **Commit changes to main**.

#### Method B: Using Git
```bash
git clone https://huggingface.co/spaces/<YOUR_HF_USERNAME>/bhoomi-setu-ews
cd bhoomi-setu-ews
cp /path/to/bhoomi-setu/hf_space/* .
git add .
git commit -m "Deploy BhoomiSetu XGBoost & TreeSHAP EWS Space"
git push
```

---

### Step 3: View Your Live Hugging Face Demo!
Within 30 seconds, Hugging Face will automatically build your Space and provide:
- Live Interactive 500-Tree XGBoost delay prediction.
- Dynamic Plotly TreeSHAP factor attributions.
- Counterfactual "What-If" simulator for District Collectors and Project Directors.
- Official permanent URL: `https://huggingface.co/spaces/<username>/bhoomi-setu-ews`
