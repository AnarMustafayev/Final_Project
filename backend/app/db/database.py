import sqlite3
import pandas as pd
import os

# Get the absolute path to the database
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "backend", "app", "db", "sales.db")

# Alternative path if the above doesn't work
if not os.path.exists(DB_PATH):
    # Try relative path from current file location
    current_dir = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(current_dir, "sales.db")

def get_db_schema():
    """Verilənlər bazasının sxemini CREATE TABLE formatında qaytarır."""
    schema = ""
    try:
        print(f"Trying to connect to database at: {DB_PATH}")
        
        # Check if database file exists
        if not os.path.exists(DB_PATH):
            print(f"Database file not found at: {DB_PATH}")
            # Try to create the database
            create_database_if_not_exists()
            
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Bütün cədvəllərin adlarını alırıq
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print("No tables found in database")
            conn.close()
            return None
            
        # Hər cədvəlin quruluşunu alırıq
        for table_name in tables:
            cursor.execute(f"SELECT sql FROM sqlite_master WHERE name='{table_name[0]}'")
            result = cursor.fetchone()
            if result:
                schema += result[0] + ";\n"
                
        conn.close()
        print(f"Schema retrieved successfully: {len(tables)} tables found")
        return schema
        
    except Exception as e:
        print(f"Sxem alınarkən xəta baş verdi: {e}")
        print(f"Database path: {DB_PATH}")
        print(f"Database exists: {os.path.exists(DB_PATH)}")
        return None

def execute_sql_query(sql_query):
    """SQL sorğusunu icra edir və nəticəni JSON formatında qaytarır."""
    try:
        print(f"Executing SQL: {sql_query}")
        
        # Check if database file exists
        if not os.path.exists(DB_PATH):
            return {"error": f"Database file not found at: {DB_PATH}"}
            
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query(sql_query, conn)
        conn.close()
        
        # Pandas DataFrame-i JSON-a çeviririk
        result = df.to_dict(orient='records')
        print(f"Query executed successfully, returned {len(result)} rows")
        return result
        
    except Exception as e:
        error_msg = f"SQL icrası zamanı xəta: {str(e)}"
        print(error_msg)
        return {"error": error_msg}

def create_database_if_not_exists():
    """Creates the database with sample data if it doesn't exist."""
    try:
        print(f"Creating database at: {DB_PATH}")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS filiallar (
            id INTEGER PRIMARY KEY,
            filial_adi TEXT NOT NULL,
            seher TEXT
        )
        ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS satislar (
            id INTEGER PRIMARY KEY,
            filial_id INTEGER REFERENCES filiallar(id),
            satis_miqdari REAL NOT NULL,
            satis_tarixi DATE NOT NULL
        )
        ''')

        # Məlumatların mövcudluğunu yoxlayırıq
        cursor.execute("SELECT COUNT(*) FROM filiallar")
        if cursor.fetchone()[0] == 0:
            filiallar_data = [
                (1, 'Mərkəz Filialı', 'Bakı'),
                (2, 'Gənclik Filialı', 'Bakı'),
                (3, 'Sumqayıt Filialı', 'Sumqayıt'),
                (4, 'Gəncə Filialı', 'Gəncə')
            ]
            cursor.executemany('INSERT INTO filiallar VALUES (?, ?, ?)', filiallar_data)
            print("Filial data inserted")

        cursor.execute("SELECT COUNT(*) FROM satislar")
        if cursor.fetchone()[0] == 0:
            satislar_data = [
                (1, 1, 1200.50, '2025-04-15'), (2, 2, 2500.00, '2025-04-18'),
                (3, 3, 950.75, '2025-05-02'), (4, 1, 1800.00, '2025-05-10'),
                (5, 4, 1500.25, '2025-05-12'), (6, 2, 3100.00, '2025-06-01'),
                (7, 3, 1100.00, '2025-06-05'), (8, 1, 2200.50, '2025-06-20')
            ]
            cursor.executemany('INSERT INTO satislar VALUES (?, ?, ?, ?)', satislar_data)
            print("Sales data inserted")

        conn.commit()
        conn.close()
        print(f"Database created successfully at: {DB_PATH}")
        
    except Exception as e:
        print(f"Error creating database: {e}")

# Test function
def test_database():
    """Test database connection and show some data."""
    try:
        schema = get_db_schema()
        if schema:
            print("✅ Database schema retrieved successfully")
            print("Schema preview:", schema[:200] + "...")
        else:
            print("❌ Failed to get database schema")
            
        # Test a simple query
        result = execute_sql_query("SELECT * FROM filiallar LIMIT 3")
        if isinstance(result, list):
            print("✅ Query executed successfully")
            print("Sample data:", result)
        else:
            print("❌ Query failed:", result)
            
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_database()