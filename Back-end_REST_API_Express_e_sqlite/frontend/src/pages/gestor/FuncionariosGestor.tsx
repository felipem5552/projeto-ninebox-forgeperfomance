import { useEffect, useState } from 'react'
import {
  listarFuncionarios,
  buscarHistoricoFuncionario
} from '../../services/api'

import AvaliarFuncionarioFluxo from './AvaliarFuncionarioFluxo'
import HistoricoFuncionario from '../funcionario/HistoricoFuncionario'
import CadastrarFuncionario from './CadastrarFuncionario'

type Funcionario = {
  id: number
  nome: string
  email: string
  cargo: string
  time: string
}

type Props = {
  onVoltar: () => void
}

type TelaInterna =
  | 'LISTA'
  | 'AVALIAR'
  | 'HISTORICO'
  | 'CADASTRAR'

const CICLO_ATUAL = '2025'

export default function FuncionariosGestor({ onVoltar }: Props) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [avaliados, setAvaliados] = useState<number[]>([])

  const [tela, setTela] = useState<TelaInterna>('LISTA')
  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<Funcionario | null>(null)

  /* 🔹 CARREGA FUNCIONÁRIOS */
  async function carregarFuncionarios() {
    const data = await listarFuncionarios()
    setFuncionarios(data)
  }

  useEffect(() => {
    carregarFuncionarios()
  }, [])

  /* 🔹 VERIFICA QUEM JÁ FOI AVALIADO */
  useEffect(() => {
    async function verificarAvaliacoes() {
      const idsAvaliados: number[] = []

      for (const func of funcionarios) {
        const historico =
          await buscarHistoricoFuncionario(func.id)

        if (
          historico.some(
            (h: any) => h.ciclo === CICLO_ATUAL
          )
        ) {
          idsAvaliados.push(func.id)
        }
      }

      setAvaliados(idsAvaliados)
    }

    if (funcionarios.length > 0) {
      verificarAvaliacoes()
    }
  }, [funcionarios])

  function voltarLista() {
    setTela('LISTA')
    setFuncionarioSelecionado(null)
  }

  /* 🔁 TELAS INTERNAS */
  if (tela === 'CADASTRAR') {
    return (
      <CadastrarFuncionario
        onVoltar={async () => {
          await carregarFuncionarios()
          setTela('LISTA')
        }}
      />
    )
  }

  if (tela === 'AVALIAR' && funcionarioSelecionado) {
    return (
      <AvaliarFuncionarioFluxo
        funcionario={funcionarioSelecionado}
        onVoltar={async () => {
          await carregarFuncionarios()
          voltarLista()
        }}
      />
    )
  }

  if (tela === 'HISTORICO' && funcionarioSelecionado) {
    return (
      <HistoricoFuncionario
        funcionario={funcionarioSelecionado}
        onVoltar={voltarLista}
      />
    )
  }

  /* 🧭 LISTA DE FUNCIONÁRIOS */
  return (
    <div style={{ padding: 30 }}>
      <button onClick={onVoltar}>Voltar</button>

      <h2>Funcionários</h2>

      <p>Ciclo atual: {CICLO_ATUAL}</p>

      <button
        onClick={() => setTela('CADASTRAR')}
        style={{ marginBottom: 15 }}
      >
        ➕ Cadastrar Funcionário
      </button>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Time</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {funcionarios.map(func => {
            const jaAvaliado =
              avaliados.includes(func.id)

            return (
              <tr
                key={func.id}
                style={{
                  backgroundColor: jaAvaliado
                    ? '#1e3a2f'
                    : '#3a1e1e'
                }}
              >
                <td>{func.nome}</td>
                <td>{func.time}</td>
                <td>
                  {jaAvaliado
                    ? '✅ Avaliado'
                    : '⏳ Pendente'}
                </td>
                <td>
                  <button
                    onClick={() => {
                      setFuncionarioSelecionado(func)
                      setTela('HISTORICO')
                    }}
                  >
                    Histórico
                  </button>

                  <button
                    onClick={() => {
                      setFuncionarioSelecionado(func)
                      setTela('AVALIAR')
                    }}
                    disabled={jaAvaliado}
                    style={{ marginLeft: 8 }}
                  >
                    Avaliar
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p style={{ marginTop: 10 }}>
        ⛔ Funcionários já avaliados no ciclo não
        podem ser avaliados novamente.
      </p>
    </div>
  )
}
