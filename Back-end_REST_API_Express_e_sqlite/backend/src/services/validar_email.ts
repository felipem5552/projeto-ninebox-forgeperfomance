export function emailValido(email: string): boolean {

  // Garante que o e-mail tenha formato usuário@email.com
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return regex.test(email)
}