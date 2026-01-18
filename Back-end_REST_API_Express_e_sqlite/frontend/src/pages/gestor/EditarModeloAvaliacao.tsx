import { useEffect, useState } from 'react'
import {
  buscarModeloAvaliacao,
  adicionarPergunta,
  verificarUsoModelo
} from '../../services/api'

type Pergunta = {
  id: number
  enunciado: string
  eixo: 'DESEMPENHO' | 'POTENCIAL'
  peso: number
}

type Props = {
  modelo: {
    id: number
    titulo: string
  }
  onVoltar: () => void
}

export default function EditarModeloAvaliacao({ modelo, onVoltar }: Props) {
  /* =========================
     🔹 ESTADOS
  ========================= */
  const [titulo, setTitulo] = useState(modelo.titulo)
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [usos, setUsos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)

  const [enunciado, setEnunciado] = useState('')
  const [eixo, setEixo] =
    useState<'DESEMPENHO' | 'POTENCIAL'>('DESEMPENHO')
  const [erro, setErro] = useState<string | null>(null)

  /* =========================
     🔹 CARREGAMENTO INICIAL
  ========================= */
  useEffect(() => {
    buscarModeloAvaliacao(modelo.id).then(setPerguntas)

    verificarUsoModelo(modelo.id).then(r => {
      setUsos(r.total)
      setBloqueado(r.total > 0)
    })
  }, [modelo.id])

  const qtdDes = perguntas.filter(p => p.eixo === 'DESEMPENHO').length
  const qtdPot = perguntas.filter(p => p.eixo === 'POTENCIAL').length

  /* =========================
     🔹 SALVAR TÍTULO
  ========================= */
  async function salvarTitulo() {
    if (bloqueado) return

    await fetch(`http://localhost:4000/api/avaliacoes/${modelo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo })
    })

    alert('Título atualizado com sucesso')
  }

  /* =========================
     🔹 ATUALIZAR PERGUNTA
  ========================= */
  async function atualizarPergunta(pergunta: Pergunta) {
    if (bloqueado) return

    await fetch(`http://localhost:4000/api/pergunta/${pergunta.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pergunta)
    })

    alert('Pergunta atualizada')
  }

  /* =========================
     🔹 EXCLUIR PERGUNTA
  ========================= */
  async function excluirPergunta(id: number) {
    if (bloqueado) return
    if (!confirm('Deseja realmente excluir esta pergunta?')) return

    await fetch(`http://localhost:4000/api/perguntas/${id}`, {
      method: 'DELETE'
    })

    setPerguntas(perguntas.filter(p => p.id !== id))
  }

  /* =========================
     🔹 ADICIONAR PERGUNTA
  ========================= */
  async function adicionar() {
    setErro(null)

    if (bloqueado) return
    if (!enunciado) return setErro('Informe o enunciado da pergunta')

    if (eixo === 'DESEMPENHO' && qtdDes >= 5)
      return setErro('Máximo de 5 perguntas de desempenho')

    if (eixo === 'POTENCIAL' && qtdPot >= 5)
      return setErro('Máximo de 5 perguntas de potencial')

    await adicionarPergunta(modelo.id, {
      enunciado,
      eixo,
      peso: 1
    })

    setPerguntas([
      ...perguntas,
      { id: Date.now(), enunciado, eixo, peso: 1 }
    ])

    setEnunciado('')
  }

  /* =========================
     🔹 RENDER
  ========================= */
  return (
    <div style={{ padding: 30 }}>
      <button onClick={onVoltar}>Voltar</button>

      <h2>Editar Modelo de Avaliação</h2>

      <p>
        📊 Avaliações usando este modelo:{' '}
        <strong>{usos}</strong>
      </p>

      {bloqueado && (
        <p style={{ color: 'orange' }}>
          🔒 Este modelo já foi utilizado e não pode ser editado
        </p>
      )}

      {/* 🔹 TÍTULO */}
      <h3>Título do Modelo</h3>

      <input
        value={titulo}
        disabled={bloqueado}
        onChange={e => setTitulo(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />

      <button
        onClick={salvarTitulo}
        disabled={bloqueado}
      >
        Salvar Título
      </button>

      {/* 🔹 PERGUNTAS */}
      <h3 style={{ marginTop: 25 }}>Perguntas</h3>

      <p>
        Desempenho: {qtdDes}/5 | Potencial: {qtdPot}/5
      </p>

      {perguntas.map(p => (
        <div key={p.id} style={{ marginBottom: 10 }}>
          <input
            value={p.enunciado}
            disabled={bloqueado}
            onChange={e =>
              setPerguntas(perguntas.map(x =>
                x.id === p.id
                  ? { ...x, enunciado: e.target.value }
                  : x
              ))
            }
            style={{ width: '70%' }}
          />

          <button
            onClick={() => atualizarPergunta(p)}
            disabled={bloqueado}
            style={{ marginLeft: 5 }}
          >
            Salvar
          </button>

          <button
            onClick={() => excluirPergunta(p.id)}
            disabled={bloqueado}
            style={{ marginLeft: 5 }}
          >
            Excluir
          </button>
        </div>
      ))}

      {/* 🔹 ADICIONAR PERGUNTA */}
      {!bloqueado && (
        <>
          <h4 style={{ marginTop: 25 }}>
            Adicionar Pergunta
          </h4>

          <input
            placeholder="Enunciado"
            value={enunciado}
            onChange={e => setEnunciado(e.target.value)}
          />

          <select
            value={eixo}
            onChange={e => setEixo(e.target.value as any)}
            style={{ marginLeft: 5 }}
          >
            <option value="DESEMPENHO">Desempenho</option>
            <option value="POTENCIAL">Potencial</option>
          </select>

          <button
            onClick={adicionar}
            style={{ marginLeft: 5 }}
          >
            Adicionar
          </button>
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
