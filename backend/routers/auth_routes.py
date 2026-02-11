from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class Auth(BaseModel):
    email: str
    password: str
    
@router.post("/")
def login(auth: Auth):
    # Aquí iría la lógica de autenticación, por ahora solo devolvemos un mensaje de éxito
    return {"message": f"Usuario {auth.email} autenticado correctamente"}