import { useEffect, useState } from 'react'
import {
  buscarModeloAvaliacao,
  avaliarFuncionario
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
  modeloId: number
  onVoltar: () => void
}

const ESCALA = [
  { valor: 1, label: 'Discordo totalmente' },
  { valor: 2, label: 'Discordo' },
  { valor: 3, label: 'Neutro' },
  { valor: 4, label: 'Concordo' },
  { valor: 5, label: 'Concordo totalmente' }
]

export default function AvaliarFuncionario({
  funcionario,
  modeloId,
  onVoltar
}: Props) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [notas, setNotas] = useState<number[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    buscarModeloAvaliacao(modeloId)
      .then((data: Pergunta[]) => {
        setPerguntas(data)
        setNotas(new Array(data.length).fill(0))
      })
      .catch(() => setErro('Erro ao carregar perguntas'))
      .finally(() => setLoading(false))
  }, [modeloId])

  function alterarNota(index: number, valor: number) {
    const copia = [...notas]
    copia[index] = valor
    setNotas(copia)
  }

  async function enviarAvaliacao() {
    setErro(null)

    if (notas.some(n => n === 0)) {
      setErro('Responda todas as perguntas antes de enviar')
      return
    }

    try {
      const response = await avaliarFuncionario({
        Avaliador: 1, // depois vem do login
        Avaliado: funcionario.id,
        Modelo: modeloId,
        Ciclo: '2025',
        Notas: notas
      })

      if (response?.erro) {
        setErro(response.erro)
        return
      }

      alert('Avaliação enviada com sucesso')
      onVoltar()
    } catch {
      setErro('Erro ao enviar avaliação')
    }
  }

  if (loading) {
    return <p>Carregando perguntas...</p>
  }

  function renderPerguntas(eixo: 'DESEMPENHO' | 'POTENCIAL') {
    return perguntas
      .map((p, index) => ({ ...p, index }))
      .filter(p => p.eixo === eixo)
      .map(p => (
        <div
          key={p.id}
          style={{
            marginBottom: 20,
            padding: 10,
            borderBottom: '1px solid #444'
          }}
        >
          <strong>
            {p.index + 1}. {p.enunciado}
          </strong>

          <div style={{ marginTop: 8 }}>
            {ESCALA.map(opcao => (
              <label
                key={opcao.valor}
                style={{
                  display: 'block',
                  marginBottom: 6,
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name={`pergunta-${p.index}`}
                  value={opcao.valor}
                  checked={notas[p.index] === opcao.valor}
                  onChange={() =>
                    alterarNota(p.index, opcao.valor)
                  }
                  style={{ marginRight: 6 }}
                />
                {opcao.valor} – {opcao.label}
              </label>
            ))}
          </div>
        </div>
      ))
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Avaliar: {funcionario.nome}</h2>

      <h3>Desempenho</h3>
      {renderPerguntas('DESEMPENHO')}

      <h3>Potencial</h3>
      {renderPerguntas('POTENCIAL')}

      {erro && (
        <p style={{ color: 'red', marginTop: 10 }}>
          {erro}
        </p>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={enviarAvaliacao}>
          Enviar Avaliação
        </button>

        <button
          onClick={onVoltar}
          style={{ marginLeft: 10 }}
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
