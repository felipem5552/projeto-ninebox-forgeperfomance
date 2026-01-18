const API_URL = 'http://localhost:4000/api'

/* =========================
   🔐 AUTENTICAÇÃO
========================= */

export async function login(email: string, senha: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })

  let data = {}
  try {
    data = await response.json()
  } catch {}

  if (!response.ok) {
    return {
      erro: (data as any)?.erro || 'Erro ao autenticar'
    }
  }

  return data
}

export async function criarSenha(id: number, senha: string) {
  const response = await fetch(`${API_URL}/primeiro-acesso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, senha })
  })

  const data = await response.json()
  if (!response.ok) throw data

  return data
}

/* =========================
   👥 FUNCIONÁRIOS
========================= */

export async function listarFuncionarios() {
  const response = await fetch(`${API_URL}/funcionarios`)
  const data = await response.json()

  if (!response.ok) throw data
  return data
}

export async function cadastrarFuncionario(payload: {
  nome: string
  email: string
  cargo?: string
  time: string
  privilegios: 'FUNCIONARIO' | 'GESTOR'
}) {
  const response = await fetch(`${API_URL}/funcionarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await response.json()
  if (!response.ok) throw data

  return data
}

/* =========================
   📊 RELATÓRIOS
========================= */

export async function nineBoxPorTime() {
  const response = await fetch(
    `${API_URL}/relatorios/ninebox-por-time`
  )

  const data = await response.json()
  if (!response.ok) throw data

  return data
}

/* =========================
   🧩 MODELOS DE AVALIAÇÃO
========================= */

export async function listarModelosAvaliacao() {
  const response = await fetch(`${API_URL}/avaliacoes`)
  const data = await response.json()

  if (!response.ok) throw data
  return data
}

export async function criarAvaliacao(titulo: string): Promise<number> {
  const response = await fetch(`${API_URL}/avaliacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo })
  })

  const data = await response.json()
  if (!response.ok) throw data

  return Number(data.id)
}

export async function buscarModeloAvaliacao(modeloId: number) {
  const response = await fetch(
    `${API_URL}/avaliacoes/${modeloId}`
  )

  const data = await response.json()
  if (!response.ok) throw data

  return data
}

export async function adicionarPergunta(
  modeloId: number,
  pergunta: {
    enunciado: string
    eixo: 'DESEMPENHO' | 'POTENCIAL'
    peso: number
  }
) {
  const response = await fetch(
    `${API_URL}/avaliacoes/${modeloId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pergunta)
    }
  )

  if (!response.ok) {
    const erro = await response.json()
    throw erro
  }
}

export async function verificarUsoModelo(modeloId: number): Promise<{ total: number }> {
  const response = await fetch(
    `${API_URL}/avaliacoes/${modeloId}/uso`
  )

  const data = await response.json()
  if (!response.ok) throw data

  return data
}

/* =========================
   📝 AVALIAÇÕES
========================= */

export async function avaliarFuncionario(payload: {
  Avaliador: number
  Avaliado: number
  Modelo: number
  Ciclo: string
  Notas: number[]
}) {
  const response = await fetch(`${API_URL}/avaliar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await response.json()
  if (!response.ok) throw data

  return data
}

export async function buscarHistoricoFuncionario(funcionarioId: number) {
  const response = await fetch(
    `${API_URL}/funcionarios/${funcionarioId}/historico`
  )

  const data = await response.json()
  if (!response.ok) throw data

  return data
}
