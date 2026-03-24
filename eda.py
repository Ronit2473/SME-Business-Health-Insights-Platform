import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from langchain_bot import generate_langchain_insights
import os

# =========================
# LOAD DATA
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(BASE_DIR, "Walmart.csv")

df = pd.read_csv(file_path)

# =========================
# DATA CLEANING
# =========================
df["transaction_date"] = pd.to_datetime(df["transaction_date"])
df["promotion_type"] = df["promotion_type"].fillna("None")

df["promotion_applied"] = df["promotion_applied"].map({True: 1, False: 0, "TRUE": 1, "FALSE": 0})
df["holiday_indicator"] = df["holiday_indicator"].map({True: 1, False: 0, "TRUE": 1, "FALSE": 0})
df["stockout_indicator"] = df["stockout_indicator"].map({True: 1, False: 0, "TRUE": 1, "FALSE": 0})

# =========================
# FEATURE ENGINEERING
# =========================
df["revenue"] = (df["quantity_sold"] * df["unit_price"]).round(2)
df["month_key"] = df["transaction_date"].dt.to_period("M").astype(str)
df["week_key"] = df["transaction_date"].dt.to_period("W").astype(str)
df["weekday"] = df["transaction_date"].dt.day_name()

df["demand_error"] = df["actual_demand"] - df["forecasted_demand"]
df["inventory_gap"] = df["inventory_level"] - df["reorder_point"]
df["at_risk_stock"] = (df["inventory_gap"] < 0).astype(int)

# =========================
# KPI
# =========================
total_revenue = df["revenue"].sum()
avg_order = df["revenue"].mean()
total_orders = len(df)

stockout_count = df["stockout_indicator"].sum()
lost_revenue = stockout_count * avg_order

df["_mape"] = (abs(df["demand_error"]) / df["actual_demand"].clip(lower=1)).clip(upper=1)
forecast_acc = round((1 - df["_mape"].mean()) * 100, 1)

kpis = {
    "total_revenue": f"${total_revenue:,.0f}",
    "avg_order": f"${avg_order:,.0f}",
    "lost_revenue": f"${lost_revenue:,.0f}",
    "forecast_acc": f"{forecast_acc}%",
    "total_orders": f"{total_orders:,}",
    "stockout_count": int(stockout_count),
    "at_risk_products": int(df["at_risk_stock"].sum()),
}

# =========================
# TRENDS
# =========================
monthly = df.groupby("month_key")["revenue"].sum().reset_index().sort_values("month_key")
monthly["ma3"] = monthly["revenue"].rolling(3, min_periods=1).mean()

trend_data = {
    "labels": pd.to_datetime(monthly["month_key"]).dt.strftime("%b").tolist(),
    "revenue": monthly["revenue"].round(2).tolist(),
    "ma3": monthly["ma3"].round(2).tolist(),
}

# =========================
# ANOMALIES
# =========================
Q1, Q3 = df["revenue"].quantile(0.25), df["revenue"].quantile(0.75)
IQR = Q3 - Q1
lo, hi = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR

df["is_anomaly"] = ((df["revenue"] < lo) | (df["revenue"] > hi)).astype(int)

anomaly_data = {
    "count": int(df["is_anomaly"].sum()),
    "threshold_hi": round(hi, 2),
    "threshold_lo": round(lo, 2),
}

# =========================
# MODEL
# =========================
cat_cols = ["category", "store_location", "customer_loyalty_level",
            "payment_method", "promotion_type", "weather_conditions", "weekday"]

df_ml = df.copy()

for c in cat_cols:
    df_ml[c] = df_ml[c].astype(str)
    df_ml[c + "_enc"] = LabelEncoder().fit_transform(df_ml[c])

df_ml["month_num"] = pd.to_datetime(df_ml["month_key"]).dt.month

features = [
    "quantity_sold", "unit_price", "inventory_level", "reorder_point",
    "supplier_lead_time", "forecasted_demand", "promotion_applied",
    "holiday_indicator", "month_num"
] + [c + "_enc" for c in cat_cols]

X = df_ml[features].fillna(0)
y = df_ml["actual_demand"]

X_train, X_test, y_train, y_test = train_test_split(X, y, shuffle=False, test_size=0.2)

model = RandomForestRegressor(n_estimators=100, max_depth=8, n_jobs=-1)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

model_data = {
    "mae": round(mean_absolute_error(y_test, y_pred), 1),
    "mape": round(np.mean(np.abs((y_test - y_pred) / y_test.clip(lower=1))) * 100, 1),
    "next_demand": int(model.predict(X_test[:1])[0]),
}

# =========================
# FINAL OUTPUT
# =========================
final_output = {
    "kpis": kpis,
    "trends": trend_data,
    "anomalies": anomaly_data,
    "model": model_data,
}

# =========================
# FUNCTION FOR FLASK
# =========================
def get_dashboard_data():
    return final_output

# =========================
# MAIN EXECUTION
# =========================
if __name__ == "__main__":
    print("📊 Data processed")

    insights = generate_langchain_insights(final_output)

    print("\n🧠 AI INSIGHTS:\n")

    for i, ins in enumerate(insights, 1):
        print(f"{i}. {ins.get('title')}")
        print(f"   {ins.get('body')}\n")