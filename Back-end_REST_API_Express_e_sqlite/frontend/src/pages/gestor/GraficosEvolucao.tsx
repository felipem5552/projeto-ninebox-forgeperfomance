import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

import {
  listarTimes,
  listarFuncionarios,
  nineBoxPorTimeEvolucao,
  buscarEvolucaoFuncionario
} from '../../services/api'
console.log('GRAFICO EVOLUCAO CARREGADO')
// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

type Props = {
  onVoltar: () => void
}

type Time = {
  id: number
  nome: string
}

type Funcionario = {
  id: number
  nome: string
}

type Evolucao = {
  ciclo_id: number
  ciclo_nome: string
  tipo: 'GESTOR' | 'AUTO'
  desempenho: number
  potencial: number
}

// ─────────────────────────────────────────────
// MONTAR DADOS DO GRÁFICO
// ─────────────────────────────────────────────

function montarDadosGrafico(dados: Evolucao[]) {
  const ciclos: Record<string, any> = {}

  dados.forEach(d => {
    if (!ciclos[d.ciclo_nome]) {
      ciclos[d.ciclo_nome] = { ciclo: d.ciclo_nome }
    }

    if (d.tipo === 'GESTOR') {
      ciclos[d.ciclo_nome].gestor_desempenho = d.desempenho
      ciclos[d.ciclo_nome].gestor_potencial = d.potencial
    }

    if (d.tipo === 'AUTO') {
      ciclos[d.ciclo_nome].auto_desempenho = d.desempenho
      ciclos[d.ciclo_nome].auto_potencial = d.potencial
    }
  })

  return Object.values(ciclos)
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export default function GraficoEvolucao({ onVoltar }: Props) {
  const [modo, setModo] = useState<'TIME' | 'FUNCIONARIO'>('TIME')

  const [times, setTimes] = useState<Time[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])

  const [timeId, setTimeId] = useState<number | null>(null)
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null)

  const [busca, setBusca] = useState('')

  const [dados, setDados] = useState<Evolucao[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // LOAD INICIAL
  useEffect(() => {
    listarTimes().then(setTimes)
    listarFuncionarios().then(setFuncionarios)
  }, [])

  // ─────────────────────────────────────────────
  // BUSCA FUNCIONÁRIO POR NOME
  // ─────────────────────────────────────────────
  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter(f =>
      f.nome.toLowerCase().includes(busca.toLowerCase())
    )
  }, [busca, funcionarios])

  // ─────────────────────────────────────────────
  // EVOLUÇÃO POR TIME
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (modo !== 'TIME' || !timeId) return

    setLoading(true)
    setErro(null)

    nineBoxPorTimeEvolucao(timeId)
      .then(data =>
        setDados(
          data.map(d => ({
            ciclo_id: d.ciclo_id,
            ciclo_nome: d.ciclo_nome,
            tipo: d.tipo,
            desempenho: Number(d.desempenho_medio ?? 0),
            potencial: Number(d.potencial_medio ?? 0)
          }))
        )
      )
      .catch(() => setErro('Erro ao carregar evolução do time'))
      .finally(() => setLoading(false))
  }, [modo, timeId])

  // ─────────────────────────────────────────────
  // EVOLUÇÃO POR FUNCIONÁRIO
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (modo !== 'FUNCIONARIO' || !funcionarioId) return

    setLoading(true)
    setErro(null)

    buscarEvolucaoFuncionario(funcionarioId)
      .then(setDados)
      .catch(() =>
        setErro('Erro ao carregar evolução do funcionário')
      )
      .finally(() => setLoading(false))
  }, [modo, funcionarioId])

  const dadosGrafico = useMemo(
    () => montarDadosGrafico(dados),
    [dados]
  )

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">
          <div className="page-header">
            <h2>📈 Gráficos de Evolução</h2>
            <button className="btn-secondary" onClick={onVoltar}>
              ⬅️ Voltar
            </button>
          </div>

          <div className="dashboard-divider" />

          {/* MODO */}
          <div className="actions-row">
            <button
              onClick={() => setModo('TIME')}
              disabled={modo === 'TIME'}
            >
              🧑‍🤝‍🧑 Por Time
            </button>

            <button
              onClick={() => setModo('FUNCIONARIO')}
              disabled={modo === 'FUNCIONARIO'}
            >
              👤 Por Funcionário
            </button>
          </div>

          <div className="dashboard-divider" />

          {/* TIME */}
          {modo === 'TIME' && (
            <>
              <label>Time</label>
              <select
                value={timeId ?? ''}
                onChange={e =>
                  setTimeId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">Selecione um time</option>
                {times.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* FUNCIONÁRIO */}
          {modo === 'FUNCIONARIO' && (
            <>
              <label>Funcionário</label>
              <input
                placeholder="Digite o nome do funcionário"
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />

              {busca && (
                <div className="dashboard-menu">
                  {funcionariosFiltrados.map(f => (
                    <button
                      key={f.id}
                      className="dashboard-item"
                      onClick={() => {
                        setFuncionarioId(f.id)
                        setBusca(f.nome)
                      }}
                    >
                      {f.nome}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {loading && <p>Carregando gráfico...</p>}
          {erro && <p className="error-text">{erro}</p>}

          {!loading && dadosGrafico.length === 0 && (
            <p style={{ marginTop: 15 }}>
              ⚠️ Nenhum dado encontrado.
            </p>
          )}

          {/* GRÁFICO */}
          {dadosGrafico.length > 0 && (
            <>
              <h3 style={{ marginTop: 20 }}>
                📊 Evolução por Ciclo
              </h3>

              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ciclo" />
                    <YAxis domain={[0, 3]} />
                    <Tooltip />
                    <Legend />

                    {/* Gestor */}
                    <Bar
                      dataKey="gestor_desempenho"
                      fill="#4caf50"
                      name="Gestor - Desempenho"
                    />
                    <Bar
                      dataKey="gestor_potencial"
                      fill="#2e7d32"
                      name="Gestor - Potencial"
                    />

                    {/* Auto */}
                    <Bar
                      dataKey="auto_desempenho"
                      fill="#ffb300"
                      name="Auto - Desempenho"
                    />
                    <Bar
                      dataKey="auto_potencial"
                      fill="#f57c00"
                      name="Auto - Potencial"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
