/**
 * EmailService.js — Interfaz de Email (ESM)
 * Implementación por defecto (consola). Se reemplaza en tests con jest.fn().
 */
export class EmailService {
  async enviar({ destinatario, actividad, horario, idInscripcion, visitantes }) {
    console.log('='.repeat(60));
    console.log('📧 EMAIL DE CONFIRMACIÓN DE INSCRIPCIÓN');
    console.log('='.repeat(60));
    console.log(`Para:          ${destinatario}`);
    console.log(`Actividad:     ${actividad}`);
    console.log(`Horario:       ${horario}`);
    console.log(`N° Inscripción:${idInscripcion}`);
    console.log(`Visitantes:    ${visitantes.map(v => v.nombre).join(', ')}`);
    console.log('='.repeat(60));
    return { enviado: true };
  }
}
