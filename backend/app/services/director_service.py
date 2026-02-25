from repositories.director_repository import DirectorRepository

class DirectorService:

    @staticmethod
    def obtener_usuarios():
        return DirectorRepository.obtener_usuarios()
