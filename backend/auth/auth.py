from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Agregar el directorio padre al path para poder importar baseDatos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from baseDatos.database import get_database_connection
from app.services.correosSMTP.correo import enviar_correo_recuperacion

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "campus_virtual_default_secret")

router = APIRouter(prefix="/auth", tags=["auth"])

class Auth(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    status: str
    mensaje: str
    usuario: dict = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    password: str
    
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


        if bcrypt.checkpw(password_ingresada, hash_bd):
            del usuario["password"]
            usuario.pop("state", None)
            return usuario
        else:
            return None

    except HTTPException:
        raise

    except Exception as e:
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


# ===============================
# RECUPERAR CONTRASEÑA
# ===============================

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):
    """
    Genera un token JWT y envía un correo con el link de recuperación.
    Siempre devuelve status "success" para no revelar si el correo existe.
    """

    conexion = None
    usuario = None

    # ===============================
    # BUSCAR USUARIO EN DB
    # ===============================
    try:
        conexion = get_database_connection()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, name, email FROM users WHERE email = %s",
            (request.email,)
        )
        usuario = cursor.fetchone()
        cursor.close()
    except Exception as e:
        print("Error BD:", str(e))
        # No lanzamos 500, solo logueamos
    finally:
        if conexion:
            conexion.close()

    # ===============================
    # SI NO HAY USUARIO, igual devolvemos success
    # ===============================
    if not usuario:
        return {
            "status": "success",
            "mensaje": "Si el correo está registrado, recibirás instrucciones."
        }

    # ===============================
    # SI EXISTE, GENERAMOS TOKEN Y ENVIAMOS CORREO
    # ===============================
    try:
        payload = {
            "user_id": usuario["id"],
            "email": usuario["email"],
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
            "type": "password_reset"
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

        enviado = enviar_correo_recuperacion(
            destinatario=usuario["email"],
            nombre_usuario=usuario["name"],
            token=token
        )

        if not enviado:
            print("⚠️ Correo no enviado, pero no rompemos el endpoint")

    except Exception as e:
        print("Error correo:", str(e))
        # Solo logueamos, no lanzamos 500

    # ===============================
    # DEVOLVEMOS SIEMPRE SUCCESS
    # ===============================
    return {
        "status": "success",
        "mensaje": "Si el correo está registrado, recibirás instrucciones."
    }

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    """Verifica el token JWT y actualiza la contraseña del usuario"""
    conexion = None
    try:
        # Decodificar y verificar el token JWT
        try:
            payload = jwt.decode(request.token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=400,
                detail={"status": "error", "mensaje": "El enlace ha expirado. Solicita uno nuevo."}
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=400,
                detail={"status": "error", "mensaje": "El enlace no es válido."}
            )

        # Verificar que sea un token de reset
        if payload.get("type") != "password_reset":
            raise HTTPException(
                status_code=400,
                detail={"status": "error", "mensaje": "Token inválido."}
            )

        user_id = payload["user_id"]

        # Hashear la nueva contraseña
        password_hash = bcrypt.hashpw(
            request.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # Actualizar en la base de datos
        conexion = get_database_connection()
        cursor = conexion.cursor()

        cursor.execute(
            "UPDATE users SET password = %s, updated_at = %s WHERE id = %s",
            (password_hash, datetime.now(), user_id)
        )
        conexion.commit()

        rows_affected = cursor.rowcount
        cursor.close()

        if rows_affected == 0:
            raise HTTPException(
                status_code=404,
                detail={"status": "error", "mensaje": "Usuario no encontrado."}
            )

        return {
            "status": "success",
            "mensaje": "Contraseña restablecida exitosamente."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"status": "error", "mensaje": f"Error al restablecer la contraseña: {str(e)}"}
        )
    finally:
        if conexion:
            conexion.close()
        