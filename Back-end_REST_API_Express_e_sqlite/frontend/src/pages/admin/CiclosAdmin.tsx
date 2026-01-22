import { useEffect, useState } from 'react'

type Ciclo = {
  id: number
  nome: string
  ativo: number
  data_inicio?: string | null
  data_fim?: string | null
}

export default function CiclosAdmin() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [nome, setNome] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [loading, setLoading] = useState(false)

  function carregar() {
    fetch('http://localhost:4000/api/ciclos')
      .then(res => res.json())
      .then(setCiclos)
  }

  useEffect(carregar, [])

  async function criar() {
    if (!nome.trim()) return

    setLoading(true)

    await fetch('http://localhost:4000/api/ciclos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        data_inicio: dataInicio || null,
        data_fim: dataFim || null
      })
    })

    setNome('')
    setDataInicio('')
    setDataFim('')
    setLoading(false)
    carregar()
  }

  async function ativar(id: number) {
    await fetch(
      `http://localhost:4000/api/ciclos/${id}/ativar`,
      { method: 'POST' }
    )
    carregar()
  }

  async function desativar(id: number) {
    await fetch(
      `http://localhost:4000/api/ciclos/${id}/desativar`,
      { method: 'POST' }
    )
    carregar()
  }

  function formatarData(data?: string | null) {
    if (!data) return '—'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <div className="form-sm">
      <h2>🔁 Ciclos de Avaliação</h2>

      <div className="list-box">
        {ciclos.length === 0 && (
          <p>Nenhum ciclo cadastrado.</p>
        )}
        {ciclos.map(c => (
          <div key={c.id} className="ciclo-item">
            <div className="ciclo-info">
              <strong>{c.nome}</strong>{' '}
              {c.ativo === 1 && (
                <span className="status ativo">(ATIVO)</span>
              )}

              <div className="ciclo-datas">
                📅 Início: {formatarData(c.data_inicio)} | Fim:{' '}
                {formatarData(c.data_fim)}
              </div>
            </div>

            <div className="ciclo-acoes">
              {c.ativo === 0 && (
                <button onClick={() => ativar(c.id)}>
                  ▶️ Ativar
                </button>
              )}

              {c.ativo === 1 && (
                <button
                  onClick={() => desativar(c.id)}
                  className="btn-danger"
                >
                  ⛔ Desativar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-divider" />

      <h3>➕ Novo Ciclo</h3>

      <label>Nome do ciclo</label>
      <input
        placeholder="Ex: 2026/1"
        value={nome}
        onChange={e => setNome(e.target.value)}
      />

      <label>Data de início (opcional)</label>
      <input
        type="date"
        value={dataInicio}
        onChange={e => setDataInicio(e.target.value)}
      />

      <label>Data de fim (opcional)</label>
      <input
        type="date"
        value={dataFim}
        onChange={e => setDataFim(e.target.value)}
      />

      <div className="actions-row">
        <button onClick={criar} disabled={loading}>
          💾 {loading ? 'Criando...' : 'Criar Ciclo'}
        </button>
      </div>
    </div>
  )
}
