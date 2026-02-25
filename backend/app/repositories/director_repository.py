from setup_database import get_connection
class DirectorRepository:

    @staticmethod
    def obtener_actividades_director_para_reporte(user_id, fecha_inicio=None, fecha_final=None, estado=None, unidad=None):
        conexion = get_connection()
        cursor = conexion.cursor(dictionary=True)

        # Obtener unidades del director
        cursor.execute("SELECT unit_id FROM unit_user WHERE user_id = %s", (user_id,))
        unidades = [row['unit_id'] for row in cursor.fetchall()]
        if not unidades:
            cursor.close()
            conexion.close()
            return []

        formato_in = ','.join(['%s'] * len(unidades))
        query = f'''
        SELECT
            u.name AS user_name,
            GROUP_CONCAT(DISTINCT un.name ORDER BY un.name SEPARATOR ', ') AS unit,
            CONCAT(c.code, ' - ', c.name) AS code,
            a.description,
            a.created_at,
            a.state
        FROM activities a
        LEFT JOIN users u ON u.id = a.user_id
        LEFT JOIN types t ON t.id = a.type_id
        LEFT JOIN codes c ON c.id = t.code_id
        LEFT JOIN unit_user uu ON uu.user_id = u.id
        LEFT JOIN units un ON un.id = uu.unit_id
        WHERE uu.unit_id IN ({formato_in})
        '''
        params = list(unidades)
        if fecha_inicio:
            query += " AND DATE(a.created_at) >= %s"
            params.append(fecha_inicio)
        if fecha_final:
            query += " AND DATE(a.created_at) <= %s"
            params.append(fecha_final)
        if estado:
            query += " AND a.state = %s"
            params.append(estado)
        if unidad:
            query += " AND un.name = %s"
            params.append(unidad)
        query += '''
        GROUP BY a.id, u.name, c.code, c.name, a.description, a.created_at, a.state
        ORDER BY a.created_at DESC
        '''
        cursor.execute(query, tuple(params))
        actividades = cursor.fetchall()
        cursor.close()
        conexion.close()
        return actividades

    @staticmethod
    def obtener_usuarios():
        conexion = get_connection()
        cursor = conexion.cursor()
        cursor.execute("SELECT * FROM usuarios")
        resultado = cursor.fetchall()
        cursor.close()
        conexion.close()
        return resultado

    @staticmethod
    def obtener_metricas_dashboard(user_id: int):
        """Obtiene las métricas del dashboard para un director específico"""
        conexion = get_connection()
        cursor = conexion.cursor(dictionary=True)

        # 1. Obtener las unidades del director
        cursor.execute("SELECT unit_id FROM unit_user WHERE user_id = %s", (user_id,))
        unidades = [row['unit_id'] for row in cursor.fetchall()]
        if not unidades:
            cursor.close()
            conexion.close()
            return {"status": "success", "data": {"totalUsuarios": 0, "porcentajeUsuarios": 0, "totalActividades": 0, "porcentajeActividades": 0, "entregasPendientes": 0, "vencenHoy": 0, "entregasAprobadas": 0, "porcentajeAprobacion": 0}}

        # 2. Obtener los usuarios de esas unidades
        formato_in = ','.join(['%s'] * len(unidades))
        cursor.execute(f"SELECT user_id FROM unit_user WHERE unit_id IN ({formato_in})", tuple(unidades))
        usuarios = [row['user_id'] for row in cursor.fetchall()]
        if not usuarios:
            cursor.close()
            conexion.close()
            return {"status": "success", "data": {"totalUsuarios": 0, "porcentajeUsuarios": 0, "totalActividades": 0, "porcentajeActividades": 0, "entregasPendientes": 0, "vencenHoy": 0, "entregasAprobadas": 0, "porcentajeAprobacion": 0}}

        formato_in_usuarios = ','.join(['%s'] * len(usuarios))

        # Total usuarios
        total_usuarios = len(set(usuarios))

        # Usuarios creados este mes
        cursor.execute(f"""
            SELECT COUNT(*) as total FROM users 
            WHERE id IN ({formato_in_usuarios})
            AND MONTH(created_at) = MONTH(CURDATE()) 
            AND YEAR(created_at) = YEAR(CURDATE())
        """, tuple(usuarios))
        usuarios_mes = cursor.fetchone()['total']
        porcentaje_usuarios = round((usuarios_mes / total_usuarios) * 100) if total_usuarios > 0 else 0

        # Total actividades
        cursor.execute(f"SELECT COUNT(*) as total FROM activities WHERE user_id IN ({formato_in_usuarios})", tuple(usuarios))
        total_actividades = cursor.fetchone()['total']

        # Actividades creadas este mes
        cursor.execute(f"""
            SELECT COUNT(*) as total FROM activities 
            WHERE user_id IN ({formato_in_usuarios})
            AND MONTH(created_at) = MONTH(CURDATE()) 
            AND YEAR(created_at) = YEAR(CURDATE())
        """, tuple(usuarios))
        actividades_mes = cursor.fetchone()['total']
        porcentaje_actividades = round((actividades_mes / total_actividades) * 100) if total_actividades > 0 else 0

        # Entregas aprobadas
        cursor.execute(f"SELECT COUNT(*) as total FROM activities WHERE user_id IN ({formato_in_usuarios}) AND state = 'Aprobado'", tuple(usuarios))
        entregas_aprobadas = cursor.fetchone()['total']
        porcentaje_aprobacion = round((entregas_aprobadas / total_actividades) * 100) if total_actividades > 0 else 0

        # Entregas pendientes
        cursor.execute(f"SELECT COUNT(*) as total FROM activities WHERE user_id IN ({formato_in_usuarios}) AND state IN ('Revisión', 'Con observaciones')", tuple(usuarios))
        entregas_pendientes = cursor.fetchone()['total']

        # Entregas que vencen hoy (asumimos que "vencen hoy" es actividades creadas hoy)
        cursor.execute(f"""
            SELECT COUNT(*) as total FROM activities 
            WHERE user_id IN ({formato_in_usuarios})
            AND state IN ('Revisión', 'Con observaciones')
            AND DATE(created_at) = CURDATE()
        """, tuple(usuarios))
        vencen_hoy = cursor.fetchone()['total']

        cursor.close()
        conexion.close()

        response_data = {
            "totalUsuarios": total_usuarios,
            "porcentajeUsuarios": porcentaje_usuarios,
            "totalActividades": total_actividades,
            "porcentajeActividades": porcentaje_actividades,
            "entregasPendientes": entregas_pendientes,
            "vencenHoy": vencen_hoy,
            "entregasAprobadas": entregas_aprobadas,
            "porcentajeAprobacion": porcentaje_aprobacion
        }
        return {"status": "success", "data": response_data}


    @staticmethod
    def obtener_todas_actividades():
        conexion = get_connection()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT a.id, a.evidence_file, u.name AS user_name, d.name AS department, un.name AS unit,
                   CONCAT(c.code, ' - ', c.name) AS code, a.state, a.description, a.created_at, a.updated_at, a.observations
            FROM activities a
            LEFT JOIN users u ON u.id = a.user_id
            LEFT JOIN departments d ON d.id = u.department_id
            LEFT JOIN types t ON t.id = a.type_id
            LEFT JOIN codes c ON c.id = t.code_id
            LEFT JOIN units un ON un.id = c.unit_id
            ORDER BY a.created_at DESC
        """)
        actividades = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"status": "success", "data": actividades}
    
    @staticmethod
    def obtener_actividades_director(user_id: int):
        conexion = get_connection()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT unit_id FROM unit_user WHERE user_id = %s", (user_id,))
        unidades = [row['unit_id'] for row in cursor.fetchall()]
        if not unidades:
            cursor.close()
            conexion.close()
            return {"status": "success", "data": []}
        formato_in = ','.join(['%s'] * len(unidades))
        cursor.execute(f"SELECT user_id FROM unit_user WHERE unit_id IN ({formato_in})", tuple(unidades))
        usuarios = [row['user_id'] for row in cursor.fetchall()]
        if not usuarios:
            cursor.close()
            conexion.close()
            return {"status": "success", "data": []}
        formato_in_usuarios = ','.join(['%s'] * len(usuarios))
        query = f"""
            SELECT a.id, a.evidence_file, u.name AS user_name, d.name AS department, un.name AS unit,
                   CONCAT(c.code, ' - ', c.name) AS code, a.state, a.description, a.created_at, a.updated_at, a.observations
            FROM activities a
            LEFT JOIN users u ON u.id = a.user_id
            LEFT JOIN departments d ON d.id = u.department_id
            LEFT JOIN types t ON t.id = a.type_id
            LEFT JOIN codes c ON c.id = t.code_id
            LEFT JOIN units un ON un.id = c.unit_id
            WHERE a.user_id IN ({formato_in_usuarios})
            ORDER BY a.created_at DESC
        """
        cursor.execute(query, tuple(usuarios))
        actividades = cursor.fetchall()
        cursor.close()
        conexion.close()
        return {"status": "success", "data": actividades}