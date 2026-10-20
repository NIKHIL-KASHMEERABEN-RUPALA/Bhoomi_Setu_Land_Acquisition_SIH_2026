# 📦 BhoomiSetu — Serialized ML Model Artifacts

**Smart India Hackathon 2026 | Problem Statement ID: SIH26016**

This directory stores the trained, serialized machine learning artifacts produced by `ml/train.py` for high-throughput production inference.

---

## 🗃️ Artifact Inventory

| Artifact File | Size | Format | Description |
| :--- | :---: | :---: | :--- |
| **`bhoomi_xgb_pipeline.joblib`** | ~4.8 MB | Joblib Pickle | Complete Scikit-Learn `Pipeline` containing the `ColumnTransformer` (RobustScaler + OneHotEncoder) and regularized 500-Tree `XGBClassifier` (`tree_method='hist'`). |
| **`bhoomi_shap_explainer.joblib`** | ~3.2 MB | Joblib Pickle | Serialized `shap.TreeExplainer` for zero-latency local factor attribution calculation. |
| **`model_metadata.json`** | ~3 KB | JSON | Full training audit trail, cross-validation metrics (ROC-AUC 0.9738), hyperparameter configurations, and statutory risk thresholds. |
| **`sample_projects.json`** | ~12 KB | JSON | Sample holdout validation records across Highway, Railway, Metro, and Water corridors for offline testing. |

---

## 🔄 Re-training & Artifact Generation

To retrain the model and regenerate all serialized artifacts:
```bash
python ml/train.py
```
The script will perform stratified K-Fold cross validation and automatically update the `.joblib` and `.json` artifacts in this folder.
