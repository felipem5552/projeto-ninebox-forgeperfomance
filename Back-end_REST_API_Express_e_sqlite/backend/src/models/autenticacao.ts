// - Define os atributos do funcionário.  

type UsuarioAuth = {
  id: number
  nome: string
  email: string
  senha: string | null
  privilegios: string
}
export default UsuarioAuth
