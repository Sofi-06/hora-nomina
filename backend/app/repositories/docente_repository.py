from setup_database import conexion

class DocenteRepository:

    @staticmethod
    def obtener_cursos():

        cursor = conexion.cursor()

        cursor.execute("SELECT * FROM cursos")

        return cursor.fetchall()
