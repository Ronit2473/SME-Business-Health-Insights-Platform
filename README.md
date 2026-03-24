# 📊 SME Business Health Insights Platform

Empowering Small Businesses with AI-Driven Predictive Analytics
The SME Business Health Insights Platform is an all-in-one data intelligence tool designed to bridge the gap between raw business data and actionable strategy. Built for the nebulon hackathon, this platform provides small business owners with the same predictive power used by retail giants.


# 🏗️ System Architecture
Our platform follows a modern 3-tier AI architecture, separating data ingestion, processing, and multi-model intelligence.

graph TD

    %% User Layer
    User((Business Owner)) <-->|Uploads CSV / Chats| UI[Web Dashboard]

    %% Frontend Layer
    subgraph Frontend [Client Layer]
        UI -->|POST /api/upload| Flask[Flask API Bridge]
        UI -->|POST /api/chat| Flask
        UI -->|POST /api/predict| Flask
    end

    %% Backend Layer
    subgraph Backend [Logic Engine]
        Flask <--> EDA[Pandas Data Engine]
        EDA -->|Cleaned Metrics| UI
    end

    %% AI/ML Layer
    subgraph Intelligence [Intelligence Layer]
        ML[Scikit-Learn: Demand Predictor]
        LLM[LangChain + NVIDIA Llama 3.1]
    end

# 🚀 Key Features
🔮 Predictive Demand Modeling: Uses a trained Scikit-Learn Linear Regression model to forecast future inventory needs based on price, weather, holidays, and promotions.

💬 Conversational Data Agent: A LangChain-powered chatbot using Llama 3.1 that allows users to "talk to their data" in plain English. No SQL required.

📊 Automated KPI Dashboard: Instantly calculates critical business metrics (Missing values, Row counts, Numeric distributions) using Pandas.

💡 AI Strategic Recommendations: Automatically generates 3 high-value business moves based on current dashboard data.


# 🛠️ Tech Stack

🌐 Client Layer (Frontend): 
HTML5, CSS3, Vanilla JavaScript
Focus: Zero-dependency, lightning-fast UI.

⚙️ Core Engine (Backend): 
Python & Flask (API Routing)
Pandas (Data Processing & KPI Extraction)

🧠 Intelligence Layer (AI & ML):
Machine Learning (Linear Regression Demand Modeling)
LangChain + NVIDIA Llama 3.1 NIM (Generative AI & Chat Agent)


# 📈 Impact & Benefits
Better Decision-Making: Move from "gut feeling" to data-backed strategies.

Improved Efficiency: Instantly identify top-performing products and sales trends.

Reduces Manual Work: Automation of data cleaning saves hours of spreadsheet management.

Predictive Insights: Anticipate market shifts before they happen.

Affordable AI for SMEs: Enterprise-grade tools delivered in a cost-effective package.
