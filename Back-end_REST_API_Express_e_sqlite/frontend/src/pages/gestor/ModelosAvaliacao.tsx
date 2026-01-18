import { useEffect, useState } from 'react'
import {
  listarModelosAvaliacao,
} from '../../services/api'
import CriarModeloAvaliacao from './CriarModeloAvaliacao'
import EditarModeloAvaliacao from './EditarModeloAvaliacao'

type Modelo = {
  id: number
  titulo: string
}

type Props = {
  onVoltar: () => void
}

export default function ModelosAvaliacao({ onVoltar }: Props) {
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [criando, setCriando] = useState(false)
  const [modeloSelecionado, setModeloSelecionado] =
    useState<Modelo | null>(null)

  useEffect(() => {
    carregarModelos()
  }, [])

  async function carregarModelos() {
    setErro(null)
    setLoading(true)

    try {
      const data: Modelo[] = await listarModelosAvaliacao()
      setModelos(data)
    } catch {
      setErro('Erro ao carregar modelos de avaliação')
    } finally {
      setLoading(false)
    }
  }

  /* 🔁 CRIAR MODELO */
  if (criando) {
    return (
      <CriarModeloAvaliacao
        onVoltar={() => {
          setCriando(false)
          carregarModelos()
        }}
      />
    )
  }

  if (modeloSelecionado) {
  return (
    <EditarModeloAvaliacao
      modelo={modeloSelecionado}
      onVoltar={() => {
    setModeloSelecionado(null)
    carregarModelos()
    }}
    />
  )
}

  return (
    <div style={{ padding: 30 }}>
      <button onClick={onVoltar}>Voltar</button>

      <h2>Modelos de Avaliação</h2>

      <button
        onClick={() => setCriando(true)}
        style={{ marginBottom: 20 }}
      >
        + Criar Novo Modelo
      </button>

      {loading && <p>Carregando modelos...</p>}

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {!loading && modelos.length === 0 && (
        <p>Nenhum modelo encontrado.</p>
      )}

      {modelos.map(m => (
        <div
          key={m.id}
          style={{
            border: '1px solid #444',
            padding: 15,
            marginBottom: 10
          }}
        >
          <strong>{m.titulo}</strong>

          <div style={{ marginTop: 10 }}>
            <button onClick={() => setModeloSelecionado(m)}>
              Ver Modelo
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

