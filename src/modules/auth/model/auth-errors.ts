const MESSAGES: Record<string, string> = {
  "user-not-found": "Credenciais inválidas.",
  "wrong-password": "Credenciais inválidas.",
  "invalid-credential": "Credenciais inválidas.",
  "invalid-email": "E-mail inválido.",
  "user-disabled": "Conta desativada.",
  "too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "network-request-failed": "Sem conexão. Verifique sua internet.",
  "email-already-in-use": "Este e-mail já está em uso.",
  "weak-password": "Senha fraca. Use ao menos 6 caracteres.",
  "operation-not-allowed": "Login por e-mail não está ativado.",
  "missing-google-id-token": "Falha ao obter token do Google.",
};

export function authErrorMessage(code: string): string {
  const key = code.replace("auth/", "");
  return MESSAGES[key] ?? "Ocorreu um erro. Tente novamente.";
}
