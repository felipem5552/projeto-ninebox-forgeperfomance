// - TIPOS COMPARTILHADOS DO SISTEMA

export type Privilegio = 'ADMIN' | 'GESTOR' | 'FUNCIONARIO'

export type Usuario = {
  id: number
  nome: string
  email: string
  privilegios: Privilegio
}

export type Funcionario = Usuario & {
  cargo?: string
  time: string
  ativo: boolean
}
