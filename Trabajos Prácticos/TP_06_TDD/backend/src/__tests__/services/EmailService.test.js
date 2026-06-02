import { describe, it, expect } from '@jest/globals';
import { EmailService } from '../../services/EmailService.js';
import { ErrorEmailInvalido } from '../../errors/DomainErrors.js';


describe('EmailService', () => {
  it('lanza ErrorEmailInvalido cuando el destinatario es inválido', async () => {
    const service = new EmailService();

    await expect(
      service.enviar({
        destinatario: 'email-invalido',
        actividad: 'Safari',
        horario: '12:00',
        idInscripcion: 'INS-12345',
        visitantes: [],
      })
    ).rejects.toThrow(ErrorEmailInvalido);
  });
});
