import { useEffect, useMemo, useState } from 'react'
import NineBox from '../funcionario/NineBox'
import {
  listarFuncionarios,
  listarCiclos,
  buscarResumoCicloFuncionario,
  buscarEvolucaoFuncionario,
  buscarPerguntasRespostasFuncionario
} from '../../services/api'

type Props = {
  onVoltar: () => void
}

type Funcionario = {
  id: number
  nome: string
}

type Ciclo = {
  id: number
  nome: string
}

type Avaliacao = {
  desempenho: number
  potencial: number
}

type ResumoCiclo = {
  ciclo: {
    id: number
    nome: string
  }
  gestor: Avaliacao | null
  auto: Avaliacao | null
}

type Evolucao = {
  ciclo_id: number
  ciclo_nome: string
  tipo: 'GESTOR' | 'AUTO'
  desempenho: number
  potencial: number
}

type PerguntaResposta = {
  pergunta: string
  nota: number
  tipo: 'GESTOR' | 'AUTO'
}

export default function RelatorioFuncionarios({ onVoltar }: Props) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [ciclos, setCiclos] = useState<Ciclo[]>([])

  const [busca, setBusca] = useState('')
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null)
  const [cicloId, setCicloId] = useState<number | null>(null)

  const [resumo, setResumo] = useState<ResumoCiclo | null>(null)
  const [evolucao, setEvolucao] = useState<Evolucao[]>([])
  const [perguntas, setPerguntas] = useState<PerguntaResposta[]>([])

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // ─────────────────────────────────────────────
  // LOAD INICIAL
  // ─────────────────────────────────────────────
  useEffect(() => {
    listarFuncionarios().then(setFuncionarios)
    listarCiclos().then(setCiclos)
  }, [])

  // ─────────────────────────────────────────────
  // FILTRO DE FUNCIONÁRIOS
  // ─────────────────────────────────────────────
  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter(f =>
      f.nome.toLowerCase().includes(busca.toLowerCase())
    )
  }, [busca, funcionarios])

  // ─────────────────────────────────────────────
  // CARREGAR RELATÓRIO
  // ─────────────────────────────────────────────
  async function carregarRelatorio() {
    if (!funcionarioId || !cicloId) return

    setLoading(true)
    setErro(null)

    try {
      const [resumoCiclo, evolucaoData, perguntasRaw] =
        await Promise.all([
          buscarResumoCicloFuncionario(funcionarioId, cicloId),
          buscarEvolucaoFuncionario(funcionarioId),
          buscarPerguntasRespostasFuncionario(funcionarioId, cicloId)
        ])

      // ✅ NORMALIZA PERGUNTAS (GESTOR + AUTO → ARRAY ÚNICO)
      const perguntasNormalizadas: PerguntaResposta[] = [
        ...perguntasRaw.gestor.map(p => ({
          pergunta: p.enunciado,
          nota: p.nota,
          tipo: 'GESTOR' as const
        })),
        ...perguntasRaw.auto.map(p => ({
          pergunta: p.enunciado,
          nota: p.nota,
          tipo: 'AUTO' as const
        }))
      ]

      setResumo(resumoCiclo)
      setEvolucao(evolucaoData)
      setPerguntas(perguntasNormalizadas)
    } catch {
      setErro('Erro ao carregar relatório do funcionário')
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // AGRUPA EVOLUÇÃO POR CICLO
  // ─────────────────────────────────────────────
  const evolucaoAgrupada = useMemo(() => {
    return evolucao.reduce<Record<number, Evolucao[]>>((acc, e) => {
      acc[e.ciclo_id] ||= []
      acc[e.ciclo_id].push(e)
      return acc
    }, {})
  }, [evolucao])

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">
          <div className="page-header">
            <h2>Relatório por Funcionário</h2>
            <button className="btn-secondary" onClick={onVoltar}>
              ⬅️ Voltar
            </button>
          </div>

          <div className="dashboard-divider" />

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
            <option value="">Selecione</option>
            {ciclos.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          {/* BUSCA FUNCIONÁRIO */}
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

          <div className="actions-row">
            <button
              onClick={carregarRelatorio}
              disabled={!funcionarioId || !cicloId}
            >
              🔍 Gerar Relatório
            </button>
          </div>

          {loading && <p>Carregando...</p>}
          {erro && <p className="error-text">{erro}</p>}

          {/* NINE BOX DO CICLO */}
          {resumo && (
            <>
              <h3>Nine Box do Ciclo</h3>
              <NineBox
                gestor={resumo.gestor ?? undefined}
                auto={resumo.auto ?? undefined}
                />
            </>
          )}

          {/* PERGUNTAS */}
          {perguntas.length > 0 && (
            <>
              <h3>Perguntas e Respostas</h3>

              {(['GESTOR', 'AUTO'] as const).map(tipo => (
                <div key={tipo}>
                  <h4>
                    {tipo === 'GESTOR'
                      ? 'Avaliação do Gestor'
                      : 'Autoavaliação'}
                  </h4>

                  <ul>
                    {perguntas
                      .filter(p => p.tipo === tipo)
                      .map((p, i) => (
                        <li key={i}>
                          {p.pergunta} — <strong>{p.nota}</strong>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </>
          )}

          {/* EVOLUÇÃO */}
          {Object.entries(evolucaoAgrupada).length > 0 && (
            <>
              <h3>Evolução</h3>

              {Object.entries(evolucaoAgrupada).map(
                ([_, dados]) => {
                  const gestor = dados.find(
                    d => d.tipo === 'GESTOR'
                  )
                  const auto = dados.find(
                    d => d.tipo === 'AUTO'
                  )

                  return (
                    <div key={dados[0].ciclo_id}>
                      <h4>{dados[0].ciclo_nome}</h4>
                      <NineBox
                        gestor={
                          gestor
                            ? {
                                desempenho: gestor.desempenho,
                                potencial: gestor.potencial
                              }
                            : undefined
                        }
                        auto={
                          auto
                            ? {
                                desempenho: auto.desempenho,
                                potencial: auto.potencial
                              }
                            : undefined
                        }
                      />
                    </div>
                  )
                }
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
