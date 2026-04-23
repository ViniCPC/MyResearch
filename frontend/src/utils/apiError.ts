export function getApiErrorMessage(error: any, fallbackMessage: string) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  if (error?.code === "ERR_NETWORK") {
    return "Nao foi possivel conectar ao backend. Confirme se a API esta rodando em http://localhost:3000.";
  }

  return fallbackMessage;
}
