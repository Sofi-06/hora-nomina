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
    password: Optional[str] = None  # Opcional para editar
    user_type: Literal["Admin", "Docente", "Director"]
    identification_type: Literal["CC", "CE"] = "CC"
    identification: str
    gender: Literal["Femenino", "Masculino"]
    state: Literal["Activo", "Inactivo"] = "Activo"
    department_id: Optional[int] = None
    unit_ids: Optional[list[int]] = None

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
        
        
@app.get("/units")
def get_units():
    """Obtiene lista de unidades"""
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
            FROM units
            ORDER BY name ASC
        """)
        unidades = cursor.fetchall()
        cursor.close()
        conexion.close()

        return {
            "status": "success",
            "data": unidades
        }

    except Exception as e:
        print(f"❌ Error obteniendo unidades: {e}")
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

       
        if payload.unit_ids and len(payload.unit_ids) > 0:
            for unit_id in payload.unit_ids:
                cursor.execute("""
                    INSERT INTO unit_user
                    (user_id, unit_id, created_at, updated_at)
                    VALUES (%s, %s, %s, %s)
                """, (user_id, unit_id, now, now))

        conexion.commit()
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
        
@app.get("/admin/users/{user_id}")
def get_user(user_id: int):
    """Obtiene los datos de un usuario específico"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        
        cursor = conexion.cursor(dictionary=True)
        
        # Obtener datos del usuario
        cursor.execute("""
            SELECT
                users.id,
                users.name,
                users.email,
                users.user_type,
                users.identification_type,
                users.identification,
                users.gender,
                users.state,
                users.department_id,
                GROUP_CONCAT(DISTINCT unit_user.unit_id) AS unit_ids
            FROM users
            LEFT JOIN unit_user ON unit_user.user_id = users.id
            WHERE users.id = %s
            GROUP BY users.id
        """, (user_id,))
        
        usuario = cursor.fetchone()
        cursor.close()
        conexion.close()
        
        if not usuario:
            return {
                "status": "error",
                "message": "Usuario no encontrado"
            }
        
        # Convertir unit_ids de string a lista
        if usuario['unit_ids']:
            usuario['unit_ids'] = [int(uid) for uid in usuario['unit_ids'].split(',')]
        else:
            usuario['unit_ids'] = []
        
        return {
            "status": "success",
            "data": usuario
        }
    
    except Exception as e:
        print(f"❌ Error obteniendo usuario: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }


@app.put("/admin/users/{user_id}")
def update_user(user_id: int, payload: CreateUserRequest):
    """Actualiza los datos de un usuario"""
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
        if not cursor.fetchone():
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Usuario no encontrado"
            }
        
        # Validar email duplicado (excepto el del usuario actual)
        cursor.execute(
            "SELECT id FROM users WHERE email = %s AND id != %s",
            (payload.email, user_id)
        )
        if cursor.fetchone():
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "El email ya está registrado por otro usuario"
            }
        
        now = datetime.now()
        
        # Preparar la actualización
        update_fields = [
            "name = %s",
            "email = %s",
            "user_type = %s",
            "identification_type = %s",
            "identification = %s",
            "gender = %s",
            "state = %s",
            "department_id = %s",
            "updated_at = %s"
        ]
        
        update_values = [
            payload.name,
            payload.email,
            payload.user_type,
            payload.identification_type,
            payload.identification,
            payload.gender,
            payload.state,
            payload.department_id,
            now
        ]
        
        # Si se proporciona contraseña, actualizarla
        if hasattr(payload, 'password') and payload.password:
            password_hash = bcrypt.hashpw(
                payload.password.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")
            update_fields.append("password = %s")
            update_values.append(password_hash)
        
        update_values.append(user_id)
        
        # Actualizar el usuario
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        
        # Actualizar las unidades
        cursor.execute("DELETE FROM unit_user WHERE user_id = %s", (user_id,))
        
        if payload.unit_ids and len(payload.unit_ids) > 0:
            for unit_id in payload.unit_ids:
                cursor.execute("""
                    INSERT INTO unit_user
                    (user_id, unit_id, created_at, updated_at)
                    VALUES (%s, %s, %s, %s)
                """, (user_id, unit_id, now, now))
        
        conexion.commit()
        cursor.close()
        conexion.close()
        
        return {
            "status": "success",
            "message": "Usuario actualizado correctamente"
        }
    
    except Exception as e:
        print(f"❌ Error actualizando usuario: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }
        
        
        # ===== ENDPOINTS PARA UNIDADES =====

@app.get("/admin/units")
def get_admin_units():
    """Obtiene lista de unidades con cantidad de códigos y docentes"""
    try:
        conexion = get_database_connection()

        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }

        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                u.id,
                u.name,
                COUNT(DISTINCT c.id) AS total_codes,
                COUNT(DISTINCT uu.user_id) AS total_docentes
            FROM units u
            LEFT JOIN codes c ON c.unit_id = u.id
            LEFT JOIN unit_user uu ON uu.unit_id = u.id
            GROUP BY u.id
            ORDER BY u.name ASC
        """)
        unidades = cursor.fetchall()
        
        cursor.close()
        conexion.close()

        return {
            "status": "success",
            "data": unidades
        }

    except Exception as e:
        print(f"❌ Error obteniendo unidades: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/admin/units/{unit_id}")
def get_unit(unit_id: int):
    """Obtiene los datos de una unidad específica"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        
        cursor = conexion.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                u.id,
                u.name,
                GROUP_CONCAT(CONCAT(us.id, '|', us.name) SEPARATOR ', ') AS docentes
            FROM units u
            LEFT JOIN unit_user uu ON uu.unit_id = u.id
            LEFT JOIN users us ON us.id = uu.user_id AND us.user_type = 'Docente'
            WHERE u.id = %s
            GROUP BY u.id
        """, (unit_id,))
        
        unidad = cursor.fetchone()
        cursor.close()
        conexion.close()
        
        if not unidad:
            return {
                "status": "error",
                "message": "Unidad no encontrada"
            }
        
        docentes = []
        if unidad['docentes']:
            for docente_str in unidad['docentes'].split(', '):
                if '|' in docente_str:
                    doc_id, doc_name = docente_str.split('|')
                    docentes.append({
                        'id': int(doc_id),
                        'name': doc_name
                    })
        
        unidad['docentes'] = docentes
        
        return {
            "status": "success",
            "data": unidad
        }
    
    except Exception as e:
        print(f"❌ Error obteniendo unidad: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.delete("/admin/units/{unit_id}")
def delete_unit(unit_id: int):
    """Elimina una unidad por ID"""
    try:
        conexion = get_database_connection()
        
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        
        cursor = conexion.cursor()
        
        # Verificar que la unidad existe
        cursor.execute("SELECT id FROM units WHERE id = %s", (unit_id,))
        unidad = cursor.fetchone()
        
        if not unidad:
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Unidad no encontrada"
            }
        
        # Eliminar primero las relaciones en unit_user
        cursor.execute("DELETE FROM unit_user WHERE unit_id = %s", (unit_id,))
        
        # Luego eliminar la unidad
        cursor.execute("DELETE FROM units WHERE id = %s", (unit_id,))
        conexion.commit()
        
        cursor.close()
        conexion.close()
        
        print(f"✅ Unidad {unit_id} eliminada")
        
        return {
            "status": "success",
            "message": f"Unidad {unit_id} eliminada correctamente"
        }
    
    except Exception as e:
        print(f"❌ Error eliminando unidad: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
        
@app.post("/admin/units")
def create_unit(payload: dict):
            """Crea una nueva unidad"""
            try:
                conexion = get_database_connection()
        
                if not conexion:
                    return {
                        "status": "error",
                        "message": "No se pudo conectar a la base de datos"
                    }
        
                cursor = conexion.cursor()
        
                # Validar que no exista una unidad con el mismo nombre
                cursor.execute("SELECT id FROM units WHERE name = %s", (payload['name'],))
                if cursor.fetchone():
                    cursor.close()
                    conexion.close()
                    return {
                        "status": "error",
                        "message": "Ya existe una unidad con ese nombre"
                    }
        
                now = datetime.now()
        
                # Insertar la unidad
                cursor.execute("""
                    INSERT INTO units (name, created_at, updated_at)
                    VALUES (%s, %s, %s)
                """, (payload['name'], now, now))
        
                unit_id = cursor.lastrowid
                conexion.commit()
                cursor.close()
                conexion.close()
        
                print(f"✅ Unidad {unit_id} creada: {payload['name']}")
        
                return {
                    "status": "success",
                    "message": "Unidad creada correctamente",
                    "data": {"id": unit_id}
                }
        
            except Exception as e:
                print(f"❌ Error creando unidad: {e}")
                return {
                    "status": "error",
                    "message": str(e)
                }  
                
@app.put("/admin/units/{unit_id}")
def update_unit(unit_id: int, payload: dict):
    """Actualiza una unidad existente"""
    try:
        conexion = get_database_connection()

        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }

        cursor = conexion.cursor()

        # Verificar que la unidad existe
        cursor.execute("SELECT id FROM units WHERE id = %s", (unit_id,))
        if not cursor.fetchone():
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Unidad no encontrada"
            }

        # Validar que no exista otra unidad con el mismo nombre
        cursor.execute(
            "SELECT id FROM units WHERE name = %s AND id != %s",
            (payload['name'], unit_id)
        )
        if cursor.fetchone():
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Ya existe otra unidad con ese nombre"
            }

        now = datetime.now()

        # Actualizar la unidad
        cursor.execute("""
            UPDATE units 
            SET name = %s, updated_at = %s
            WHERE id = %s
        """, (payload['name'], now, unit_id))

        conexion.commit()
        cursor.close()
        conexion.close()

        print(f"✅ Unidad {unit_id} actualizada: {payload['name']}")

        return {
            "status": "success",
            "message": "Unidad actualizada correctamente"
        }

    except Exception as e:
        print(f"❌ Error actualizando unidad: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
        
# ===== ENDPOINTS PARA CODIGOS =====

@app.get("/admin/codes")
def get_admin_codes():
    """Obtiene lista de codigos con unidad y cantidad de actividades"""
    try:
        conexion = get_database_connection()

        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }

        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT
                c.id,
                c.code,
                c.name,
                u.name AS unit,
                COUNT(DISTINCT a.id) AS activities
            FROM codes c
            LEFT JOIN units u ON u.id = c.unit_id
            LEFT JOIN activities a ON a.type_id = c.id
            GROUP BY c.id
            ORDER BY c.code ASC
        """)
        codigos = cursor.fetchall()

        cursor.close()
        conexion.close()

        return {
            "status": "success",
            "data": codigos
        }

    except Exception as e:
        print(f"❌ Error obteniendo codigos: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }


@app.delete("/admin/codes/{code_id}")
def delete_code(code_id: int):
    """Elimina un codigo por ID"""
    try:
        conexion = get_database_connection()

        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }

        cursor = conexion.cursor()

        cursor.execute("SELECT id FROM codes WHERE id = %s", (code_id,))
        codigo = cursor.fetchone()

        if not codigo:
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Codigo no encontrado"
            }

        # Solo eliminar el código
        cursor.execute("DELETE FROM codes WHERE id = %s", (code_id,))
        conexion.commit()

        cursor.close()
        conexion.close()

        print(f"✅ Codigo {code_id} eliminado")

        return {
            "status": "success",
            "message": f"Codigo {code_id} eliminado correctamente"
        }

    except Exception as e:
        print(f"❌ Error eliminando codigo: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "message": str(e)
        }