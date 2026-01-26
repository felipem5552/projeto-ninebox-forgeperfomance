import { useEffect, useState } from 'react'
import { buscarModeloAvaliacao } from '../../services/api'

type Pergunta = {
  id: number
  enunciado: string
  eixo: 'DESEMPENHO' | 'POTENCIAL'
}

type Props = {
  funcionario: {
    id: number
    nome: string
  }
  onVoltar: () => void
}

const ESCALA = [
  { valor: 1, label: 'Discordo totalmente' },
  { valor: 2, label: 'Discordo' },
  { valor: 3, label: 'Neutro' },
  { valor: 4, label: 'Concordo' },
  { valor: 5, label: 'Concordo totalmente' }
]

export default function Autoavaliacao({
  funcionario,
  onVoltar
}: Props) {
  const [modeloId, setModeloId] = useState<number | null>(null)
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [notas, setNotas] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  
  // BUSCA ÚLTIMO MODELO
  
  useEffect(() => {
    async function buscarModelo() {
      try {
        const response = await fetch(
          `http://localhost:4000/api/funcionarios/${funcionario.id}/ultimo-modelo`
        )

        if (response.status === 404) {
          setErro('Você ainda não foi avaliado por um gestor')
          setLoading(false)
          return
        }

        if (!response.ok) throw new Error()

        const data = await response.json()

        if (!data.modeloId) {
          setErro('Modelo de avaliação não encontrado')
          setLoading(false)
          return
        }

        setModeloId(data.modeloId)
      } catch {
        setErro('Erro ao buscar modelo de avaliação')
        setLoading(false)
      }
    }

    buscarModelo()
  }, [funcionario.id])

  
  // CARREGA PERGUNTAS
  
  useEffect(() => {
    if (!modeloId) return

    buscarModeloAvaliacao(modeloId)
      .then((data: Pergunta[]) => {
        setPerguntas(data)
        setNotas(new Array(data.length).fill(0))
      })
      .catch(() => setErro('Erro ao carregar perguntas'))
      .finally(() => setLoading(false))
  }, [modeloId])

  
  // MARCAR NOTA
  
  function marcarNota(index: number, valor: number) {
    setNotas(prev => {
      const copia = [...prev]
      copia[index] = valor
      return copia
    })
  }

  
  // ENVIAR AUTOAVALIAÇÃO
  
  async function enviarAutoavaliacao() {
    if (enviando) return

    setErro(null)

    if (notas.some(n => n === 0)) {
      setErro('Responda todas as perguntas')
      return
    }

    setEnviando(true)

    try {
      const response = await fetch(
        'http://localhost:4000/api/autoavaliacao',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            avaliado: funcionario.id,
            modelo: modeloId,
            ciclo: '2025',
            notas
          })
        }
      )

      const data = await response.json()

      if (response.status === 409) {
        setErro('Você já realizou a autoavaliação neste ciclo')
        return
      }

      if (!response.ok) {
        setErro(data?.erro || 'Erro ao enviar autoavaliação')
        return
      }

      setSucesso(true)
    } catch {
      setErro('Erro inesperado ao enviar autoavaliação')
    } finally {
      setEnviando(false)
    }
  }

  
  // SUCESSO
  
  if (sucesso) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="dashboard dashboard-center">
            <h2>✅ Autoavaliação enviada</h2>

            <p className="dashboard-subtitle">
              Sua autoavaliação foi registrada e poderá ser
              comparada com a avaliação do gestor.
            </p>

            <div className="dashboard-divider" />

            <button onClick={onVoltar}>
              Voltar para o dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  
  // LOADING
  
  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="dashboard">
            <p>Carregando autoavaliação...</p>
          </div>
        </div>
      </div>
    )
  }

  
  // ERRO SEM PERGUNTAS
  
  if (erro && perguntas.length === 0) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="dashboard">
            <p className="error-text">{erro}</p>

            <button
              className="btn-secondary"
              onClick={onVoltar}
            >
              ⬅️ Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  
  // RENDER PRINCIPAL
  
  return (
    <div className="page page-avaliacao">
      <div className="page-content">
        <div className="dashboard">
          <div className="page-header">
            <h2>Autoavaliação</h2>
          </div>

          <button
            className="btn-secondary"
            onClick={onVoltar}
            disabled={enviando}
          >
            ⬅️ Voltar
          </button>

          <p className="dashboard-subtitle">
            Responda com sinceridade. Esta é sua{' '}
            <strong>autoavaliação</strong> e será comparada
            com a avaliação do gestor.
          </p>

          <div className="dashboard-divider" />

          {/* PERGUNTAS — MESMO PADRÃO DO GESTOR */}
          {perguntas.map((p, index) => (
            <div key={p.id} className="question-box">
              <div className="question-title">
                {index + 1}. {p.enunciado}
              </div>

              <div className="options">
                {ESCALA.map(opcao => (
                  <label
                    key={opcao.valor}
                    className="option-row"
                  >
                    <input
                      type="radio"
                      name={`pergunta-${index}`}
                      checked={
                        notas[index] === opcao.valor
                      }
                      disabled={enviando}
                      onChange={() =>
                        marcarNota(index, opcao.valor)
                      }
                    />

                    <span>
                      {opcao.valor} – {opcao.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {erro && (
            <p className="error-text">{erro}</p>
          )}

          <div className="dashboard-divider" />

          <div className="actions-row">
            <button
              onClick={enviarAutoavaliacao}
              disabled={enviando}
            >
              💾{' '}
              {enviando
                ? 'Enviando...'
                : 'Enviar Autoavaliação'}
            </button>

            <button
              className="btn-secondary"
              onClick={onVoltar}
              disabled={enviando}
            >
              ⬅️ Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
