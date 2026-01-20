import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'tradesense_pro.db')
    print(f"Connecting to {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    try:
        c.execute("ALTER TABLE challenge ADD COLUMN yesterday_equity REAL")
        print("Added yesterday_equity")
    except Exception as e:
        print(f"Error adding yesterday_equity: {e}")

    try:
        c.execute("ALTER TABLE challenge ADD COLUMN last_equity_update TIMESTAMP")
        print("Added last_equity_update")
    except Exception as e:
        print(f"Error adding last_equity_update: {e}")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()