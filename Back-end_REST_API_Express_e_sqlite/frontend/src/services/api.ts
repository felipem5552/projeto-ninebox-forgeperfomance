const API_URL = 'http://localhost:4000/api'

// - TIPOS GERAIS

export type Privilegio = 'FUNCIONARIO' | 'GESTOR' | 'ADMIN'

export type LoginResponse =
  | { primeiroAcesso: true; id: number }
  | {
      id: number
      nome: string
      email: string
      privilegios: Privilegio
    }

// NORMALIZADO PARA O FRONT

export type Funcionario = {
  id: number
  nome: string
  email: string
  cargo: string
  time_id: number
  time_nome?: string
  privilegios: Privilegio
  ativo: boolean
}

export type Pergunta = {
  id: number
  enunciado: string
  eixo: 'DESEMPENHO' | 'POTENCIAL'
  peso: number
}

export type ResultadoHistorico = {
  ciclo_id: number
  ciclo_nome: string
  desempenho: number
  potencial: number
  nine_box: number
  tipo: 'GESTOR' | 'AUTO'
}

export type Ciclo = {
  id: number
  nome: string
  ativo: boolean
  data_inicio?: string | null
  data_fim?: string | null
}

// - AUTENTICAÇÃO

export async function login(
  email: string,
  senha: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao autenticar')
  }

  return data
}

export async function criarSenha(
  id: number,
  senha: string
): Promise<void> {
  const res = await fetch(`${API_URL}/primeiro-acesso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, senha })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao criar senha')
  }
}

// - FUNCIONÁRIOS

export async function listarFuncionarios(): Promise<Funcionario[]> {
  const res = await fetch(`${API_URL}/funcionarios`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao listar funcionários')
  }

  return data.map((f: any) => ({
    id: f.id,
    nome: f.nome,
    email: f.email,
    cargo: f.cargo ?? '',
    time_id: f.time_id,          
    time_nome: f.time_nome,       
    privilegios: f.privilegios,
    ativo: Number(f.ativo) === 1
  }))
}

export async function cadastrarFuncionario(payload: {
  nome: string
  email: string
  cargo?: string
  time_id: number
  privilegios: Privilegio
}): Promise<{ id: number }> {
  const res = await fetch(`${API_URL}/funcionarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao cadastrar funcionário')
  }

  return data
}

//- BUSCAR HISTORICO

export async function buscarHistoricoFuncionario(
  funcionarioId: number,
  cicloId?: number
): Promise<ResultadoHistorico[]> {
  const url = cicloId
    ? `${API_URL}/funcionarios/${funcionarioId}/historico?cicloId=${cicloId}`
    : `${API_URL}/funcionarios/${funcionarioId}/historico`

  const res = await fetch(url)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao buscar histórico')
  }

  return data
}

// - CICLOS

export async function listarCiclos(): Promise<Ciclo[]> {
  const res = await fetch(`${API_URL}/ciclos`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao listar ciclos')
  }

  return data.map((c: any) => ({
    ...c,
    ativo: Number(c.ativo) === 1
  }))
}

export async function buscarCicloAtivo(): Promise<Ciclo | null> {
  const res = await fetch(`${API_URL}/ciclos/ativo`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao buscar ciclo ativo')
  }

  return data
    ? {
        ...data,
        ativo: Number(data.ativo) === 1
      }
    : null
}

export type Time = {
  id: number
  nome: string
}

// - TIMES

export async function listarTimes(): Promise<Time[]> {
  const res = await fetch(`${API_URL}/times`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao listar times')
  }

  return data
}

// - MODELOS DE AVALIAÇÃO

export async function listarModelosAvaliacao(): Promise<
  { id: number; titulo: string }[]
> {
  const res = await fetch(`${API_URL}/avaliacoes`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao listar modelos')
  }

  return data
}

export async function criarAvaliacao(
  titulo: string
): Promise<number> {
  const res = await fetch(`${API_URL}/avaliacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo })
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao criar avaliação')
  }

  return data.id
}

export async function buscarModeloAvaliacao(
  modeloId: number
): Promise<Pergunta[]> {
  const res = await fetch(`${API_URL}/avaliacoes/${modeloId}`)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao buscar modelo')
  }

  return data
}

export async function adicionarPergunta(
  modeloId: number,
  pergunta: Omit<Pergunta, 'id'>
): Promise<number> {
  const res = await fetch(`${API_URL}/avaliacoes/${modeloId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pergunta)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao adicionar pergunta')
  }

  return data.id
}

export async function verificarUsoModelo(
  modeloId: number
): Promise<{ total: number }> {
  const res = await fetch(
    `${API_URL}/avaliacoes/${modeloId}/uso`
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao verificar uso')
  }

  return data
}

// - AVALIAÇÕES

export async function avaliarFuncionario(payload: {
  Avaliador: number
  Avaliado: number
  Modelo: number
  Ciclo: number
  Notas: number[]
}): Promise<{ sucesso: true }> {
  const res = await fetch(`${API_URL}/avaliar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao avaliar funcionário')
  }

  return data
}

// - RELATÓRIOS

export async function nineBoxPorTime(
  cicloId: number
): Promise<
  {
    time: string
    nine_box: number
    quantidade: number
  }[]
> {
  const res = await fetch(
    `${API_URL}/relatorios/ninebox-por-time?cicloId=${cicloId}`
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.erro || 'Erro ao gerar relatório')
  }

  return data
}
