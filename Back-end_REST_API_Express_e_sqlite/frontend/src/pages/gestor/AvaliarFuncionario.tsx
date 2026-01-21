import { useEffect, useState } from 'react'
import {
  buscarModeloAvaliacao,
  avaliarFuncionario,
  buscarCicloAtivo,
  type Funcionario,
  type Ciclo
} from '../../services/api'

type Pergunta = {
  id: number
  enunciado: string
  eixo: 'DESEMPENHO' | 'POTENCIAL'
}

type Props = {
  funcionario: Funcionario
  avaliadorId: number
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
  avaliadorId,
  modeloId,
  onVoltar
}: Props) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [notas, setNotas] = useState<number[]>([])
  const [cicloAtivo, setCicloAtivo] = useState<Ciclo | null>(null)

  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)


  // CICLO ATIVO

  useEffect(() => {
    buscarCicloAtivo()
      .then(setCicloAtivo)
      .catch(() =>
        setErro('Erro ao identificar o ciclo ativo')
      )
  }, [])


  // PERGUNTAS

  useEffect(() => {
    setLoading(true)

    buscarModeloAvaliacao(modeloId)
      .then((data: Pergunta[]) => {
        setPerguntas(data)
        setNotas(new Array(data.length).fill(0))
      })
      .catch(() =>
        setErro(
          'Erro ao carregar perguntas do modelo de avaliação'
        )
      )
      .finally(() => setLoading(false))
  }, [modeloId])


  // ALTERAR NOTA

  function alterarNota(index: number, valor: number) {
    setNotas(prev => {
      const copia = [...prev]
      copia[index] = valor
      return copia
    })
  }


  // ENVIAR

  async function enviarAvaliacao() {
    if (enviando) return

    setErro(null)

    if (!cicloAtivo) {
      setErro('Nenhum ciclo ativo encontrado')
      return
    }

    if (notas.some(n => n === 0)) {
      setErro('Responda todas as perguntas antes de enviar')
      return
    }

    setEnviando(true)

    try {
      await avaliarFuncionario({
        Avaliador: avaliadorId,
        Avaliado: funcionario.id,
        Modelo: modeloId,
        Ciclo: cicloAtivo.id,
        Notas: notas
      })

      setSucesso(true)
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Erro ao enviar avaliação'
      )
    } finally {
      setEnviando(false)
    }
  }


  // RENDER PERGUNTAS

  function renderPerguntas(
    eixo: 'DESEMPENHO' | 'POTENCIAL'
  ) {
    return perguntas
      .map((p, index) => ({ ...p, index }))
      .filter(p => p.eixo === eixo)
      .map(p => (
        <div key={p.id} className="question-box">
          <div className="question-title">
            {p.index + 1}. {p.enunciado}
          </div>

          <div className="options">
            {ESCALA.map(opcao => (
              <label
                key={opcao.valor}
                className="option-row"
              >
                <input
                  type="radio"
                  name={`pergunta-${p.index}`}
                  checked={notas[p.index] === opcao.valor}
                  disabled={enviando}
                  onChange={() =>
                    alterarNota(p.index, opcao.valor)
                  }
                />

                <span>
                  {opcao.valor} – {opcao.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))
  }


  // LOADING

  if (loading) {
    return (
      <div className="page page-avaliacao">
        <div className="page-content">
          <p>Carregando perguntas...</p>
        </div>
      </div>
    )
  }


  // SUCESSO

  if (sucesso) {
    return (
      <div className="page page-avaliacao">
        <div className="page-content">
          <h3 className="success-text">
            ✅ Avaliação enviada com sucesso!
          </h3>

          <p>
            Avaliação registrada no ciclo{' '}
            <strong>{cicloAtivo?.nome}</strong>
          </p>

          <button
            className="btn-secondary"
            onClick={onVoltar}
          >
            ⬅️ Voltar
          </button>
        </div>
      </div>
    )
  }


  // INTERFACE

  return (
    <div className="page page-avaliacao">
      <div className="page-content">
        <div className="dashboard">
          {/* HEADER */}
          <div className="page-header">
            <h2>📝 Avaliar: {funcionario.nome}</h2>

          </div>
            <button
              className="btn-secondary"
              onClick={onVoltar}
              disabled={enviando}
            >
              ⬅️ Voltar
            </button>

          <p className="dashboard-subtitle">
            Ciclo ativo:{' '}
            <strong>
              {cicloAtivo?.nome ?? '—'}
            </strong>
          </p>

          <div className="dashboard-divider" />

          <h3>🎯 Desempenho</h3>
          {renderPerguntas('DESEMPENHO')}

          <div className="dashboard-divider" />

          <h3>🚀 Potencial</h3>
          {renderPerguntas('POTENCIAL')}

          {erro && (
            <p className="error-text">{erro}</p>
          )}

          <div className="dashboard-divider" />

          <div className="actions-row">
            <button
              onClick={enviarAvaliacao}
              disabled={enviando}
            >
              💾 {enviando
                ? 'Enviando...'
                : 'Enviar Avaliação'}
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
