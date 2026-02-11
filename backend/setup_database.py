import os
from dotenv import load_dotenv
import mysql.connector

# Cargar variables de entorno
load_dotenv()

def create_database_and_table():
    """Crear la base de datos y tabla users si no existen"""
    try:
        # Conectar sin especificar base de datos para crearla
        conexion = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            autocommit=True
        )
        
        cursor = conexion.cursor()
        
        # Crear base de datos
        db_name = os.getenv("DB_NAME", "seguimiento_cv_docentes")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
        cursor.execute(f"USE `{db_name}`")
        
        # Crear tabla users
        create_table_query = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'docente', 'estudiante') NOT NULL DEFAULT 'estudiante',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_table_query)
        
        # Insertar usuarios de ejemplo si la tabla está vacía
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        
        if count == 0:
            usuarios_ejemplo = [
                ('Administrador Sistema', 'admin@usantotomas.edu.co', 'admin123', 'admin'),
                ('Juan Pérez', 'juan.perez@usantotomas.edu.co', 'docente123', 'docente'),
                ('María García', 'maria.garcia@usantotomas.edu.co', 'estudiante123', 'estudiante'),
            ]
            
            insert_query = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
            cursor.executemany(insert_query, usuarios_ejemplo)
            print("Usuarios de ejemplo creados:")
            for usuario in usuarios_ejemplo:
                print(f"- {usuario[1]} / {usuario[2]} / {usuario[3]}")
        
        cursor.close()
        conexion.close()
        
        print("Base de datos y tabla configuradas exitosamente")
        return True
        
    except Exception as e:
        print(f"Error al configurar base de datos: {e}")
        return False

if __name__ == "__main__":
    create_database_and_table()