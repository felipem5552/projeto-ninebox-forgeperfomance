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

export default function EditarModeloAvaliacao({
  modelo,
  onVoltar
}: Props) {
  
  // - ESTADOS
  
  const [titulo, setTitulo] = useState(modelo.titulo)
  const [perguntas, setPerguntas] = useState<Pergunta[]>([])
  const [usos, setUsos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)

  const [enunciado, setEnunciado] = useState('')
  const [eixo, setEixo] =
    useState<'DESEMPENHO' | 'POTENCIAL'>('DESEMPENHO')

  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)

  const [salvandoTitulo, setSalvandoTitulo] = useState(false)
  const [salvandoPergunta, setSalvandoPergunta] = useState(false)
  const [adicionando, setAdicionando] = useState(false)

  
  // - CARREGAMENTO INICIAL
  
  useEffect(() => {
    buscarModeloAvaliacao(modelo.id).then(setPerguntas)

    verificarUsoModelo(modelo.id).then(r => {
      setUsos(r.total)
      setBloqueado(r.total > 0)
    })
  }, [modelo.id])

  const qtdDes = perguntas.filter(p => p.eixo === 'DESEMPENHO').length
  const qtdPot = perguntas.filter(p => p.eixo === 'POTENCIAL').length

  
  // - SALVAR TITULO
  
  async function salvarTitulo() {
    if (bloqueado || salvandoTitulo) return

    setErro(null)
    setMensagem(null)
    setSalvandoTitulo(true)

    try {
      const res = await fetch(
        `http://localhost:4000/api/avaliacoes/${modelo.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo })
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      setMensagem('Título atualizado com sucesso')
    } catch {
      setErro('Erro ao salvar título')
    } finally {
      setSalvandoTitulo(false)
    }
  }

  
  // - ATUALIZAR PERGUNTA
  
  async function atualizarPergunta(pergunta: Pergunta) {
    if (bloqueado || salvandoPergunta) return

    setErro(null)
    setMensagem(null)
    setSalvandoPergunta(true)

    try {
      const res = await fetch(
        `http://localhost:4000/api/pergunta/${pergunta.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pergunta)
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      setMensagem('Pergunta atualizada com sucesso')
    } catch {
      setErro('Erro ao atualizar pergunta')
    } finally {
      setSalvandoPergunta(false)
    }
  }

  
  // - EXCLUIR PERGUNTA
  
  async function excluirPergunta(id: number) {
    if (bloqueado) return
    if (!confirm('Deseja realmente excluir esta pergunta?')) return

    setErro(null)
    setMensagem(null)

    try {
      const res = await fetch(
        `http://localhost:4000/api/perguntas/${id}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        throw new Error()
      }

      setPerguntas(perguntas.filter(p => p.id !== id))
      setMensagem('Pergunta excluída')
    } catch {
      setErro('Erro ao excluir pergunta')
    }
  }

  
  // - ADICIONAR PERGUNTA
  
  async function adicionar() {
    if (bloqueado || adicionando) return

    setErro(null)
    setMensagem(null)

    if (!enunciado.trim()) {
      setErro('Informe o enunciado da pergunta')
      return
    }

    if (eixo === 'DESEMPENHO' && qtdDes >= 5) {
      setErro('Máximo de 5 perguntas de desempenho')
      return
    }

    if (eixo === 'POTENCIAL' && qtdPot >= 5) {
      setErro('Máximo de 5 perguntas de potencial')
      return
    }

    try {
      setAdicionando(true)

      const id = await adicionarPergunta(modelo.id, {
        enunciado: enunciado.trim(),
        eixo,
        peso: 1
      })

      if (!id) {
        throw new Error()
      }

      setPerguntas(prev => [
        ...prev,
        { id, enunciado: enunciado.trim(), eixo, peso: 1 }
      ])

      setEnunciado('')
      setMensagem('Pergunta adicionada')
    } catch {
      setErro('Erro ao adicionar pergunta')
    } finally {
      setAdicionando(false)
    }
  }

  // - RENDER

  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">

          {/* HEADER */}
          <div className="page-header">
            <h2>✏️ Editar Modelo de Avaliação</h2>
          </div>

          <p className="dashboard-subtitle">
            Avaliações usando este modelo: <strong>{usos}</strong>
          </p>

          {bloqueado && (
            <p className="error-text" style={{ color: 'orange' }}>
              🔒 Este modelo já foi utilizado e não pode ser editado
            </p>
          )}

          <div className="dashboard-divider" />

          {/* TÍTULO DO MODELO */}
          <h3>📌 Título do Modelo</h3>

          <input
            value={titulo}
            disabled={bloqueado || salvandoTitulo}
            onChange={e => setTitulo(e.target.value)}
          />

          <div className="actions-row">
            <button
              onClick={salvarTitulo}
              disabled={bloqueado || salvandoTitulo}
            >
              💾 {salvandoTitulo ? 'Salvando...' : 'Salvar Título'}
            </button>

            <button
              className="btn-secondary"
              onClick={onVoltar}
            >
              ⬅️ Voltar
            </button>
          </div>

          <div className="dashboard-divider" />

          {/* PERGUNTAS */}
          <h3>📝 Perguntas</h3>

          <p className="dashboard-subtitle">
            <strong>Desempenho:</strong> {qtdDes}/5 &nbsp;|&nbsp;
            <strong>Potencial:</strong> {qtdPot}/5
          </p>

          {perguntas.map(p => (
            <div key={p.id} className="question-box">
              <textarea
                value={p.enunciado}
                disabled={bloqueado || salvandoPergunta}
                onChange={e =>
                  setPerguntas(perguntas.map(x =>
                    x.id === p.id
                      ? { ...x, enunciado: e.target.value }
                      : x
                  ))
                }
                rows={2}
              />

              <div className="actions-row">
                <button
                  onClick={() => atualizarPergunta(p)}
                  disabled={bloqueado || salvandoPergunta}
                >
                  💾 Salvar
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => excluirPergunta(p.id)}
                  disabled={bloqueado}
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}

          {/* ADICIONAR PERGUNTA */}
          {!bloqueado && (
            <>
              <div className="dashboard-divider" />

              <h3>➕ Adicionar Pergunta</h3>

              <textarea
                placeholder="Enunciado da pergunta"
                value={enunciado}
                onChange={e => setEnunciado(e.target.value)}
                disabled={adicionando}
                rows={3}
              />

              <select
                value={eixo}
                onChange={e =>
                  setEixo(
                    e.target.value === 'POTENCIAL'
                      ? 'POTENCIAL'
                      : 'DESEMPENHO'
                  )
                }
                disabled={adicionando}
              >
                <option value="DESEMPENHO">Desempenho</option>
                <option value="POTENCIAL">Potencial</option>
              </select>

              <div className="actions-row">
                <button
                  onClick={adicionar}
                  disabled={adicionando}
                >
                  ➕ {adicionando ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </>
          )}

          {/* FEEDBACK */}
          {mensagem && (
            <p className="success-text">{mensagem}</p>
          )}

          {erro && (
            <p className="error-text">{erro}</p>
          )}

        </div>
      </div>
    </div>
  )

}
