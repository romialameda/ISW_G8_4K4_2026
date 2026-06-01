import nodemailer from 'nodemailer';
import 'dotenv/config';

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "christian.bergero.cba@gmail.com",
        pass: "uvfjpmnimjhrchpv",
      },
    });
  }

  async enviar({ destinatario, actividad, horario, idInscripcion, visitantes }) {
    const listadoVisitantes = visitantes
      .map((v, i) => `${i + 1}. ${v.nombre} (DNI: ${v.dni}, Edad: ${v.edad}${v.talle ? `, Talle: ${v.talle}` : ''})`)
      .join('\n');

    const HTML_BODY = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 20px;">
          <span style="font-size: 40px;">🌿</span>
          <h1 style="color: #1e3a8a; margin: 10px 0 0; font-size: 24px;">Confirmación de Inscripción</h1>
          <p style="color: #64748b; margin: 5px 0 0;">EcoHarmony Park - Reservas Online</p>
        </div>
        
        <p style="color: #334155; font-size: 16px; line-height: 1.5;">¡Hola! Tu inscripción a la actividad ha sido confirmada con éxito. A continuación te presentamos el detalle del voucher:</p>
        
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 15px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 140px;">N° de Inscripción:</td>
              <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-size: 16px; font-weight: bold;">${idInscripcion}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Actividad:</td>
              <td style="padding: 6px 0; color: #0f172a;">${actividad}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Horario:</td>
              <td style="padding: 6px 0; color: #0f172a;">${horario} hs</td>
            </tr>
          </table>
        </div>
        
        <h3 style="color: #1e3a8a; font-size: 16px; margin: 20px 0 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">👥 Visitantes Registrados</h3>
        <ul style="padding-left: 20px; color: #334155; line-height: 1.6;">
          ${visitantes.map(v => `<li style="margin-bottom: 8px;"><strong>${v.nombre}</strong> (DNI: ${v.dni}, Edad: ${v.edad}${v.talle ? `, Talle: ${v.talle}` : ''})</li>`).join('')}
        </ul>
        
        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Este es un correo automático, por favor no respondas a esta dirección.</p>
          <p style="color: #64748b; font-size: 14px; margin: 10px 0 0; font-weight: bold;">¡Te esperamos para vivir una gran aventura!</p>
        </div>
      </div>
    `;

    const TEXT_BODY = `¡Hola! Tu inscripción ha sido confirmada con éxito.

Detalles de la inscripción:
------------------------------------------
N° de Inscripción: ${idInscripcion}
Actividad:         ${actividad}
Horario:           ${horario} hs

Visitantes:
${listadoVisitantes}
------------------------------------------

¡Gracias por elegirnos!
EcoHarmony Park`;

    const mailOptions = {
      from: `"EcoHarmony Park" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: `Confirmación de Reserva #${idInscripcion} - ${actividad}`,
      text: TEXT_BODY,
      html: HTML_BODY,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email enviado exitosamente a ${destinatario}. ID: ${info.messageId}`);
      return { enviado: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error al enviar el email:', error);
      return { enviado: false, error: error.message };
    }
  }
}
