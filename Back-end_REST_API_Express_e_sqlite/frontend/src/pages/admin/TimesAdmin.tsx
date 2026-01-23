import { useEffect, useState } from 'react'

type Time = {
  id: number
  nome: string
  ativo: number
}
type TimeRow = {
  id: number
  nome: string
  ativo: number
}

export default function TimesAdmin() {
  const [times, setTimes] = useState<Time[]>([])
  const [nome, setNome] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

 
  // - CARREGAR TIMES
 
  async function carregarTimes() {
    try {
      const res = await fetch('http://localhost:4000/api/times')
      const data = await res.json()
      setTimes(data)
    } catch {
      setErro('Erro ao carregar times')
    }
  }

  useEffect(() => {
    carregarTimes()
  }, [])

 
  // - CRIAR / EDITAR TIME
 
  async function salvar() {
    if (!nome.trim()) {
      setErro('Nome do time é obrigatório')
      return
    }

    setErro(null)
    setLoading(true)

    try {
      const url = editandoId
        ? `http://localhost:4000/api/times/${editandoId}`
        : `http://localhost:4000/api/times`

      const method = editandoId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim() })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.erro)
      }

      setNome('')
      setEditandoId(null)
      carregarTimes()
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar time')
    } finally {
      setLoading(false)
    }
  }

 
  // - ATIVAR / DESATIVAR
 
  async function alternarStatus(time: TimeRow) {
    try {
      const url =
        time.ativo === 1
          ? `/times/${time.id}/desativar`
          : `/times/${time.id}/reativar`

      const res = await fetch(`http://localhost:4000/api${url}`, {
        method: 'POST'
      })

      if (!res.ok) {
        throw new Error()
      }

      await carregarTimes() // recarrega lista
    } catch {
      setErro('Erro ao alterar status do time')
    }
  }

  // - RENDER
  
  return (
    <div className="form-sm">

      <h2>Times</h2>

      {erro && <p className="error-text">{erro}</p>}

      {/* LISTA */}
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {times.map(time => (
            <tr
              key={time.id}
              style={{ opacity: time.ativo === 0 ? 0.5 : 1 }}
            >
              <td>{time.nome}</td>

              <td>
                {time.ativo === 1 ? (
                  <span className="status ativo">🟢 Ativo</span>
                ) : (
                  <span className="status inativo">🔴 Inativo</span>
                )}
              </td>

              <td>
                <div className="table-actions">
                  <button
                    onClick={() => {
                      setEditandoId(time.id)
                      setNome(time.nome)
                    }}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => alternarStatus(time)}
                  >
                    {time.ativo === 1
                      ? '⛔ Desativar'
                      : '✅ Ativar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="dashboard-divider" />

      {/* FORMULÁRIO */}
      <h3>
        {editandoId
          ? '✏️ Editar Time'
          : '➕ Novo Time'}
      </h3>

      <label>Nome do time</label>
      <input
        placeholder="Ex: Tecnologia"
        value={nome}
        onChange={e => setNome(e.target.value)}
        disabled={loading}
      />

      <div className="actions-row">
        <button onClick={salvar} disabled={loading}>
          💾 {editandoId ? 'Salvar' : 'Adicionar'}
        </button>

        {editandoId && (
          <button
            onClick={() => {
              setEditandoId(null)
              setNome('')
            }}
            disabled={loading}
          >
            ❌ Cancelar
          </button>
        )}
      </div>

    </div>
  )
}
