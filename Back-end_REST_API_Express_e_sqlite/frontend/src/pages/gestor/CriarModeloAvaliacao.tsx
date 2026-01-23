import { useState } from 'react'
import { criarAvaliacao, adicionarPergunta } from '../../services/api'

type Pergunta = {
  enunciado: string
  eixo: 'DESEMPENHO' | 'POTENCIAL'
  peso: number
}

type Props = {
  onVoltar: () => void
}

export default function CriarModeloAvaliacao({ onVoltar }: Props) {
  const [titulo, setTitulo] = useState('')
  const [modeloId, setModeloId] = useState<number | null>(null)
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])

  const [enunciado, setEnunciado] = useState('')
  const [eixo, setEixo] =
    useState<'DESEMPENHO' | 'POTENCIAL'>('DESEMPENHO')

  const [erro, setErro] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)
  const [adicionando, setAdicionando] = useState(false)
  const [sucessoModelo, setSucessoModelo] = useState(false)

  const qtdDesempenho = perguntas.filter(
    p => p.eixo === 'DESEMPENHO'
  ).length

  const qtdPotencial = perguntas.filter(
    p => p.eixo === 'POTENCIAL'
  ).length

  const modeloCompleto = perguntas.length === 10

 
  // - CRIAR MODELO
 
  async function handleCriarModelo() {
    setErro(null)

    if (!titulo.trim()) {
      setErro('Informe o título do modelo')
      return
    }

    try {
      setCriando(true)
      const id = await criarAvaliacao(titulo.trim())

      if (!id || isNaN(id)) {
        setErro('Erro ao obter ID do modelo')
        return
      }

      setModeloId(id)
      setSucessoModelo(true)
    } catch {
      setErro('Erro ao criar modelo')
    } finally {
      setCriando(false)
    }
  }

 
  // - ADICIONAR PERGUNTA
 
  async function handleAdicionarPergunta() {
    if (adicionando || modeloCompleto) return

    setErro(null)

    if (!enunciado.trim()) {
      setErro('Informe o enunciado da pergunta')
      return
    }

    if (eixo === 'DESEMPENHO' && qtdDesempenho >= 5) {
      setErro('Limite de 5 perguntas de desempenho atingido')
      return
    }

    if (eixo === 'POTENCIAL' && qtdPotencial >= 5) {
      setErro('Limite de 5 perguntas de potencial atingido')
      return
    }

    try {
      setAdicionando(true)

      await adicionarPergunta(modeloId as number, {
        enunciado: enunciado.trim(),
        eixo,
        peso: 1
      })

      setPerguntas(prev => [
        ...prev,
        { enunciado: enunciado.trim(), eixo, peso: 1 }
      ])

      setEnunciado('')
    } catch {
      setErro('Erro ao adicionar pergunta')
    } finally {
      setAdicionando(false)
    }
  }
  //- RENDER
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">

          {/* HEADER */}
          <div className="page-header">
            <h2>Criar Modelo de Avaliação</h2>
          </div>

          <div className="dashboard-divider" />

          {/* ETAPA 1 – CRIAR MODELO        */}
          {modeloId === null && (
            <>
              <label>Título do modelo</label>
              <input
                placeholder="Ex: Avaliação Semestral"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                disabled={criando}
              />

              <div className="actions-row">
                <button
                  onClick={handleCriarModelo}
                  disabled={criando}
                >
                  💾 {criando ? 'Criando...' : 'Criar Modelo'}
                </button>

                <button
                  className="btn-secondary"
                  onClick={onVoltar}
                  disabled={criando}
                >
                  ⬅️ Voltar
                </button>
              </div>
            </>
          )}

          {/* FEEDBACK */}
          {sucessoModelo && modeloId !== null && (
            <p className="success-text">
              ✅ Modelo criado. Agora adicione as perguntas.
            </p>
          )}

          {/* ETAPA 2 – PERGUNTAS           */}
          {modeloId !== null && (
            <>
              <p className="dashboard-subtitle">
                <strong>Desempenho:</strong> {qtdDesempenho}/5 &nbsp;|&nbsp;
                <strong>Potencial:</strong> {qtdPotencial}/5
              </p>

              <label>Enunciado da pergunta</label>
              <textarea
                placeholder="Digite o enunciado da pergunta"
                value={enunciado}
                onChange={e => setEnunciado(e.target.value)}
                disabled={adicionando || modeloCompleto}
                rows={3}
              />

              <label>Eixo da pergunta</label>
              <select
                value={eixo}
                onChange={e =>
                  setEixo(
                    e.target.value === 'POTENCIAL'
                      ? 'POTENCIAL'
                      : 'DESEMPENHO'
                  )
                }
                disabled={adicionando || modeloCompleto}
              >
                <option value="DESEMPENHO">Desempenho</option>
                <option value="POTENCIAL">Potencial</option>
              </select>

              <div className="actions-row">
                <button
                  onClick={handleAdicionarPergunta}
                  disabled={adicionando || modeloCompleto}
                >
                  ➕ {adicionando ? 'Adicionando...' : 'Adicionar Pergunta'}
                </button>

                <button
                  className="btn-secondary"
                  onClick={onVoltar}
                >
                  ⬅️ Voltar
                </button>
              </div>

              <div className="dashboard-divider" />

              <h3>📌 Perguntas adicionadas</h3>

              {perguntas.length === 0 && (
                <p>Nenhuma pergunta adicionada ainda.</p>
              )}

              <ol>
                {perguntas.map((p, i) => (
                  <li key={i}>
                    <strong>[{p.eixo}]</strong> {p.enunciado}
                  </li>
                ))}
              </ol>

              {modeloCompleto && (
                <>
                  <p className="success-text">
                    ✅ Modelo completo com 10 perguntas
                  </p>

                  <div className="actions-row">
                    <button onClick={onVoltar}>
                      ✅ Concluir
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ERRO */}
          {erro && (
            <p className="error-text">{erro}</p>
          )}

        </div>
      </div>
    </div>
  )

}
