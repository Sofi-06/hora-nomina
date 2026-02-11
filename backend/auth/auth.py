from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys
import os

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
    """
    Verifica las credenciales del usuario y retorna sus datos incluyendo el rol
    """
    conexion = None
    try:
        conexion = get_database_connection()
        if not conexion:
            print("No se pudo establecer conexión a la base de datos")
            return None
            
        cursor = conexion.cursor(dictionary=True)
        query = """
            SELECT id, name, email, role, password 
            FROM users 
            WHERE email = %s AND password = %s
        """
        cursor.execute(query, (email, password))
        usuario = cursor.fetchone()
        cursor.close()
        
        if usuario:
            # No retornar la contraseña al frontend
            del usuario['password']
            return usuario
        return None
    except Exception as e:
        print(f"Error en verificar_login: {e}")
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
        