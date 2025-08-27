from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import gemini_service
from app.db import database

router = APIRouter()

# Frontend-dən gələcək sorğunun modelini təyin edirik
class QueryRequest(BaseModel):
    query: str


@router.get("/tables")
async def get_available_tables():
    """Mövcud cədvəllərin siyahısını qaytarır."""
    try:
        from app.db.database import get_db_connection
        
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Verilənlər bazası əlaqəsi yaradıla bilmədi")
        
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables]
        
        conn.close()
        
        return table_names
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cədvəllər alınarkən xəta: {str(e)}")



@router.post("/query")
async def process_query(request: QueryRequest):
    """Frontend-dən gələn sorğunu qəbul edir, SQL-ə çevirir və nəticəni qaytarır."""
    try:
        # 1. Baza sxemini alırıq
        db_schema = database.get_db_schema()
        if not db_schema:
            raise HTTPException(status_code=500, detail="Verilənlər bazası sxemi alına bilmədi.")

        # 2. Təbii dili SQL-ə çeviririk
        sql_query = gemini_service.convert_natural_language_to_sql(request.query, db_schema)
        
        # Əgər Gemini xəta qaytarsa
        if "Gemini API xətası" in sql_query:
             raise HTTPException(status_code=500, detail=sql_query)

        # 3. SQL-i icra edib nəticəni alırıq
        result = database.execute_sql_query(sql_query)
        
        # Əgər SQL icrası zamanı xəta olsa
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # 4. Nəticəni və SQL-i frontend-ə qaytarırıq
        return {"generated_sql": sql_query, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gözlənilməyən xəta baş verdi: {str(e)}")
    




