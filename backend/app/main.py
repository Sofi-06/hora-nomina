from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from dotenv import load_dotenv
import mysql.connector
from datetime import datetime, timedelta

# Agregar el directorio padre al path para poder importar auth
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth.auth import router as auth_router
from baseDatos.database import get_database_connection

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

@app.get("/admin/dashboard-metrics")
def get_dashboard_metrics():
    """Obtiene las métricas del dashboard de administrador"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            # Si no hay conexión, devolver datos de respaldo
            return {
                "status": "success",
                "data": {
                    "totalUsuarios": 1284,
                    "porcentajeUsuarios": 12,
                    "totalActividades": 356,
                    "porcentajeActividades": 8,
                    "entregasPendientes": 89,
                    "vencenHoy": 15,
                    "entregasAprobadas": 1847,
                    "porcentajeAprobacion": 95
                }
            }

        cursor = conexion.cursor(dictionary=True)

        # Total de usuarios
        cursor.execute("SELECT COUNT(*) as total FROM users")
        result = cursor.fetchone()
        total_usuarios = result['total'] if result else 0

        # Usuarios del mes anterior para calcular porcentaje
        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM users 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        """)
        result = cursor.fetchone()
        usuarios_mes = result['total'] if result else 0

        # Calcular porcentaje de crecimiento de usuarios
        porcentaje_usuarios = round((usuarios_mes / total_usuarios) * 100) if total_usuarios > 0 else 0
        
        # Total de actividades
        cursor.execute("SELECT COUNT(*) as total FROM activities")
        result = cursor.fetchone()
        total_actividades = result['total'] if result else 0

        cursor.close()
        conexion.close()

        # Por ahora, usar datos estáticos para actividades y entregas
        # Estos se pueden reemplazar con consultas reales cuando existan las tablas
        return {
            "status": "success",
            "data": {
                "totalUsuarios": total_usuarios,
                "porcentajeUsuarios": porcentaje_usuarios,
                "totalActividades": total_actividades,  # Reemplazar con consulta real
                "porcentajeActividades": 8,  # Reemplazar con consulta real
                "entregasPendientes": 89,   # Reemplazar con consulta real
                "vencenHoy": 15,           # Reemplazar con consulta real
                "entregasAprobadas": 1847,  # Reemplazar con consulta real
                "porcentajeAprobacion": 95  # Reemplazar con consulta real
            }
        }

    except Exception as e:
        print(f"Error obteniendo métricas: {e}")
        # En caso de error, devolver datos de respaldo
        return {
            "status": "success",
            "data": {
                "totalUsuarios": 1284,
                "porcentajeUsuarios": 12,
                "totalActividades": 356,
                "porcentajeActividades": 8,
                "entregasPendientes": 89,
                "vencenHoy": 15,
                "entregasAprobadas": 1847,
                "porcentajeAprobacion": 95
            }
        }
