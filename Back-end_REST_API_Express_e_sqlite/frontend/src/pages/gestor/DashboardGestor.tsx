import { useState } from 'react'
import ModelosAvaliacao from './ModelosAvaliacao'
import FuncionariosGestor from './FuncionariosGestor'
import RelatoriosGestor from './RelatoriosGestor'
import type { Usuario } from '../../App'

type Tela =
  | 'HOME'
  | 'MODELOS'
  | 'FUNCIONARIOS'
  | 'RELATORIOS'

type Props = {
  usuario: Usuario
  onLogout: () => void
}

export default function DashboardGestor({
  usuario,
  onLogout
}: Props) {
  const [tela, setTela] = useState<Tela>('HOME')

  const voltarHome = () => setTela('HOME')

  // =============================
  // TELAS
  // =============================

  if (tela === 'MODELOS') {
    return <ModelosAvaliacao onVoltar={voltarHome} />
  }

  if (tela === 'FUNCIONARIOS') {
    return (
      <FuncionariosGestor
        avaliadorId={usuario.id}
        onVoltar={voltarHome}
      />
    )
  }

  if (tela === 'RELATORIOS') {
    return <RelatoriosGestor onVoltar={voltarHome} />
  }

  // =============================
  // HOME
  // =============================
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">
          <h1 className="dashboard-title">
            🎯 Painel do Gestor
          </h1>

          <p className="dashboard-subtitle">
            Avaliação e acompanhamento de desempenho
          </p>

          <div className="dashboard-divider" />

          <div className="dashboard-menu">
            <button
              className="dashboard-item"
              onClick={() => setTela('FUNCIONARIOS')}
            >
              👥 Funcionários
              <small>Equipe e avaliações</small>
            </button>

            <button
              className="dashboard-item"
              onClick={() => setTela('MODELOS')}
            >
              📋 Modelos de Avaliação
              <small>Modelos disponíveis</small>
            </button>

            <button
              className="dashboard-item"
              onClick={() => setTela('RELATORIOS')}
            >
              📊 Relatórios
              <small>Times, funcionários e evolução</small>
            </button>

            <div className="dashboard-divider" />

            <button
              className="dashboard-logout"
              onClick={onLogout}
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
