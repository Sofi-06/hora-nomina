from setup_database import conexion

class DirectorRepository:

    @staticmethod
    def obtener_usuarios():

        cursor = conexion.cursor()

        cursor.execute("SELECT * FROM usuarios")

        resultado = cursor.fetchall()

        return resultado
