from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from dotenv import load_dotenv
import mysql.connector

# Agregar el directorio padre al path para poder importar auth
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth.auth import router as auth_router

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 Conexión correcta usando variables reales
def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "seguimiento_cv_docentes"),
    )

# Incluir router
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "API de Seguimiento de CV de Docentes"}

# 🔥 Endpoint de prueba real
@app.get("/test-db")
def test_db():
    try:
        conexion = get_connection()

        if conexion.is_connected():
            cursor = conexion.cursor()
            cursor.execute("SELECT DATABASE();")
            database = cursor.fetchone()

            cursor.close()
            conexion.close()

            return {
                "status": "success",
                "message": "✅ Conectado correctamente a MySQL",
                "database": database[0]
            }
        else:
            return {
                "status": "error",
                "message": "No se pudo establecer conexión"
            }

    except mysql.connector.Error as err:
        return {
            "status": "error_mysql",
            "message": str(err)
        }

    except Exception as e:
        return {
            "status": "error_general",
            "message": str(e)
        }
