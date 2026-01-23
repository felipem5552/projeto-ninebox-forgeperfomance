import { useEffect, useMemo, useState } from 'react'
import NineBox from '../funcionario/NineBox'
import {
  listarFuncionarios,
  listarCiclos,
  nineBoxPorTime,
  nineBoxPorTimeEvolucao
} from '../../services/api'

type Props = {
  onVoltar: () => void
}

type Funcionario = {
  id: number
  nome: string
  time_id: number
  time_nome?: string
}

type Ciclo = {
  id: number
  nome: string
}

type NineBoxRow = {
  time_id: number
  time_nome: string
  tipo: 'GESTOR' | 'AUTO'
  desempenho_medio: number
  potencial_medio: number
  quantidade: number
}

type EvolucaoRow = {
  ciclo_id: number
  ciclo_nome: string
  tipo: 'GESTOR' | 'AUTO'
  desempenho_medio: number
  potencial_medio: number
  quantidade: number
}

export default function RelatorioTimes({ onVoltar }: Props) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [ciclos, setCiclos] = useState<Ciclo[]>([])

  const [cicloId, setCicloId] = useState<number | null>(null)
  const [timeId, setTimeId] = useState<number | null>(null)

  const [dadosTime, setDadosTime] = useState<NineBoxRow[]>([])
  const [evolucao, setEvolucao] = useState<EvolucaoRow[]>([])

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  
  // LOAD INICIAL
  
  useEffect(() => {
    listarFuncionarios().then(setFuncionarios)
    listarCiclos().then(setCiclos)
  }, [])

  
  // RELATÓRIO POR CICLO 
  
  useEffect(() => {
    if (!cicloId) return

    setLoading(true)
    setErro(null)

    nineBoxPorTime(cicloId)
      .then(data => {
        if (timeId) {
          setDadosTime(data.filter(d => d.time_id === timeId))
        } else {
          setDadosTime(data)
        }
      })
      .catch(() =>
        setErro('Erro ao carregar relatório por time')
      )
      .finally(() => setLoading(false))
  }, [cicloId, timeId])

  
  // EVOLUÇÃO DO TIME (TODOS OS CICLOS)
  
  useEffect(() => {
    if (!timeId || cicloId) return

    setLoading(true)
    setErro(null)

    nineBoxPorTimeEvolucao(timeId)
      .then(setEvolucao)
      .catch(() =>
        setErro('Erro ao carregar evolução do time')
      )
      .finally(() => setLoading(false))
  }, [timeId, cicloId])

  
  // AGRUPAMENTO GESTOR + AUTO (POR TIME)
  
  const agrupadoPorTime = useMemo(() => {
    const mapa: Record<
      number,
      {
        time_nome: string
        gestor?: { desempenho: number; potencial: number }
        auto?: { desempenho: number; potencial: number }
        quantidade: number
      }
    > = {}

    dadosTime.forEach(r => {
      if (!mapa[r.time_id]) {
        mapa[r.time_id] = {
          time_nome: r.time_nome,
          quantidade: 0
        }
      }

      const desempenho = Math.round(r.desempenho_medio)
      const potencial = Math.round(r.potencial_medio)

      if (r.tipo === 'GESTOR') {
        mapa[r.time_id].gestor = { desempenho, potencial }
      } else {
        mapa[r.time_id].auto = { desempenho, potencial }
      }

      mapa[r.time_id].quantidade += r.quantidade
    })

    return mapa
  }, [dadosTime])

  
  // AGRUPAMENTO EVOLUÇÃO (POR CICLO)
  
  const evolucaoAgrupada = useMemo(() => {
    return evolucao.reduce<Record<number, EvolucaoRow[]>>(
      (acc, item) => {
        acc[item.ciclo_id] ||= []
        acc[item.ciclo_id].push(item)
        return acc
      },
      {}
    )
  }, [evolucao])

  function agruparNineBox(dados: EvolucaoRow[]) {
    const gestor = dados.find(d => d.tipo === 'GESTOR')
    const auto = dados.find(d => d.tipo === 'AUTO')

    return {
      gestor: gestor
        ? {
            desempenho: Math.round(gestor.desempenho_medio),
            potencial: Math.round(gestor.potencial_medio)
          }
        : undefined,
      auto: auto
        ? {
            desempenho: Math.round(auto.desempenho_medio),
            potencial: Math.round(auto.potencial_medio)
          }
        : undefined,
      quantidade:
        (gestor?.quantidade || 0) +
        (auto?.quantidade || 0)
    }
  }

  
  // RENDER
  
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">
          <div className="page-header">
            <h2> Relatórios por Time</h2>
            <button className="btn-secondary" onClick={onVoltar}>
              ⬅️ Voltar
            </button>
          </div>

          <div className="dashboard-divider" />
          <div>É necessário selecionar ao menos 1 filtro.</div>

          {/* CICLO */}
          <label>Ciclo</label>
          <select
            value={cicloId ?? ''}
            onChange={e =>
              setCicloId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Todos os Ciclos</option>
            {ciclos.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          {/* TIME */}
          <label>Time</label>
          <select
            value={timeId ?? ''}
            onChange={e =>
              setTimeId(
                e.target.value ? Number(e.target.value) : null
              )
            }
          >
            <option value="">Todos os times</option>
            {[...new Map(
              funcionarios.map(f => [
                f.time_id,
                f.time_nome
              ])
            )].map(([id, nome]) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
          </select>

          <div className="dashboard-divider" />

          {erro && <p className="error-text">{erro}</p>}
          {loading && <p>Carregando...</p>}

          {/* VISÃO POR CICLO */}
          {cicloId &&
            Object.entries(agrupadoPorTime).map(
              ([timeId, time]) => (
                <div
                  key={timeId}
                  style={{
                    background: '#1e1e1e',
                    padding: 16,
                    borderRadius: 10,
                    marginBottom: 16
                  }}
                >
                  <h4 style={{ textAlign: 'center' }}>
                    {time.time_nome}
                  </h4>

                  <NineBox
                    gestor={time.gestor}
                    auto={time.auto}
                  />

                  <p
                    style={{
                      textAlign: 'center',
                      fontSize: 13,
                      opacity: 0.8,
                      marginTop: 8
                    }}
                  >
                    {time.quantidade} avaliações
                  </p>
                </div>
              )
            )}

          {/* EVOLUÇÃO DO TIME */}
          {!cicloId &&
            timeId &&
            Object.entries(evolucaoAgrupada).map(
              ([_, dados]) => {
                const { gestor, auto, quantidade } =
                  agruparNineBox(dados)

                return (
                  <div
                    key={dados[0].ciclo_id}
                    style={{
                      background: '#1e1e1e',
                      padding: 16,
                      borderRadius: 10,
                      marginBottom: 16
                    }}
                  >
                    <h4 style={{ textAlign: 'center' }}>
                      {dados[0].ciclo_nome}
                    </h4>

                    <NineBox gestor={gestor} auto={auto} />

                    <p
                      style={{
                        textAlign: 'center',
                        fontSize: 13,
                        opacity: 0.8,
                        marginTop: 8
                      }}
                    >
                      {quantidade} avaliações
                    </p>
                  </div>
                )
              }
            )}
        </div>
      </div>
    </div>
  )
}
