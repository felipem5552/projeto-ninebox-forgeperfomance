import { useState } from 'react'
import ModelosAvaliacao from './ModelosAvaliacao'
import FuncionariosGestor from './FuncionariosGestor'
import AvaliarFuncionarioFluxo from './AvaliarFuncionarioFluxo'
import RelatoriosGestor from './RelatoriosGestor'


type Tela =
  | 'HOME'
  | 'MODELOS'
  | 'FUNCIONARIOS'
  | 'AVALIAR'
  | 'RELATORIOS'

 type Props = {
  onLogout: () => void
}

export default function DashboardGestor({ onLogout }: Props) {
  const [tela, setTela] = useState<Tela>('HOME')

  function voltarHome() {
    setTela('HOME')
  }

  /* 🔁 TELAS */
  if (tela === 'MODELOS') {
    return <ModelosAvaliacao onVoltar={voltarHome} />
  }

  if (tela === 'FUNCIONARIOS') {
    return <FuncionariosGestor onVoltar={voltarHome} />
  }

  if (tela === 'AVALIAR') {
    return <AvaliarFuncionarioFluxo onVoltar={voltarHome} />
  }

  if (tela === 'RELATORIOS') {
    return <RelatoriosGestor onVoltar={voltarHome} />
  }

  /* 🏠 HOME DO GESTOR */
  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Bem-vindo ao Sistema do Gestor!</h1>

        <button
          onClick={onLogout}
          style={{ margin: 70, display: 'flex' }}
        >
          Sair
        </button>
      </div>
      <p>Selecione uma opção para continuar:</p>

      <div style={{ marginTop: 30, display: 'flex', gap: 15 }}>
        <button onClick={() => setTela('MODELOS')}>
          Modelos de Avaliação
        </button>

        <button onClick={() => setTela('FUNCIONARIOS')}>
          Funcionários
        </button>

        <button onClick={() => setTela('AVALIAR')}>
          Avaliar Funcionário
        </button>

        <button onClick={() => setTela('RELATORIOS')}>
          Relatórios
        </button>
      </div>
    </div>
  )
}

