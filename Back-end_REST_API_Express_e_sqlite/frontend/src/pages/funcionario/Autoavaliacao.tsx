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


  // - BUSCA ULTIMO MODELO

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

        if (!response.ok) {
          throw new Error()
        }

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


  // - CARREGA PERGUNTAS

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


  // - MARCA NOTA

  function marcarNota(index: number, valor: number) {
    const copia = [...notas]
    copia[index] = valor
    setNotas(copia)
  }


  // - ENVIA AUTOAVALIACAO

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

      setErro(null)
      setSucesso(true)
    } catch {
      setErro('Erro inesperado ao enviar autoavaliação')
    } finally {
      setEnviando(false)
    }
  }


  // - ESTADO DE SUCESSO

  if (sucesso) {
    return (
      <div style={{ padding: 30 }}>
        <h3 style={{ color: 'green' }}>
          ✅ Autoavaliação enviada com sucesso!
        </h3>

        <p>
          Sua autoavaliação foi registrada e já pode ser
          comparada com a avaliação do gestor.
        </p>

        <button onClick={onVoltar}>
          Voltar para o dashboard
        </button>
      </div>
    )
  }


  // - ESTADOS PADRAO

  if (loading) {
    return <p>Carregando autoavaliação...</p>
  }

  if (erro && perguntas.length === 0) {
    return (
      <div style={{ padding: 30 }}>
        <p style={{ color: 'red' }}>{erro}</p>
        <button onClick={onVoltar}>Voltar</button>
      </div>
    )
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Autoavaliação</h2>

      <p>
        Responda com sinceridade. Esta avaliação será comparada
        com a do gestor.
      </p>

      <hr />

      {perguntas.map((p, i) => (
        <div key={p.id} style={{ marginBottom: 20 }}>
          <strong>
            {i + 1}. {p.enunciado}
          </strong>

          <div style={{ marginTop: 8 }}>
            {[
              'Discordo totalmente',
              'Discordo',
              'Neutro',
              'Concordo',
              'Concordo totalmente'
            ].map((label, idx) => {
              const valor = idx + 1
              return (
                <label
                  key={valor}
                  style={{ display: 'block', cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name={`pergunta-${i}`}
                    checked={notas[i] === valor}
                    disabled={enviando}
                    onChange={() => marcarNota(i, valor)}
                  />{' '}
                  {valor} – {label}
                </label>
              )
            })}
          </div>
        </div>
      ))}

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <button
        onClick={enviarAutoavaliacao}
        disabled={enviando}
      >
        {enviando ? 'Enviando...' : 'Enviar Autoavaliação'}
      </button>

      <button
        onClick={onVoltar}
        style={{ marginLeft: 10 }}
        disabled={enviando}
      >
        Voltar
      </button>
    </div>
  )
}
