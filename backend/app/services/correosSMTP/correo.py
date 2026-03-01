import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# ===============================
# CONFIGURACIÓN SMTP (desde .env)
# ===============================
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "campusvirtualsolicitud@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "")


def enviar_correo_recuperacion(destinatario: str, nombre_usuario: str, token: str):
    """
    Envía un correo de recuperación de contraseña con un link que contiene el token JWT.
    
    Args:
        destinatario: Email del usuario
        nombre_usuario: Nombre del usuario
        token: Token JWT para resetear la contraseña
    """

    # URL del frontend con el token
    reset_link = f"http://localhost:4200/confirmPassword?token={token}"

    msg = EmailMessage()
    msg["From"] = formataddr(("Campus Virtual - Recuperación", SMTP_USER))
    msg["To"] = destinatario
    msg["Subject"] = "Recuperar contraseña - Campus Virtual"

    # ===============================
    # HTML BODY
    # ===============================
    body_html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <body style="font-family: Arial, sans-serif; background: #f0f2f5; padding: 20px; margin: 0;">
        <table width="600" align="center" cellpadding="0" cellspacing="0" 
               style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #2c5282, #3182ce); color: #ffffff; text-align: center; padding: 30px 20px;">
                    <h1 style="margin: 0; font-size: 24px;">🔐 Campus Virtual</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Recuperación de Contraseña</p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style="padding: 30px;">
                    <h2 style="color: #2d3748; margin-top: 0;">Hola, {nombre_usuario} 👋</h2>
                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                        Hemos recibido una solicitud para restablecer tu contraseña. 
                        Haz clic en el botón de abajo para crear una nueva contraseña.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <a href="{reset_link}" 
                                   style="background: linear-gradient(135deg, #2c5282, #3182ce); 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          padding: 14px 40px; 
                                          border-radius: 8px; 
                                          font-size: 16px; 
                                          font-weight: bold;
                                          display: inline-block;">
                                    Restablecer Contraseña
                                </a>
                            </td>
                        </tr>
                    </table>

                    <p style="color: #718096; font-size: 13px; line-height: 1.5;">
                        Si no solicitaste este cambio, puedes ignorar este correo. 
                        Tu contraseña actual seguirá siendo la misma.
                    </p>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

                    <p style="color: #a0aec0; font-size: 12px;">
                        ⏰ Este enlace expirará en <strong>30 minutos</strong>.
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; word-break: break-all;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                        <a href="{reset_link}" style="color: #3182ce;">{reset_link}</a>
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background: #f7fafc; text-align: center; padding: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                        Fecha de envío: {datetime.now().strftime('%d/%m/%Y %H:%M')}
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 4px 0 0;">
                        © Campus Virtual - Universidad Santo Tomás
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Versión texto plano como fallback
    msg.set_content(
        f"Hola {nombre_usuario},\n\n"
        f"Hemos recibido una solicitud para restablecer tu contraseña.\n\n"
        f"Haz clic en el siguiente enlace para crear una nueva contraseña:\n"
        f"{reset_link}\n\n"
        f"Este enlace expirará en 30 minutos.\n\n"
        f"Si no solicitaste este cambio, ignora este correo."
    )
    msg.add_alternative(body_html, subtype="html")

    # ===============================
    # ENVÍO
    # ===============================
    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls(context=context)
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

    return True


def enviar_correo_actividad(destinatario: str, nombre_usuario: str, actividad_nombre: str, horas: int, descripcion: str, unidad: str, codigo: str, nombre_archivo: str):
    """
    Envía un correo de confirmación cuando un docente crea una actividad.
    """

    msg = EmailMessage()
    msg["From"] = formataddr(("Campus Virtual - Actividades", SMTP_USER))
    msg["To"] = destinatario
    msg["Subject"] = "Nueva actividad registrada - Campus Virtual"

    # ===============================
    # HTML BODY
    # ===============================
    body_html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <body style="font-family: Arial, sans-serif; background: #f0f2f5; padding: 20px; margin: 0;">
        <table width="600" align="center" cellpadding="0" cellspacing="0" 
               style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #2c7a7b, #319795); color: #ffffff; text-align: center; padding: 30px 20px;">
                    <h1 style="margin: 0; font-size: 24px;">📝 Campus Virtual</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Notificación de Actividad</p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style="padding: 30px;">
                    <h2 style="color: #2d3748; margin-top: 0;">¡Hola, {nombre_usuario}! 👋</h2>
                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                        Te confirmamos que se ha registrado exitosamente una nueva actividad en tu cuenta.
                    </p>
                    
                    <div style="background: #f7fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #4a5568;"><strong>📍 Unidad:</strong> {unidad}</p>
                        <p style="margin: 0 0 10px 0; color: #4a5568;"><strong>🔢 Código:</strong> {codigo}</p>
                        <p style="margin: 0 0 10px 0; color: #4a5568;"><strong>📌 Actividad:</strong> {actividad_nombre}</p>
                        <p style="margin: 0 0 10px 0; color: #4a5568;"><strong>⏰ Horas dedicadas:</strong> {horas}</p>
                        <p style="margin: 0 0 10px 0; color: #4a5568;"><strong>📄 Descripción:</strong> {descripcion}</p>
                        <p style="margin: 0; color: #4a5568;"><strong>📎 Archivo:</strong> {nombre_archivo}</p>
                    </div>

                    <p style="color: #718096; font-size: 13px; line-height: 1.5;">
                        Puedes revisar el estado de tus actividades y adjuntar evidencias desde el portal del docente.
                    </p>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

                    <p style="color: #a0aec0; font-size: 11px;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background: #f7fafc; text-align: center; padding: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                        Fecha de registro: {datetime.now().strftime('%d/%m/%Y %H:%M')}
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 4px 0 0;">
                        © Campus Virtual - Universidad Santo Tomás
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Versión texto plano como fallback
    msg.set_content(
        f"Hola {nombre_usuario},\n\n"
        f"Has registrado una nueva actividad exitosamente.\n\n"
        f"Detalles:\n"
        f"- Unidad: {unidad}\n"
        f"- Código: {codigo}\n"
        f"- Actividad: {actividad_nombre}\n"
        f"- Horas: {horas}\n"
        f"- Descripción: {descripcion}\n"
        f"- Archivo: {nombre_archivo}\n\n"
        f"Gracias por usar el Campus Virtual."
    )
    msg.add_alternative(body_html, subtype="html")

    # ===============================
    # ENVÍO
    # ===============================
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"❌ Error enviando correo de actividad: {e}")
        return False

def enviar_correo_cambio_estado(destinatario: str, nombre_usuario: str, actividad_nombre: str, nuevo_estado: str, observaciones: str = None):
    """
    Envía un correo de notificación cuando el estado de una actividad cambia.
    """

    msg = EmailMessage()
    msg["From"] = formataddr(("Campus Virtual - Actividades", SMTP_USER))
    msg["To"] = destinatario
    msg["Subject"] = "Actualización de estado en tu actividad - Campus Virtual"

    obs_html = f"<p style='margin: 0; color: #4a5568;'><strong>💬 Observaciones:</strong> {observaciones}</p>" if observaciones else ""
    obs_text = f"- Observaciones: {observaciones}\n" if observaciones else ""

    # ===============================
    # HTML BODY
    # ===============================
    body_html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <body style="font-family: Arial, sans-serif; background: #f0f2f5; padding: 20px; margin: 0;">
        <table width="600" align="center" cellpadding="0" cellspacing="0" 
               style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #2c5282, #3182ce); color: #ffffff; text-align: center; padding: 30px 20px;">
                    <h1 style="margin: 0; font-size: 24px;">🔔 Campus Virtual</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Cambio de Estado en Actividad</p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style="padding: 30px;">
                    <h2 style="color: #2d3748; margin-top: 0;">Hola, {nombre_usuario} 👋</h2>
                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                        Te informamos que se ha realizado un cambio en el estado de una de tus actividades registradas.
                    </p>
                    
                    <div style="background: #f7fafc; border-radius: 8px; padding: 20px; border: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #4a5568;"><strong>📌 Actividad:</strong> {actividad_nombre}</p>
                        <p style="margin: 0 0 10px 0; color: #4a5568;"><strong>🔄 Nuevo Estado:</strong> <span style="color: #2c5282; font-weight: bold;">{nuevo_estado}</span></p>
                        {obs_html}
                    </div>

                    <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                        Por favor, ingresa al portal del docente para revisar los detalles y realizar los ajustes necesarios si es el caso.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <a href="http://localhost:4200/login" 
                                   style="background: linear-gradient(135deg, #2c5282, #3182ce); 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          padding: 14px 40px; 
                                          border-radius: 8px; 
                                          font-size: 16px; 
                                          font-weight: bold;
                                          display: inline-block;">
                                    Ir al Portal
                                </a>
                            </td>
                        </tr>
                    </table>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

                    <p style="color: #a0aec0; font-size: 11px;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background: #f7fafc; text-align: center; padding: 15px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #a0aec0; font-size: 11px; margin: 0;">
                        Fecha de actualización: {datetime.now().strftime('%d/%m/%Y %H:%M')}
                    </p>
                    <p style="color: #a0aec0; font-size: 11px; margin: 4px 0 0;">
                        © Campus Virtual - Universidad Santo Tomás
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    # Versión texto plano como fallback
    msg.set_content(
        f"Hola {nombre_usuario},\n\n"
        f"Se ha actualizado el estado de tu actividad: {actividad_nombre}.\n"
        f"Nuevo estado: {nuevo_estado}\n"
        f"{obs_text}\n"
        f"Por favor, ingresa al portal del docente para revisar los detalles:\n"
        f"http://localhost:4200/login\n\n"
        f"Gracias por usar el Campus Virtual."
    )
    msg.add_alternative(body_html, subtype="html")

    # ===============================
    # ENVÍO
    # ===============================
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"❌ Error enviando correo de cambio de estado: {e}")
        return False
