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

export default function DashboardGestor({ usuario, onLogout }: Props) {
  const [tela, setTela] = useState<Tela>('HOME')

  const voltarHome = () => setTela('HOME')

  // =====================================================
  // - TELAS FILHAS
  // =====================================================

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

  // - HOME GESTOR 
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">
          <h1 className="dashboard-title">🎯 Painel do Gestor</h1>

          <p className="dashboard-subtitle">
            Avaliação e acompanhamento de desempenho
          </p>

          <div className="dashboard-divider" />

          <div className="dashboard-menu">
            <button
              type="button"
              className="dashboard-item"
              onClick={() => setTela('FUNCIONARIOS')}
            >
              👥 Funcionários
              <small>Visualização da equipe e avaliação</small>
            </button>

            <button
              type="button"
              className="dashboard-item"
              onClick={() => setTela('MODELOS')}
            >
              📋 Modelos de Avaliação
              <small>Consulta dos modelos disponíveis</small>
            </button>

            <button
              type="button"
              className="dashboard-item"
              onClick={() => setTela('RELATORIOS')}
            >
              📊 Relatórios
              <small>Resultados e histórico de avaliações</small>
            </button>

            <div className="dashboard-divider" />

            <button
              type="button"
              className="dashboard-logout"
              onClick={onLogout}
            >
              🚪 Sair do sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
