import { useEffect, useState } from 'react'
import {
  listarFuncionarios,
  listarModelosAvaliacaoAtivos, 
  type Funcionario
} from '../../services/api'

import AvaliarFuncionario from './AvaliarFuncionario'

type Modelo = {
  id: number
  titulo: string
}

type Props = {
  avaliadorId: number
  funcionario: Funcionario
  onVoltar: () => void
  onAtualizar: () => void
}

export default function AvaliarFuncionarioFluxo({
  onVoltar,
  avaliadorId,
  funcionario: funcionarioInicial,
  onAtualizar
}: Props) {
  const [funcionarios, setFuncionarios] =
    useState<Funcionario[]>([])

  const [modelos, setModelos] =
    useState<Modelo[]>([])

  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<Funcionario | null>(
      funcionarioInicial ?? null
    )

  const [modeloSelecionado, setModeloSelecionado] =
    useState<number | null>(null)

  const [iniciar, setIniciar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  //- CARREGA FUNCIONÁRIOS E MODELOS
  useEffect(() => {
    listarFuncionarios().then(setFuncionarios)

    
    listarModelosAvaliacaoAtivos().then(setModelos)
  }, [])

  // - INICIAR AVALIAÇÃO
  if (iniciar && funcionarioSelecionado && modeloSelecionado) {
    return (
      <AvaliarFuncionario
        avaliadorId={avaliadorId}
        funcionario={funcionarioSelecionado}
        modeloId={modeloSelecionado}
        onVoltar={() => {
          onAtualizar()
          onVoltar()
        }}
      />
    )
  }

  return (
    <div style={{ padding: 30 }}>
      <button onClick={onVoltar}>Voltar</button>

      <h2>Avaliar Funcionário</h2>

      {/* FUNCIONÁRIO */}
      {!funcionarioInicial && (
        <>
          <h3>Funcionário</h3>

          <select
            value={funcionarioSelecionado?.id ?? ''}
            onChange={e => {
              const id = Number(e.target.value)
              const func = funcionarios.find(
                f => f.id === id
              )
              setFuncionarioSelecionado(func ?? null)
            }}
          >
            <option value="">
              Selecione um funcionário
            </option>

            {funcionarios
              .filter(f => f.ativo)
              .map(f => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                  {f.time_nome
                    ? ` (${f.time_nome})`
                    : ''}
                </option>
              ))}
          </select>
        </>
      )}

      {/* MODELO */}
      <h3>Modelo de Avaliação</h3>

      <select
        value={modeloSelecionado ?? ''}
        onChange={e =>
          setModeloSelecionado(Number(e.target.value))
        }
      >
        <option value="">
          Selecione um modelo
        </option>

        {modelos.map(m => (
          <option key={m.id} value={m.id}>
            {m.titulo}
          </option>
        ))}
      </select>

      <br /><br />

      <button
        onClick={() => {
          if (!funcionarioSelecionado || !modeloSelecionado) {
            setErro('Selecione o funcionário e o modelo')
            return
          }

          setErro(null)
          setIniciar(true)
        }}
      >
        Iniciar Avaliação
      </button>

      {erro && (
        <p style={{ color: 'red', marginTop: 10 }}>
          {erro}
        </p>
      )}
    </div>
  )
}
