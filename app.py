from flask import Flask, render_template, jsonify, request
from eda import get_dashboard_data
from langchain_bot import generate_langchain_insights
import pandas as pd


app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/data")
def data():
    data = get_dashboard_data()

    
    insights = generate_langchain_insights(data)

    
    if not isinstance(insights, list) or len(insights) == 0:
        insights = [{
            "type": "info",
            "title": "AI not responding",
            "body": "Fallback recommendation shown."
        }]

    data["recommendations"] = insights

    return jsonify(data)



@app.route("/api/chat", methods=["POST"])
def chat():
    data = get_dashboard_data()
    insights = generate_langchain_insights(data)

    if not isinstance(insights, list):
        insights = [{"title": "Error", "body": "AI failed"}]

    return jsonify({"reply": insights})

import pandas as pd

@app.route("/api/upload", methods=["POST"])
def upload():
    global uploaded_data_store

    try:
        file = request.files["file"]
        df = pd.read_csv(file)

        kpis = {
            "rows": len(df),
            "columns": len(df.columns),
            "missing_values": int(df.isnull().sum().sum())
        }

        numeric_cols = df.select_dtypes(include=['int64','float64']).columns.tolist()

        chart_data = {}
        if numeric_cols:
            col = numeric_cols[0]
            chart_data = {
                "labels": list(range(len(df.head(20)))),
                "values": df[col].head(20).tolist(),
                "column": col
            }

        sample = df.head(20).to_dict()
        insights = generate_langchain_insights(sample)

        
        uploaded_data_store = {
            "kpis": kpis,
            "chart": chart_data,
            "recommendations": insights
        }

        return jsonify({"status": "success"})

    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route("/analysis")
def analysis():
    return render_template("analysis.html")


@app.route("/api/analysis-data")
def analysis_data():
    return jsonify(uploaded_data_store)

@app.route("/walmart-insights")
def walmart_insights():
    return render_template("walmart.html")

if __name__ == "__main__":
    app.run(debug=True)