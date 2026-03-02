from app.repositories.director_repository import DirectorRepository


class DirectorService:

    @staticmethod
    def obtener_usuarios():
        return DirectorRepository.obtener_usuarios()

    @staticmethod
    def obtener_metricas_dashboard(user_id: int):
        """Obtiene las métricas del dashboard para un director específico"""
        return DirectorRepository.obtener_metricas_dashboard(user_id)
    
    
    
