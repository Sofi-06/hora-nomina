from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
from dotenv import load_dotenv
import mysql.connector
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
import bcrypt

# Agregar el directorio padre al path para poder importar auth
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from auth.auth import router as auth_router
from baseDatos.database import get_database_connection

load_dotenv()

app = FastAPI()

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    user_type: Literal["Admin", "Docente", "Director"]
    identification_type: Literal["CC", "CE"] = "CC"
    identification: str
    gender: Literal["Femenino", "Masculino"]
    state: Literal["Activo", "Inactivo"] = "Activo"
    department_id: Optional[int] = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        conexion = get_database_connection()

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
        
       
        cursor = conexion.cursor(dictionary=True)

  
        cursor.execute("SELECT COUNT(*) as total FROM users")
        result = cursor.fetchone()
        total_usuarios = result['total'] if result else 0

        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM users 
            WHERE MONTH(created_at) = MONTH(CURDATE()) 
            AND YEAR(created_at) = YEAR(CURDATE())
        """)
        result = cursor.fetchone()
        usuarios_mes = result['total'] if result else 0
        porcentaje_usuarios = round((usuarios_mes / total_usuarios) * 100) if total_usuarios > 0 else 0


        cursor.execute("SELECT COUNT(*) as total FROM activities")
        result = cursor.fetchone()
        total_actividades = result['total'] if result else 0

        cursor.execute("SELECT COUNT(*) as total FROM activities WHERE state = 'Aprobado'")
        result = cursor.fetchone()
        entregasAprobadas = result['total'] if result else 0
        porcentajeAprobacion = round((entregasAprobadas / total_actividades) * 100) if total_actividades > 0 else 0


        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM activities 
            WHERE MONTH(created_at) = MONTH(CURDATE()) 
            AND YEAR(created_at) = YEAR(CURDATE())
        """)
        result = cursor.fetchone()
        actividades_mes = result['total'] if result else 0
        porcentajeActividades = round((actividades_mes / total_actividades) * 100) if total_actividades > 0 else 0

        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM activities 
            WHERE state IN ('Revisión', 'Con observaciones')
        """)
        result = cursor.fetchone()
        entregasPendientes = result['total'] if result else 0

        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM activities 
            WHERE state IN ('Revisión', 'Con observaciones')
            AND MONTH(created_at) = MONTH(CURDATE())
        """)
        result = cursor.fetchone()
        vencenHoy = result['total'] if result else 0

        cursor.close()
        conexion.close()

        response_data = {
            "totalUsuarios": total_usuarios,
            "porcentajeUsuarios": porcentaje_usuarios,
            "totalActividades": total_actividades,
            "porcentajeActividades": porcentajeActividades,
            "entregasPendientes": entregasPendientes,
            "vencenHoy": vencenHoy,
            "entregasAprobadas": entregasAprobadas,
            "porcentajeAprobacion": porcentajeAprobacion
        }
        
        print(f"✅ Dashboard metrics: {response_data}")
        
        return {
            "status": "success",
            "data": response_data
        }

    except Exception as e:
        print(f"❌ Error obteniendo métricas: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e),
            "data": {
                "totalUsuarios": 0,
                "porcentajeUsuarios": 0,
                "totalActividades": 0,
                "porcentajeActividades": 0,
                "entregasPendientes": 0,
                "vencenHoy": 0,
                "entregasAprobadas": 0,
                "porcentajeAprobacion": 0
            }
        }
        
# Endpoint de usuarios
        
@app.get("/admin/users")
def get_users():
    """Obtiene la lista de todos los usuarios"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        
        cursor = conexion.cursor(dictionary=True)
        
        # Obtener todos los usuarios de la tabla users
        cursor.execute("""
            SELECT
                users.id,
                users.name,
                users.email,
                users.user_type AS role,
                users.state,
                users.created_at,
                departments.name AS department,
                GROUP_CONCAT(DISTINCT units.name ORDER BY units.name SEPARATOR ', ') AS units,
                COUNT(DISTINCT activities.id) AS activities
            FROM users
            LEFT JOIN departments ON departments.id = users.department_id
            LEFT JOIN unit_user ON unit_user.user_id = users.id
            LEFT JOIN units ON units.id = unit_user.unit_id
            LEFT JOIN activities ON activities.user_id = users.id
            GROUP BY users.id
            ORDER BY users.created_at DESC
        """)
        
        usuarios = cursor.fetchall()
        cursor.close()
        conexion.close()
        
        print(f"✅ Usuarios obtenidos: {len(usuarios)}")
        
        return {
            "status": "success",
            "data": usuarios
        }
    
    except Exception as e:
        print(f"❌ Error obteniendo usuarios: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/admin/users/search")
def search_users(query: str = ""):
    """Busca usuarios por nombre, email o rol"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        
        cursor = conexion.cursor(dictionary=True)
        
        # Buscar usuarios que coincidan con el query
        search_query = f"%{query}%"
        cursor.execute("""
            SELECT
                users.id,
                users.name,
                users.email,
                users.user_type AS role,
                users.state,
                users.created_at,
                departments.name AS department,
                GROUP_CONCAT(DISTINCT units.name ORDER BY units.name SEPARATOR ', ') AS units,
                COUNT(DISTINCT activities.id) AS activities
            FROM users
            LEFT JOIN departments ON departments.id = users.department_id
            LEFT JOIN unit_user ON unit_user.user_id = users.id
            LEFT JOIN units ON units.id = unit_user.unit_id
            LEFT JOIN activities ON activities.user_id = users.id
            WHERE users.name LIKE %s
              OR users.email LIKE %s
              OR users.user_type LIKE %s
            GROUP BY users.id
            ORDER BY users.created_at DESC
        """, (search_query, search_query, search_query))
        
        usuarios = cursor.fetchall()
        cursor.close()
        conexion.close()
        
        print(f"✅ Busca completada: {len(usuarios)} resultados")
        
        return {
            "status": "success",
            "data": usuarios,
            "count": len(usuarios)
        }
    
    except Exception as e:
        print(f"❌ Error buscando usuarios: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }


@app.put("/admin/users/{user_id}/activate")
def activate_user(user_id: int):
    """Activa un usuario"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        
        cursor = conexion.cursor()
        
        # Verificar que el usuario existe
        cursor.execute("SELECT id, state FROM users WHERE id = %s", (user_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Usuario no encontrado"
            }
        
        # Activar el usuario (cambiar state a 'Activo')
        cursor.execute("UPDATE users SET state = 'Activo' WHERE id = %s", (user_id,))
        conexion.commit()
        
        cursor.close()
        conexion.close()
        
        print(f"✅ Usuario {user_id} activado")
        
        return {
            "status": "success",
            "message": f"Usuario {user_id} activado correctamente"
        }
    
    except Exception as e:
        print(f"❌ Error activando usuario: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }


@app.put("/admin/users/{user_id}/deactivate")
def deactivate_user(user_id: int):
    """Inactiva un usuario"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        
        cursor = conexion.cursor()
        
        # Verificar que el usuario existe
        cursor.execute("SELECT id, state FROM users WHERE id = %s", (user_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Usuario no encontrado"
            }
        
        # Inactivar el usuario (cambiar state a 'Inactivo')
        cursor.execute("UPDATE users SET state = 'Inactivo' WHERE id = %s", (user_id,))
        conexion.commit()
        
        cursor.close()
        conexion.close()
        
        print(f"✅ Usuario {user_id} inactivado")
        
        return {
            "status": "success",
            "message": f"Usuario {user_id} inactivado correctamente"
        }
    
    except Exception as e:
        print(f"❌ Error inactivando usuario: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }


@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int):
    """Elimina un usuario por ID"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        
        cursor = conexion.cursor()
        
        # Verificar que el usuario existe
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Usuario no encontrado"
            }
        
        # Eliminar el usuario
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conexion.commit()
        
        cursor.close()
        conexion.close()
        
        print(f"✅ Usuario {user_id} eliminado")
        
        return {
            "status": "success",
            "message": f"Usuario {user_id} eliminado correctamente"
        }
    
    except Exception as e:
        print(f"❌ Error eliminando usuario: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/departments")
def get_departments():
    """Obtiene lista de departamentos"""
    try:
        conexion = get_database_connection()

        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }

        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, name
            FROM departments
            ORDER BY name ASC
        """)
        departamentos = cursor.fetchall()
        cursor.close()
        conexion.close()

        return {
            "status": "success",
            "data": departamentos
        }

    except Exception as e:
        print(f"❌ Error obteniendo departamentos: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/admin/users")
def create_user(payload: CreateUserRequest):
    """Crea un nuevo usuario"""
    try:
        conexion = get_database_connection()

        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }

        cursor = conexion.cursor()

        # Validar email o identificacion duplicados
        cursor.execute(
            "SELECT id FROM users WHERE email = %s OR identification = %s",
            (payload.email, payload.identification)
        )
        if cursor.fetchone():
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Email o identificación ya existen"
            }

        password_hash = bcrypt.hashpw(
            payload.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        now = datetime.now()

        cursor.execute("""
            INSERT INTO users
            (name, email, password, user_type, identification_type, identification, gender, state, department_id, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            payload.name,
            payload.email,
            password_hash,
            payload.user_type,
            payload.identification_type,
            payload.identification,
            payload.gender,
            payload.state,
            payload.department_id,
            now,
            now
        ))

        user_id = cursor.lastrowid
        cursor.close()
        conexion.close()

        return {
            "status": "success",
            "message": "Usuario creado correctamente",
            "data": {"id": user_id}
        }

    except Exception as e:
        print(f"❌ Error creando usuario: {e}")
        return {
            "status": "error",
            "message": str(e)
        }