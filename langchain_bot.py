import os
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser


load_dotenv()
nvidia_key = os.getenv("NVIDIA_API_KEY")

if not nvidia_key:
    print(" Error: NVIDIA_API_KEY is missing from your .env file!")
    exit()

def generate_langchain_insights(dashboard_data):
    """Uses LangChain to orchestrate the AI analysis."""
    print(" Running LangChain pipeline via NVIDIA Cloud...")
    
    
    llm = ChatOpenAI(
        model="meta/llama-3.1-8b-instruct",
        openai_api_key=nvidia_key,
        openai_api_base="https://integrate.api.nvidia.com/v1",
        temperature=0.2,
        max_tokens=500
    )

 
    parser = JsonOutputParser()

    
    prompt = PromptTemplate(
        template="""You are an expert retail data analyst. Review this store data:
        
        {data}
        
        Write exactly 3 short, highly actionable business recommendations based on these numbers.
        
        {format_instructions}
        
        Ensure the output is a list of objects containing 'type' (success, warning, danger, info), 'title', and 'body'.""",
        input_variables=["data"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    
    chain = prompt | llm | parser

    
    try:
        
        result = chain.invoke({"data": json.dumps(dashboard_data)})
        return result
    except Exception as e:
        print(f"\n LangChain execution failed: {e}")
        return []


if __name__ == "__main__":
    
    try:
        with open("dashboard_output.json", 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        print(" Error: Could not find 'dashboard_output.json'.")
        exit()
        
    
    insights = generate_langchain_insights(data)
    
    
    print("\n" + "="*60)
    print(" LANGCHAIN AI INSIGHTS".center(60))
    print("="*60)
    
    for i, insight in enumerate(insights, 1):
        alert_type = insight.get("type", "info")
        icon = {"success": "✅", "warning": "⚠️", "danger": "🚨"}.get(alert_type, "💡")
        print(f"\n{i}. {icon} {insight.get('title', 'Insight').upper()}")
        print(f"   {insight.get('body', 'No details provided.')}")
        
    print("\n" + "="*60 + "\n")