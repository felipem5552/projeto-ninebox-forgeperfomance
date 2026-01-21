import { useEffect, useState } from 'react'

type Ciclo = {
  id: number
  nome: string
  ativo: number
  data_inicio?: string
  data_fim?: string
}

export default function CiclosAdmin() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [nome, setNome] = useState('')
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
      body: JSON.stringify({ nome })
    })

    setNome('')
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
  return (
    <div className="form-sm">

      <h2>🔁 Ciclos de Avaliação</h2>
      <div className="list-box">
        {ciclos.length === 0 && (
          <p>Nenhum ciclo cadastrado.</p>
        )}

        {ciclos.map(c => (
          <div key={c.id} className="list-item">
            <span>
              {c.nome}{' '}
              {c.ativo === 1 && (
                <strong className="status ativo">
                  (ATIVO)
                </strong>
              )}
            </span>

            {c.ativo === 0 && (
              <button onClick={() => ativar(c.id)}>
                ▶️ Ativar
              </button>
            )}
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

      <div className="actions-row">
        <button onClick={criar} disabled={loading}>
          💾 {loading ? 'Criando...' : 'Criar Ciclo'}
        </button>
      </div>

    </div>
  )
}
