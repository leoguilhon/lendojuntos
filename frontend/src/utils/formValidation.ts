export function validateName(value: string) {
  const length = value.trim().length;
  if (!length) return "Informe seu nome.";
  if (length < 2) return "Use pelo menos 2 caracteres no nome.";
  if (length > 80) return "Use no máximo 80 caracteres no nome.";
  return "";
}

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return "Informe seu e-mail.";
  if (email.length > 120) return "Use no máximo 120 caracteres no e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Informe um e-mail válido, como nome@exemplo.com.";
  return "";
}

export function validatePassword(value: string) {
  if (!value) return "Informe sua senha.";
  if (value.length < 6) return "Use pelo menos 6 caracteres na senha.";
  if (value.length > 80) return "Use no máximo 80 caracteres na senha.";
  return "";
}

export function validateBio(value: string) {
  if (value.trim().length > 240) return "Use no máximo 240 caracteres na bio.";
  return "";
}
