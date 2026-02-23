from fastapi import APIRouter, UploadFile, File, Form, Path
import sys
import os
from typing import Optional
from datetime import datetime

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from baseDatos.database import get_database_connection

router = APIRouter(
    prefix="/docente",
    tags=["Docente"]
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "app", "uploads")

@router.get("/activities")
def get_docente_activities(
    user_id: int = None,
    user_email: str = None
):
    """Obtiene lista de actividades subidas por un docente"""
    try:
        conexion = get_database_connection()

        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }

        cursor = conexion.cursor(dictionary=True)
        
        # Si no se proporciona user_id, intentar obtenerlo del email
        if not user_id and user_email:
            cursor.execute("SELECT id FROM users WHERE email = %s", (user_email,))
            user_result = cursor.fetchone()
            if user_result:
                user_id = user_result['id']
            else:
                cursor.close()
                conexion.close()
                return {
                    "status": "error",
                    "message": "Usuario no encontrado"
                }
        
        if not user_id:
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Se requiere user_id o user_email"
            }
        
        # Query para obtener actividades del docente
        query = """
        SELECT
            a.id,
            a.evidence_file,
            u.name AS user_name,
            d.name AS department,
            GROUP_CONCAT(DISTINCT un.name ORDER BY un.name SEPARATOR ', ') AS unit,
            CONCAT(c.code, ' - ', c.name) AS code,
            a.state,
            a.description,
            a.created_at,
            a.updated_at
        FROM activities a
        LEFT JOIN users u ON u.id = a.user_id
        LEFT JOIN departments d ON d.id = u.department_id
        LEFT JOIN types t ON t.id = a.type_id
        LEFT JOIN codes c ON c.id = t.code_id
        LEFT JOIN unit_user uu ON uu.user_id = u.id
        LEFT JOIN units un ON un.id = uu.unit_id
        WHERE a.user_id = %s
        GROUP BY
            a.id,
            a.evidence_file,
            u.name,
            d.name,
            c.code,
            c.name,
            a.state,
            a.description,
            a.created_at,
            a.updated_at
        ORDER BY a.created_at DESC
        """
        
        cursor.execute(query, (user_id,))
        actividades = cursor.fetchall()

        cursor.close()
        conexion.close()

        return {
            "status": "success",
            "data": actividades
        }

    except Exception as e:
        print(f"Error obteniendo actividades del docente: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@router.post("/activities")
async def create_docente_activity(
    user_id: int = Form(...),
    type_id: int = Form(...),
    dedicated_hours: int = Form(...),
    description: str = Form(...),
    evidence_file: UploadFile = File(...)
):
    """Crea una nueva actividad para un docente"""

    try:
        # Validar entrada
        if not user_id or not type_id or dedicated_hours is None or not description:
            return {
                "status": "error",
                "message": "Campos requeridos faltantes"
            }

        if dedicated_hours < 0 or dedicated_hours > 40:
            return {
                "status": "error",
                "message": "Las horas deben estar entre 0 y 40"
            }

        # Validar formato de archivo
        allowed_extensions = {'doc', 'docx', 'xml', 'pdf', 'xlsx', 'zip', 'rar'}
        file_extension = evidence_file.filename.split('.')[-1].lower()
        
        if file_extension not in allowed_extensions:
            return {
                "status": "error",
                "message": f"Formato de archivo no permitido. Permitidos: {', '.join(allowed_extensions)}"
            }

        conexion = get_database_connection()

        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }

        # Crear directorio para el usuario si no existe
        user_upload_dir = os.path.join(UPLOAD_DIR, str(user_id))
        os.makedirs(user_upload_dir, exist_ok=True)

        # Guardar archivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
        filename = timestamp + evidence_file.filename
        filepath = os.path.join(user_upload_dir, filename)

        with open(filepath, "wb") as f:
            content = await evidence_file.read()
            f.write(content)

        cursor = conexion.cursor()

        # Insertar actividad en la base de datos
        insert_query = """
        INSERT INTO activities (
            user_id,
            type_id,
            hours,
            evidence_file,
            description,
            state,
            created_at,
            updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """

        cursor.execute(insert_query, (
            user_id,
            type_id,
            dedicated_hours,
            filename,
            description,
            "Pendiente"  # Estado inicial
        ))

        conexion.commit()
        cursor.close()
        conexion.close()

        return {
            "status": "success",
            "message": "Actividad creada correctamente"
        }
    except Exception as e:
        print(f"❌ Error creando actividad: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@router.get("/codes")
def get_docente_codes():

    """Obtiene lista de códigos para el docente"""
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
                COUNT(DISTINCT t.id) AS types,
                GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ', ') AS type_names
            FROM codes c
            LEFT JOIN units u ON u.id = c.unit_id
            LEFT JOIN types t ON t.code_id = c.id
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
        print(f"❌ Error obteniendo códigos: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

    except Exception as e:
          print(f"Error creating activity: {e}")
    return {
            "status": "error",
            "message": str(e)
        }

@router.get("/types")
def get_docente_types():
        """Obtiene todos los tipos de actividades para el docente"""
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
                    t.id, 
                    t.name, 
                    t.code_id,
                    c.code,
                    c.name as code_name,
                    t.created_at, 
                    t.updated_at
                FROM types t
                LEFT JOIN codes c ON c.id = t.code_id
                ORDER BY t.name ASC
            """)
            tipos = cursor.fetchall()

            cursor.close()
            conexion.close()

            return {
                "status": "success",
                "data": tipos
            }

        except Exception as e:
            print(f"❌ Error obteniendo tipos: {e}")
            return {
                "status": "error",
                "message": str(e)
            }

@router.delete("/activities/{activity_id}")
def delete_docente_activity(activity_id: int):
    """Elimina una actividad por ID"""
    try:
        conexion = get_database_connection()
        if not conexion:
            return {
                "status": "error",
                "message": "No se pudo conectar a la base de datos"
            }
        cursor = conexion.cursor()
        cursor.execute("SELECT evidence_file, user_id FROM activities WHERE id = %s", (activity_id,))
        actividad = cursor.fetchone()
        if not actividad:
            cursor.close()
            conexion.close()
            return {
                "status": "error",
                "message": "Actividad no encontrada"
            }
        # Eliminar archivo de evidencia si existe
        evidence_file = actividad[0]
        user_id = actividad[1]
        if evidence_file:
            user_upload_dir = os.path.join(UPLOAD_DIR, str(user_id))
            filepath = os.path.join(user_upload_dir, evidence_file)
            if os.path.exists(filepath):
                os.remove(filepath)
        # Eliminar actividad
        cursor.execute("DELETE FROM activities WHERE id = %s", (activity_id,))
        conexion.commit()
        cursor.close()
        conexion.close()
        return {
            "status": "success",
            "message": "Actividad eliminada correctamente"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
