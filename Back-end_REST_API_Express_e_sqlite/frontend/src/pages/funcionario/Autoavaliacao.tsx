import { useEffect, useState } from 'react'
import {
  buscarModeloAvaliacao
} from '../../services/api'

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

  /* =========================
     🔹 BUSCA ÚLTIMO MODELO
  ========================= */
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
        throw new Error('Erro HTTP')
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

  /* =========================
     🔹 CARREGA PERGUNTAS
  ========================= */
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

  /* =========================
     🔹 MARCAR NOTA
  ========================= */
  function marcarNota(index: number, valor: number) {
    const copia = [...notas]
    copia[index] = valor
    setNotas(copia)
  }

  /* =========================
     🔹 ENVIAR AUTOAVALIAÇÃO
  ========================= */
  async function enviarAutoavaliacao() {
    setErro(null)

    if (notas.some(n => n === 0)) {
      setErro('Responda todas as perguntas')
      return
    }
      console.log('AUTOAVALIACAO PAYLOAD:', {
      avaliado: funcionario.id,
      modelo: modeloId,
      ciclo: '2025',
      notas
      })

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

      if (!response.ok) {
        setErro(data?.erro || 'Erro ao enviar autoavaliação')
        return
      }

      alert('✅ Autoavaliação enviada com sucesso!')
      onVoltar()
    } catch {
      setErro('Erro inesperado ao enviar autoavaliação')
    }
  }

  /* =========================
     🔹 ESTADOS
  ========================= */
  if (loading) {
    return <p>Carregando autoavaliação...</p>
  }

  if (erro) {
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
                  style={{
                    display: 'block',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name={`pergunta-${i}`}
                    checked={notas[i] === valor}
                    onChange={() =>
                      marcarNota(i, valor)
                    }
                  />{' '}
                  {valor} – {label}
                </label>
              )
            })}
          </div>
        </div>
      ))}

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <button onClick={enviarAutoavaliacao}>
        Enviar Autoavaliação
      </button>

      <button
        onClick={onVoltar}
        style={{ marginLeft: 10 }}
      >
        Voltar
      </button>
    </div>
  )
}
