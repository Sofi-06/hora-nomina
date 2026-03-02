import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv()

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

def login_user(email, password):
    try:
        conexion = get_connection()
        cursor = conexion.cursor(dictionary=True)

        query = """
        SELECT id, name, email, role
        FROM users
        WHERE email = %s AND password = %s
        """

        cursor.execute(query, (email, password))
        user = cursor.fetchone()

        cursor.close()
        conexion.close()

        if user:
            return {
                "success": True,
                "user": user
            }
        else:
            return {
                "success": False,
                "message": "Credenciales incorrectas"
            }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }