import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

# --- Model Imports ---
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from catboost import CatBoostRegressor

# ==========================================
# 1. DATA PREPARATION (Quick Setup)
# ==========================================
print("Loading and preparing data...")
df = pd.read_csv('Walmart.csv')

# Handle dates and booleans
df["transaction_date"] = pd.to_datetime(df["transaction_date"])
bool_map = {True: 1, False: 0, "TRUE": 1, "FALSE": 0}
for col in ["promotion_applied", "holiday_indicator", "stockout_indicator"]:
    df[col] = df[col].map(bool_map)

df["month"] = df["transaction_date"].dt.month
df["weekday"] = df["transaction_date"].dt.day_name()

# Encode Text Categories to Numbers
cat_cols = ["category", "store_location", "weather_conditions", "weekday", "promotion_type"]
df_ml = df.copy()

label_encoders = {}

for c in cat_cols:
    df_ml[c] = df_ml[c].astype(str)
    le = LabelEncoder()
    df_ml[c + "_enc"] = le.fit_transform(df_ml[c])

# Define Features (X) and Target (y)
feature_cols = [
    "quantity_sold", "unit_price", "inventory_level", "promotion_applied",
    "holiday_indicator", "month"
] + [c + "_enc" for c in cat_cols]

X = df_ml[feature_cols].fillna(0)
y = df_ml["actual_demand"]

# Split the data (80% for training, 20% for testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


# ==========================================
# 2. MULTI-MODEL TRAINING LOOP
# ==========================================
print("\n🚀 Starting Model Training Pipeline...")

# Define the models we want to test
models = {
    "Baseline: Linear Regression": LinearRegression(),
    "Tree: Random Forest": RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1),
    "Boosting: XGBoost": XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42),
    "Boosting: CatBoost": CatBoostRegressor(iterations=100, depth=6, learning_rate=0.1, random_state=42, verbose=0)
}

# Dictionary to hold the final scores
performance_results = {}

# Loop through each model
for name, model in models.items():
    print(f"Training {name}...")
    
    # 1. Train the model
    model.fit(X_train, y_train)
    
    # 2. Make predictions on the unseen test set
    y_pred = model.predict(X_test)
    
    # 3. Calculate accuracy metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    # 4. Save the results
    performance_results[name] = {
        "MAE": round(mae, 2),
        "RMSE": round(rmse, 2)
    }

# ==========================================
# 3. DISPLAY THE LEADERBOARD
# ==========================================
print("\n" + "="*50)
print("🏆 MODEL PERFORMANCE LEADERBOARD")
print("="*50)

# Sort the results by MAE (lowest error wins)
sorted_results = dict(sorted(performance_results.items(), key=lambda item: item[1]["MAE"]))

import json
print(json.dumps(sorted_results, indent=4))
print("="*50)

import joblib

# ... (All your previous training and leaderboard code) ...

# 1. Grab the winning model from your dictionary
winning_model = models["Baseline: Linear Regression"]

# 2. Save the trained model to a file
joblib.dump(winning_model, 'demand_model.pkl')

# 3. Save the Label Encoders (Crucial for translating future text inputs!)
joblib.dump(label_encoders, 'label_encoders.pkl')

print("\n AI Brain successfully frozen and saved to disk!")