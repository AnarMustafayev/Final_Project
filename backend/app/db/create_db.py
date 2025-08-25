import sqlite3
import os

def create_database():
    # Get the directory where this script is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'sales.db')
    
    print(f"Creating database at: {db_path}")
    
    conn = sqlite3.connect(db_path)
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
    print(f"Database 'sales.db' successfully created/updated at: {db_path}")

if __name__ == '__main__':
    create_database()