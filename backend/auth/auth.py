from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os
import bcrypt

# Agregar el directorio padre al path para poder importar baseDatos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from baseDatos.database import get_database_connection

router = APIRouter(prefix="/auth", tags=["auth"])

class Auth(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    status: str
    mensaje: str
    usuario: dict = None
    
def verificar_login(email: str, password: str):
    conexion = None
    try:
        conexion = get_database_connection()
        cursor = conexion.cursor(dictionary=True)

        query = """
            SELECT id, name, email, user_type as role, state, password
            FROM users
            WHERE email = %s
        """
        cursor.execute(query, (email,))
        usuario = cursor.fetchone()

        cursor.close()

        if not usuario:
            print("❌ Usuario no encontrado")
            return None

        estado = usuario.get("state")
        estado_normalizado = str(estado).strip().lower() if estado is not None else ""
        esta_activo = estado in (1, True) or estado_normalizado in ("1", "activo")

        if not esta_activo:
            raise HTTPException(
                status_code=403,
                detail={"status": "error", "mensaje": "Usuario inactivo"}
            )

        hash_bd = usuario["password"].encode("utf-8")
        password_ingresada = password.encode("utf-8")

        # 🔥 AQUÍ está la validación real
        if bcrypt.checkpw(password_ingresada, hash_bd):
            del usuario["password"]
            usuario.pop("state", None)
            return usuario
        else:
            print("❌ Password incorrecta")
            return None

    except HTTPException:
        raise

    except Exception as e:
        print("ERROR LOGIN:", e)
        return None
    finally:
        if conexion:
            conexion.close()

    
@router.post("/", response_model=AuthResponse)
def login(auth: Auth):
    """Endpoint para autenticar usuarios"""
    try:
        usuario = verificar_login(auth.email, auth.password)
        
        if usuario:
            return AuthResponse(
                status="success",
                mensaje="Login exitoso",
                usuario=usuario
            )
        else:
            raise HTTPException(
                status_code=401,
                detail={"status": "error", "mensaje": "Credenciales inválidas"}
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "mensaje": f"Error en el servidor: {str(e)}"}
        )
        