export type FuncionarioRow = {
  id: number
  nome: string
  email: string
  cargo?: string | null
  time_id: number
  time_nome?: string
  privilegios: 'FUNCIONARIO' | 'GESTOR' | 'ADMIN'
  senha?: string | null
  ativo: number
  data_de_ingresso: string
}

export default FuncionarioRow