import { useEffect, useState } from 'react'
import NineBox from './NineBox'
import HistoricoFuncionario from './HistoricoFuncionario'
import Autoavaliacao from './Autoavaliacao'

type Tela = 'HOME' | 'AUTOAVALIACAO' | 'HISTORICO'

type Resultado = {
  desempenho: number
  potencial: number
  nine_box: number
  tipo: 'GESTOR' | 'AUTO'
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
    useState<Resultado | null>(null)
  const [resultadoAuto, setResultadoAuto] =
    useState<Resultado | null>(null)
  const [loading, setLoading] = useState(true)

  function voltarHome() {
    setTela('HOME')
  }

  /* =========================
     🔹 CARREGA RESULTADOS
  ========================= */
  useEffect(() => {
    fetch(
      `http://localhost:4000/api/funcionarios/${funcionario.id}/historico`
    )
      .then(res => res.json())
      .then((dados: Resultado[]) => {
        const gestor = dados.find(
          d => d.tipo === 'GESTOR'
        )
        const auto = dados.find(
          d => d.tipo === 'AUTO'
        )

        setResultadoGestor(gestor || null)
        setResultadoAuto(auto || null)
      })
      .finally(() => setLoading(false))
  }, [funcionario.id])

  /* =========================
     🔁 TELAS SECUNDÁRIAS
  ========================= */
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

  /* =========================
     🏠 HOME
  ========================= */
  return (
    <div style={{ padding: 30 }}>
      <h1>Olá, {funcionario.nome} </h1>
      <p>Bem-vindo(a) à sua área de avaliações.</p>

      <hr style={{ margin: '20px 0' }} />

      {loading && <p>Carregando avaliações...</p>}

      {!loading && (
        <>
          {/* 🔹 AVALIAÇÃO DO GESTOR */}
          <h2>Avaliação do Gestor</h2>

          {resultadoGestor ? (
            <NineBox
              desempenho={resultadoGestor.desempenho}
              potencial={resultadoGestor.potencial}
            />
          ) : (
            <p>
              ⚠️ Você ainda não foi avaliado por um
              gestor.
            </p>
          )}

          <hr style={{ margin: '20px 0' }} />

          {/* 🔹 AUTOAVALIAÇÃO */}
          <h2>Autoavaliação</h2>

          {resultadoAuto ? (
            <NineBox
              desempenho={resultadoAuto.desempenho}
              potencial={resultadoAuto.potencial}
            />
          ) : (
            <p>
              📝 Você ainda não realizou sua
              autoavaliação.
            </p>
          )}

          <hr style={{ margin: '20px 0' }} />

          {/* 🔹 AÇÕES */}
          <h2>Ações</h2>

          <div
            style={{
              display: 'flex',
              gap: 15,
              marginTop: 15
            }}
          >
            {!resultadoAuto && resultadoGestor && (
              <button
                onClick={() =>
                  setTela('AUTOAVALIACAO')
                }
              >
                ✍️ Fazer Autoavaliação
              </button>
            )}

            <button
              onClick={() => setTela('HISTORICO')}
            >
              🕓 Histórico
            </button>

            <button onClick={onLogout}>
              🚪 Sair
            </button>
          </div>
        </>
      )}
    </div>
  )
}
