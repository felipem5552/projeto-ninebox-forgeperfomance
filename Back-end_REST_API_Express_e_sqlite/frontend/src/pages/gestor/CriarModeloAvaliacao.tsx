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
  const [eixo, setEixo] = useState<'DESEMPENHO' | 'POTENCIAL'>('DESEMPENHO')
  const [erro, setErro] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)

  const qtdDesempenho = perguntas.filter(p => p.eixo === 'DESEMPENHO').length
  const qtdPotencial = perguntas.filter(p => p.eixo === 'POTENCIAL').length
  const modeloCompleto = perguntas.length === 10

  /* =========================
     🔹 CRIAR MODELO
  ========================= */
  async function handleCriarModelo() {
    setErro(null)

    if (!titulo.trim()) {
      setErro('Informe o título do modelo')
      return
    }

    try {
      setCriando(true)
      const id = await criarAvaliacao(titulo.trim())

      if (id === null || id === undefined || isNaN(id)) {
        setErro('Erro ao obter ID do modelo')
        return
      }

      setModeloId(id)
    } catch (e) {
    console.error('ERRO AO CRIAR MODELO:', e)
    setErro('Erro ao criar modelo')
  } finally {
      setCriando(false)
    }
  }

  /* =========================
     🔹 ADICIONAR PERGUNTA
  ========================= */
  async function handleAdicionarPergunta() {
    setErro(null)

    if (modeloId === null) return

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
      await adicionarPergunta(modeloId, {
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
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onVoltar}>Voltar</button>

      <h2>Criar Modelo de Avaliação</h2>

      {/* =========================
         🔹 ETAPA 1 — CRIAR MODELO
      ========================= */}
      {modeloId === null && (
        <>
          <input
            placeholder="Título do modelo"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />

          <br /><br />

          <button onClick={handleCriarModelo} disabled={criando}>
            {criando ? 'Criando...' : 'Criar Modelo'}
          </button>
        </>
      )}

      {/* =========================
         🔹 ETAPA 2 — ADICIONAR PERGUNTAS
      ========================= */}
      {modeloId !== null && (
        <>
          <p>
            <strong>Desempenho:</strong> {qtdDesempenho}/5 |{' '}
            <strong>Potencial:</strong> {qtdPotencial}/5
          </p>

          <input
            placeholder="Enunciado da pergunta"
            value={enunciado}
            onChange={e => setEnunciado(e.target.value)}
          />

          <br /><br />

          <select
            value={eixo}
            onChange={e => setEixo(e.target.value as any)}
          >
            <option value="DESEMPENHO">Desempenho</option>
            <option value="POTENCIAL">Potencial</option>
          </select>

          <br /><br />

          <button
            onClick={handleAdicionarPergunta}
            disabled={modeloCompleto}
          >
            Adicionar Pergunta
          </button>

          <br /><br />

          <h4>Perguntas adicionadas</h4>
          <ol>
            {perguntas.map((p, i) => (
              <li key={i}>
                [{p.eixo}] {p.enunciado}
              </li>
            ))}
          </ol>

          {modeloCompleto && (
            <p style={{ color: 'green' }}>
              ✅ Modelo completo com 10 perguntas
            </p>
          )}
        </>
      )}

      {erro && (
        <p style={{ color: 'red', marginTop: 10 }}>
          {erro}
        </p>
      )}
    </div>
  )
}
