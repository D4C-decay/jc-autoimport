/**
 * Traduce los errores de Supabase Auth a mensajes en español.
 *
 * Supabase devuelve los mensajes en inglés y con códigos que cambian poco
 * (`error.code`) pero cuyo texto (`error.message`) puede variar. Se comprueba
 * primero el código y después el mensaje para no depender de una sola fuente.
 *
 * Uso:
 *   catch (err) { setError(authMessage(err, 'No se pudo iniciar sesión.')); }
 */

type AuthLikeError = {
  code?: string | null;
  message?: string | null;
  status?: number | null;
};

/** Mensaje genérico cuando no reconocemos el error. */
export const AUTH_FALLBACK = 'No pudimos completar la operación. Inténtalo de nuevo.';

const RULES: Array<{ test: (code: string, message: string) => boolean; text: string }> = [
  // Credenciales y sesión
  {
    test: (c, m) => c === 'invalid_credentials' || m.includes('invalid login credentials'),
    text: 'Correo o contraseña incorrectos.',
  },
  {
    test: (c, m) => c === 'email_not_confirmed' || m.includes('email not confirmed'),
    text: 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada o reenvía el enlace.',
  },
  {
    test: (c, m) => c === 'session_not_found' || m.includes('session not found'),
    text: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  },
  {
    test: (c, m) =>
      c === 'reauthentication_needed' || m.includes('reauthentication') || m.includes('reauth'),
    text: 'Por seguridad, vuelve a iniciar sesión antes de continuar.',
  },

  // Límites de envío
  {
    test: (c, m) =>
      c === 'over_request_rate_limit' ||
      c === 'over_email_send_rate_limit' ||
      m.includes('too many requests') ||
      m.includes('rate limit') ||
      m.includes('rate_limit'),
    text: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  },

  // Registro
  {
    test: (c, m) =>
      c === 'user_already_exists' ||
      m.includes('user already registered') ||
      m.includes('already been registered'),
    text: 'Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.',
  },
  {
    test: (c, m) => c === 'signup_disabled' || m.includes('signups not allowed'),
    text: 'El registro está desactivado temporalmente. Inténtalo más tarde.',
  },
  {
    test: (c, m) =>
      c === 'weak_password' ||
      c === 'password_too_short' ||
      m.includes('password should be at least') ||
      m.includes('password is too short'),
    text: 'La contraseña es demasiado débil. Usa al menos 8 caracteres con mayúscula, minúscula y un número.',
  },
  {
    test: (c, m) => c === 'same_password' || m.includes('different from the old password'),
    text: 'La contraseña nueva debe ser distinta de la anterior.',
  },

  // Correo
  {
    test: (c, m) =>
      c === 'email_address_invalid' ||
      c === 'validation_failed' ||
      (m.includes('email address') && m.includes('is invalid')) ||
      m.includes('unable to validate email address'),
    text: 'El correo no es válido. Revisa que esté bien escrito.',
  },
  {
    test: (c, m) =>
      c === 'otp_expired' ||
      m.includes('email link is invalid or has expired') ||
      m.includes('token has expired') ||
      m.includes('invalid or has expired'),
    text: 'El enlace no es válido o ya expiró. Solicita uno nuevo.',
  },

  // Segundo factor (TOTP)
  {
    test: (c, m) =>
      c === 'invalid_totp' ||
      c === 'mfa_verification_failed' ||
      m.includes('invalid totp') ||
      m.includes('invalid mfa') ||
      m.includes('invalid code'),
    text: 'El código no es válido. Comprueba el reloj de tu dispositivo e inténtalo de nuevo.',
  },
  {
    test: (c, m) =>
      c === 'too_many_enrolled_mfa_factors' ||
      m.includes('too many enrolled') ||
      m.includes('maximum number of verified factors'),
    text: 'Ya tienes el máximo de métodos de verificación activos.',
  },
  {
    test: (c, m) => c === 'mfa_factor_name_conflict' || m.includes('friendly name'),
    text: 'Ya existe un método con ese nombre. Usa otro nombre.',
  },
];

/**
 * Devuelve un mensaje en español para un error de Supabase Auth.
 *
 * @param error  Error capturado (normalmente `AuthError`).
 * @param fallback  Texto propio del flujo si el error no se reconoce.
 */
export function authMessage(error: unknown, fallback = AUTH_FALLBACK): string {
  const { code, message } = (error ?? {}) as AuthLikeError;
  const c = (code ?? '').toLowerCase();
  const m = (message ?? '').toLowerCase();

  if (!c && !m) return fallback;

  for (const rule of RULES) {
    if (rule.test(c, m)) return rule.text;
  }

  // Un `AuthError` sin código conocido pero con mensaje: no mostramos inglés.
  return fallback;
}
