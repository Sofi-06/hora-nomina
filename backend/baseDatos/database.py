import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling

# Cargar variables de entorno
load_dotenv()

# Configuración de la base de datos
def get_database_connection():
    """Obtiene una nueva conexión a la base de datos"""
    try:
        conexion = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "seguimiento_cv_docentes"),
            autocommit=True
        )
        return conexion
    except Exception as e:
        return None

def test_connection():
    """Prueba la conexión a la base de datos"""
    conexion = get_database_connection()
    if conexion:
        try:
            cursor = conexion.cursor(dictionary=True)
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            cursor.close()
            conexion.close()
            return True
        except Exception as e:
            if conexion:
                conexion.close()
            return False
    return False