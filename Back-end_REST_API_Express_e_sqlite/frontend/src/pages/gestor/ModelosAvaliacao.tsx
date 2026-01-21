import { useEffect, useState } from 'react'
import {
  listarModelosAvaliacao,
  verificarUsoModelo
} from '../../services/api'
import CriarModeloAvaliacao from '../gestor/CriarModeloAvaliacao'
import EditarModeloAvaliacao from '../gestor/EditarModeloAvaliacao'

type Tela = 'LISTA' | 'CRIAR' | 'EDITAR'

type Modelo = {
  id: number
  titulo: string
}

type ModeloComUso = Modelo & {
  usado: boolean
}

type Props = {
  onVoltar: () => void
}

export default function ListaModelosAvaliacao({
  onVoltar
}: Props) {
  // - ESTADOS
  const [tela, setTela] = useState<Tela>('LISTA')
  const [modelos, setModelos] = useState<ModeloComUso[]>([])
  const [modeloEdicao, setModeloEdicao] =
    useState<Modelo | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // - CARREGAR MODELOS
  async function carregar() {
    try {
      setErro(null)
      setLoading(true)

      const lista: Modelo[] =
        await listarModelosAvaliacao()

      const modelosComUso: ModeloComUso[] =
        await Promise.all(
          lista.map(async m => {
            const uso = await verificarUsoModelo(m.id)
            return {
              ...m,
              usado: uso.total > 0
            }
          })
        )

      setModelos(modelosComUso)
    } catch {
      setErro('Erro ao carregar modelos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tela === 'LISTA') {
      carregar()
    }
  }, [tela])

  
  // - TELAS SECUNDÁRIAS
  

  if (tela === 'CRIAR') {
    return (
      <CriarModeloAvaliacao
        onVoltar={() => setTela('LISTA')}
      />
    )
  }

  if (tela === 'EDITAR' && modeloEdicao) {
    return (
      <EditarModeloAvaliacao
        modelo={modeloEdicao}
        onVoltar={() => {
          setModeloEdicao(null)
          setTela('LISTA')
        }}
      />
    )
  }

  
  // - LISTA
  

  return (
    <div className="page">
      <div className="page-content">
        <h2>📋 Modelos de Avaliação</h2>

        {loading && <p>Carregando modelos...</p>}

        {erro && <p className="error-text">{erro}</p>}

        {!loading && modelos.length === 0 && (
          <p>Nenhum modelo cadastrado.</p>
        )}

        {!loading && modelos.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {modelos.map(m => (
                <tr key={m.id}>
                  <td>{m.titulo}</td>

                  <td>
                    {m.usado ? (
                      <span className="status inativo">🔒 Usado</span>
                    ) : (
                      <span className="status ativo">🆓 Livre</span>
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() => {
                        setModeloEdicao(m)
                        setTela('EDITAR')
                      }}
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* AÇÕES */}
        <div className="actions-row">
          <button onClick={() => setTela('CRIAR')}>
            ➕ Novo Modelo
          </button>
          
          <button onClick={onVoltar}>
            ⬅️ Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
