import { useEffect, useState } from 'react'
import {
  nineBoxPorTime,
  listarFuncionarios,
  buscarHistoricoFuncionario,
  listarCiclos
} from '../../services/api'

type Props = {
  onVoltar: () => void
}

type RelatorioTime = {
  time: string
  nine_box: number
  quantidade: number
}

type Funcionario = {
  id: number
  nome: string
  time_id: number
  time_nome?: string
}

type Historico = {
  ciclo_id: number
  ciclo_nome: string
  desempenho: number
  potencial: number
  nine_box: number
  tipo: 'GESTOR' | 'AUTO'
}

type Ciclo = {
  id: number
  nome: string
}

type TipoRelatorio = 'TIME' | 'FUNCIONARIO'

export default function RelatoriosGestor({ onVoltar }: Props) {
  const [tipo, setTipo] = useState<TipoRelatorio>('TIME')

  const [relatorioTime, setRelatorioTime] = useState<RelatorioTime[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [historico, setHistorico] = useState<Historico[]>([])

  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [cicloId, setCicloId] = useState<number | null>(null)
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null)

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  
  // - CARREGA CICLOS E FUNCIONÁRIOS
  
  useEffect(() => {
    listarFuncionarios().then(setFuncionarios)
    listarCiclos().then(setCiclos)
  }, [])

  
  // - RELATÓRIO POR TIME
  
  useEffect(() => {
    if (tipo !== 'TIME' || !cicloId) return

    setErro(null)
    setLoading(true)

    nineBoxPorTime(cicloId)
      .then(setRelatorioTime)
      .catch(() =>
        setErro('Erro ao carregar relatório por time')
      )
      .finally(() => setLoading(false))
  }, [tipo, cicloId])

  
  // - HISTÓRICO POR FUNCIONÁRIO
  
  async function carregarHistorico() {
    if (!funcionarioId || !cicloId) return

    setErro(null)
    setLoading(true)

    try {
      const data = await buscarHistoricoFuncionario(
        funcionarioId,
        cicloId
      )
      setHistorico(data)
    } catch {
      setErro('Erro ao carregar histórico do funcionário')
    } finally {
      setLoading(false)
    }
  }

  
  // - RENDER
  
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">
          {/* HEADER */}
          <div className="header-row">
            <h2>📊 Relatórios</h2>

            <button
              className="btn-secondary"
              onClick={onVoltar}
            >
              ⬅️ Voltar
            </button>
          </div>

          <p className="dashboard-subtitle">
            Visualização de resultados por ciclo, time ou funcionário
          </p>

          <div className="dashboard-divider" />

          {/* 🔹 FILTRO CICLO */}
          <label>Ciclo</label>
          <select
            value={cicloId ?? ''}
            onChange={e => setCicloId(Number(e.target.value))}
          >
            <option value="">Selecione um ciclo</option>
            {ciclos.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          {/* TIPO DE RELATÓRIO */}
          <div className="actions-row" style={{ marginTop: 15 }}>
            <button
              onClick={() => setTipo('TIME')}
              disabled={tipo === 'TIME'}
            >
              🧑‍🤝‍🧑 Por Time
            </button>

            <button
              onClick={() => setTipo('FUNCIONARIO')}
              disabled={tipo === 'FUNCIONARIO'}
            >
              👤 Por Funcionário
            </button>
          </div>

          <div className="dashboard-divider" />

          
          {/* RELATÓRIO POR TIME */}
          
          {tipo === 'TIME' && (
            <>
              <h3>📦 Nine Box por Time</h3>

              {!cicloId && (
                <p className="hint-text">
                  Selecione um ciclo para visualizar o relatório.
                </p>
              )}

              {loading && <p>Carregando relatório...</p>}

              {relatorioTime.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Nine Box Médio</th>
                      <th>Avaliações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorioTime.map((r, i) => (
                      <tr key={i}>
                        <td>{r.time}</td>
                        <td>{r.nine_box}</td>
                        <td>{r.quantidade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          
          {/* RELATÓRIO POR FUNCIONÁRIO */}
          
          {tipo === 'FUNCIONARIO' && (
            <>
              <h3>📜 Histórico por Funcionário</h3>

              <label>Funcionário</label>
              <select
                value={funcionarioId ?? ''}
                onChange={e =>
                  setFuncionarioId(Number(e.target.value))
                }
              >
                <option value="">
                  Selecione um funcionário
                </option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nome} ({f.time_nome})
                  </option>
                ))}
              </select>

              <div className="actions-row" style={{ marginTop: 10 }}>
                <button
                  onClick={carregarHistorico}
                  disabled={!funcionarioId || !cicloId}
                >
                  🔍 Buscar
                </button>
              </div>

              {loading && <p>Carregando histórico...</p>}

              {historico.length > 0 && (
                <table className="table" style={{ marginTop: 20 }}>
                  <thead>
                    <tr>
                      <th>Ciclo</th>
                      <th>Desempenho</th>
                      <th>Potencial</th>
                      <th>Nine Box</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((h, i) => (
                      <tr key={i}>
                        <td>{h.ciclo_nome}</td>
                        <td>{h.desempenho}</td>
                        <td>{h.potencial}</td>
                        <td>{h.nine_box}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {erro && (
            <p className="error-text" style={{ marginTop: 15 }}>
              {erro}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
