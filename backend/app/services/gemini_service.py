import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path='.env')

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY tapılmadı. Zəhmət olmasa, backend/.env faylını yoxlayın.")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

def convert_natural_language_to_sql(natural_language_query, db_schema):
    """Təbii dil sorğusunu SQL-ə çevirir."""
    prompt = f"""
    Sən Azərbaycan dilində yazılmış təbii dil sorğularını SQLite SQL koduna çevirən peşəkar bir köməkçisən.
    Sənin vəzifən YALNIZ SQL kodunu qaytarmaqdır, heç bir əlavə izahat və ya formatlama vermə.
    Verilənlər bazasının sxemi aşağıdakı kimidir:
    {db_schema}
    İstifadəçinin sualını SQL-ə çevir: "{natural_language_query}"
    """
    try:
        response = model.generate_content(prompt)
        sql_query = response.text
        # Cavabı təmizləyirik
        if "```sql" in sql_query:
            sql_query = sql_query.replace("```sql", "").replace("```", "")
        return sql_query.strip()
    except Exception as e:
        return f"Gemini API xətası: {str(e)}"