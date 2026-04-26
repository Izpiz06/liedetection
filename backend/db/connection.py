from flask_sqlalchemy import SQLAlchemy
import mysql.connector
from config import Config

db = SQLAlchemy()


def get_raw_connection():
    """Get a raw mysql-connector-python connection for stored procedure calls."""
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )


def call_procedure(name, args):
    """
    Call a MySQL stored procedure and return the result rows + column names.
    Used for submit_review and report_review.
    """
    conn = get_raw_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc(name, args)
        results = []
        for result in cursor.stored_results():
            results.extend(result.fetchall())
        conn.commit()
        return results
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()
