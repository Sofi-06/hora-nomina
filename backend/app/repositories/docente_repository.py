from setup_database import get_connection

class DocenteRepository:

    @staticmethod
    def obtener_actividades_docente(user_id: int):
        conexion = get_connection()
        cursor = conexion.cursor(dictionary=True)
        query = """
        SELECT a.id, a.evidence_file, u.name AS user_name, d.name AS department, un.name AS unit,
               CONCAT(c.code, ' - ', c.name) AS code, a.state, a.description, a.created_at, a.updated_at, a.observations
        FROM activities a
        LEFT JOIN users u ON u.id = a.user_id
        LEFT JOIN departments d ON d.id = u.department_id
        LEFT JOIN types t ON t.id = a.type_id
        LEFT JOIN codes c ON c.id = t.code_id
        LEFT JOIN units un ON un.id = c.unit_id
        WHERE a.user_id = %s
        ORDER BY a.created_at DESC
    """
        cursor.execute(query, (user_id,))
        actividades = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"status": "success", "data": actividades}

