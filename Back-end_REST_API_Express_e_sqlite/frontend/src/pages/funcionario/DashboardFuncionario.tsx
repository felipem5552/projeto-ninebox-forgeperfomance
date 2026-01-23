import { useEffect, useState } from 'react'
import NineBox from './NineBox'
import HistoricoFuncionario from './HistoricoFuncionario'
import Autoavaliacao from './Autoavaliacao'

type Tela = 'HOME' | 'AUTOAVALIACAO' | 'HISTORICO'

type AvaliacaoResumo = {
  desempenho: number
  potencial: number
  nine_box: number
}
type Avaliacao = {
  desempenho: number
  potencial: number
  nine_box: number
}

type ResumoCicloAtivo = {
  ciclo: {
    id: number
    nome: string
  }
  gestor: Avaliacao | null
  auto: Avaliacao | null
}


type Props = {
  funcionario: {
    id: number
    nome: string
  }
  onLogout: () => void
}

export default function DashboardFuncionario({
  funcionario,
  onLogout
}: Props) {
  const [tela, setTela] = useState<Tela>('HOME')
  const [resultadoGestor, setResultadoGestor] =
    useState<AvaliacaoResumo | null>(null)

  const [resultadoAuto, setResultadoAuto] =
    useState<AvaliacaoResumo | null>(null)
  const [loading, setLoading] = useState(true)

  // força reload após voltar de telas secundárias
  const [reload, setReload] = useState(0)

  function voltarHome() {
    setTela('HOME')
    setReload(r => r + 1)
  }

  // ─────────────────────────────────────────────
  // CARREGA RESULTADOS (GESTOR / AUTO)
  // ─────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)

    fetch(
      `http://localhost:4000/api/funcionarios/${funcionario.id}/resumo-ciclo-ativo`
    )
      .then(res => {
        if (!res.ok) {
          throw new Error('Erro ao carregar resumo do ciclo')
        }
        return res.json() as Promise<ResumoCicloAtivo>
      })
      .then(data => {
        setResultadoGestor(data.gestor)
        setResultadoAuto(data.auto)
      })
      .catch(() => {
        setResultadoGestor(null)
        setResultadoAuto(null)
      })
      .finally(() => setLoading(false))
  }, [funcionario.id, reload])



  // ─────────────────────────────────────────────
  // TELAS SECUNDÁRIAS
  // ─────────────────────────────────────────────
  if (tela === 'AUTOAVALIACAO') {
    return (
      <Autoavaliacao
        funcionario={funcionario}
        onVoltar={voltarHome}
      />
    )
  }

  if (tela === 'HISTORICO') {
    return (
      <HistoricoFuncionario
        funcionario={funcionario}
        onVoltar={voltarHome}
      />
    )
  }

  // ─────────────────────────────────────────────
  // HOME
  // ─────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard dashboard-center">
          <h1 className="dashboard-title">
            👤 Olá, {funcionario.nome}
          </h1>

          <p className="dashboard-subtitle">
            Bem-vindo(a) à sua área de avaliações
          </p>

          <div className="dashboard-divider" />

          {loading && <p>Carregando avaliações...</p>}

          {!loading && (
            <>
              {/* NINE BOX COMPARATIVA */}
              <h2 className="dashboard-section-title">
                Avaliação de Desempenho (Nine Box)
              </h2>

              {(resultadoGestor || resultadoAuto) ? (
                <NineBox
                  gestor={
                    resultadoGestor
                      ? {
                          desempenho:
                            resultadoGestor.desempenho,
                          potencial:
                            resultadoGestor.potencial
                        }
                      : undefined
                  }
                  auto={
                    resultadoAuto
                      ? {
                          desempenho:
                            resultadoAuto.desempenho,
                          potencial:
                            resultadoAuto.potencial
                        }
                      : undefined
                  }
                />
              ) : (
                <p className="dashboard-warning">
                  Nenhuma avaliação disponível até o momento.
                </p>
              )}

              <div className="dashboard-divider" />

              {/* AVISOS CONTEXTUAIS */}
              {!resultadoGestor && (
                <p className="dashboard-warning">
                  ⚠️ Você ainda não foi avaliado por um gestor.
                </p>
              )}

              {!resultadoAuto && resultadoGestor && (
                <p className="dashboard-warning">
                  ⚠️ Você ainda não realizou sua autoavaliação.
                </p>
              )}

              <div className="dashboard-divider" />

              {/* AÇÕES */}
              <h2 className="dashboard-section-title">
                Ações
              </h2>

              <div className="dashboard-menu">
                {!resultadoAuto && resultadoGestor && (
                  <button
                    className="dashboard-item"
                    onClick={() =>
                      setTela('AUTOAVALIACAO')
                    }
                  >
                    ⭐ Fazer Autoavaliação
                    <small>
                      Avalie seu próprio desempenho
                    </small>
                  </button>
                )}

                <button
                  className="dashboard-item"
                  onClick={() => setTela('HISTORICO')}
                >
                  🕓 Histórico
                  <small>
                    Avaliações anteriores
                  </small>
                </button>

                <div className="dashboard-divider" />

                <button
                  className="dashboard-logout"
                  onClick={onLogout}
                >
                  Sair do sistema
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
