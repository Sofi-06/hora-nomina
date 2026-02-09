from fastapi import FastAPI

app = FastAPI(title="Sistema de Gestión de Entregas Académicas")

@app.get("/")
def root():
    return {"mensaje": "Backend funcionando"}
