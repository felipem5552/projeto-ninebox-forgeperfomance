import { useEffect, useState } from 'react'
import {
  listarFuncionarios,
  buscarHistoricoFuncionario,
  buscarCicloAtivo,
  podeAvaliar
} from '../../services/api'

import HistoricoFuncionario from '../funcionario/HistoricoFuncionario'
import AvaliarFuncionarioFluxo from './AvaliarFuncionarioFluxo'

import type { Funcionario, Ciclo } from '../../services/api'

type Props = {
  onVoltar: () => void
  avaliadorId: number
}

type TelaInterna =
  | 'LISTA'
  | 'HISTORICO'
  | 'AVALIAR'

export default function FuncionariosGestor({
  onVoltar,
  avaliadorId
}: Props) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [avaliados, setAvaliados] = useState<number[]>([])
  const [cicloAtivo, setCicloAtivo] = useState<Ciclo | null>(null)

  const [podeAvaliarCiclo, setPodeAvaliarCiclo] = useState<{
    pode: boolean
    motivo?: string
  } | null>(null)

  const [tela, setTela] = useState<TelaInterna>('LISTA')
  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<Funcionario | null>(null)

  // FILTROS
  const [busca, setBusca] = useState('')
  const [filtroTime, setFiltroTime] = useState('')
  const [filtroStatus, setFiltroStatus] =
    useState<'TODOS' | 'PENDENTE' | 'AVALIADO'>('TODOS')

  // ─────────────────────────────────────────────
  // CICLO ATIVO
  // ─────────────────────────────────────────────
  useEffect(() => {
    buscarCicloAtivo().then(setCicloAtivo)
  }, [])

  // ─────────────────────────────────────────────
  // VERIFICAR SE PODE AVALIAR NO CICLO
  // ─────────────────────────────────────────────
  useEffect(() => {
    async function verificarCiclo() {
      if (!cicloAtivo) {
        setPodeAvaliarCiclo({
          pode: false,
          motivo: 'Nenhum ciclo ativo'
        })
        return
      }

      try {
        const res = await podeAvaliar(cicloAtivo.id)
        setPodeAvaliarCiclo(res)
      } catch {
        setPodeAvaliarCiclo({
          pode: false,
          motivo: 'Erro ao verificar ciclo'
        })
      }
    }

    verificarCiclo()
  }, [cicloAtivo])

  // ─────────────────────────────────────────────
  // FUNCIONÁRIOS (SEM ADMIN)
  // ─────────────────────────────────────────────
  async function carregarFuncionarios() {
    const data = await listarFuncionarios()

    const filtrados = data.filter(
      f => f.privilegios !== 'ADMIN'
    )

    setFuncionarios(filtrados)
  }

  useEffect(() => {
    carregarFuncionarios()
  }, [])

  // ─────────────────────────────────────────────
  // AVALIADOS NO CICLO
  // ─────────────────────────────────────────────
  useEffect(() => {
    async function verificarAvaliacoes() {
      if (!cicloAtivo) return

      const idsAvaliados: number[] = []

      for (const func of funcionarios) {
        const historico = await buscarHistoricoFuncionario(
          func.id,
          cicloAtivo.id
        )

        if (historico.length > 0) {
          idsAvaliados.push(func.id)
        }
      }

      setAvaliados(idsAvaliados)
    }

    if (funcionarios.length && cicloAtivo) {
      verificarAvaliacoes()
    }
  }, [funcionarios, cicloAtivo])

  function voltarLista() {
    setTela('LISTA')
    setFuncionarioSelecionado(null)
  }

  // ─────────────────────────────────────────────
  // TELAS INTERNAS
  // ─────────────────────────────────────────────

  if (tela === 'HISTORICO' && funcionarioSelecionado) {
    return (
      <HistoricoFuncionario
        funcionario={funcionarioSelecionado}
        onVoltar={voltarLista}
      />
    )
  }

  if (tela === 'AVALIAR' && funcionarioSelecionado && cicloAtivo) {
    return (
      <AvaliarFuncionarioFluxo
        avaliadorId={avaliadorId}
        funcionario={funcionarioSelecionado}
        onVoltar={voltarLista}
        onAtualizar={async () => {
          await carregarFuncionarios()
        }}
      />
    )
  }

  // ─────────────────────────────────────────────
  // FILTROS
  // ─────────────────────────────────────────────
  const funcionariosFiltrados = funcionarios.filter(func => {
    const jaAvaliado = avaliados.includes(func.id)

    if (
      busca &&
      !func.nome.toLowerCase().includes(busca.toLowerCase())
    ) {
      return false
    }

    if (filtroTime && func.time_nome !== filtroTime) {
      return false
    }

    if (filtroStatus === 'AVALIADO' && !jaAvaliado) {
      return false
    }

    if (filtroStatus === 'PENDENTE' && jaAvaliado) {
      return false
    }

    return true
  })

  const timesDisponiveis = Array.from(
    new Set(funcionarios.map(f => f.time_nome).filter(Boolean))
  )

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">
          <div className="page-header">
            <h2>Funcionários</h2>
          </div>

          <p className="dashboard-subtitle">
            Ciclo ativo:{' '}
            <strong>
              {cicloAtivo ? cicloAtivo.nome : 'Nenhum ciclo ativo'}
            </strong>
          </p>

          {/* BLOQUEIO DO CICLO */}
          {podeAvaliarCiclo && !podeAvaliarCiclo.pode && (
            <p className="error-text">
              ⛔ {podeAvaliarCiclo.motivo}
            </p>
          )}

          {/* FILTROS */}
          <div className="filters-row">
            <input
              placeholder="🔎 Buscar por nome"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />

            <select
              value={filtroTime}
              onChange={e => setFiltroTime(e.target.value)}
            >
              <option value="">Todos os times</option>
              {timesDisponiveis.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={e =>
                setFiltroStatus(
                  e.target.value as
                    | 'TODOS'
                    | 'PENDENTE'
                    | 'AVALIADO'
                )
              }
            >
              <option value="TODOS">Todos</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="AVALIADO">Avaliados</option>
            </select>

            <button onClick={onVoltar}>⬅️ Voltar</button>
          </div>

          <div className="dashboard-divider" />

          {/* TABELA */}
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Time</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {funcionariosFiltrados.map(func => {
                const jaAvaliado = avaliados.includes(func.id)
                const inativo = !func.ativo

                const bloqueado =
                  inativo ||
                  jaAvaliado ||
                  !podeAvaliarCiclo?.pode

                return (
                  <tr
                    key={func.id}
                    style={{ opacity: inativo ? 0.5 : 1 }}
                  >
                    <td>{func.nome}</td>
                    <td>{func.time_nome || '-'}</td>

                    <td>
                      {inativo ? (
                        <span className="status inativo">
                          ⛔ Inativo
                        </span>
                      ) : jaAvaliado ? (
                        <span className="status ativo">
                          ✅ Avaliado
                        </span>
                      ) : (
                        <span className="status pendente">
                          ⏳ Pendente
                        </span>
                      )}
                    </td>

                    <td className="actions-row">
                      <button
                        onClick={() => {
                          setFuncionarioSelecionado(func)
                          setTela('HISTORICO')
                        }}
                      >
                       Histórico
                      </button>
                      <button
                          style={{
                          opacity: bloqueado ? 0.5 : 1,
                          cursor: bloqueado ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => {
                          const jaAvaliado = avaliados.includes(func.id)
                          const inativo = !func.ativo

                          if (!podeAvaliarCiclo?.pode) {
                            alert(`⛔ ${podeAvaliarCiclo?.motivo || 'Ciclo não disponível'}`)
                            return
                          }

                          if (inativo) {
                            alert('⛔ Funcionário inativo não pode ser avaliado.')
                            return
                          }

                          if (jaAvaliado) {
                            alert('⚠️ Este funcionário já foi avaliado neste ciclo.')
                            return
                          }
                          setFuncionarioSelecionado(func)
                          setTela('AVALIAR')
                        }}
                      >
                        Avaliar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="dashboard-divider" />

          <p className="hint-text">
            ⛔ Funcionários inativos, já avaliados ou fora do período
            do ciclo não podem ser avaliados.
          </p>
        </div>
      </div>
    </div>
  )
}
