import { useState } from 'react'
import ListaFuncionarios from './ListaFuncionarios'
import ModelosAvaliacaoAdmin from './ModelosAvaliacaoAdmin'
import Configuracoes from './Configuracoes'

type Tela =
  | 'HOME'
  | 'FUNCIONARIOS'
  | 'MODELOS'
  | 'CONFIGURACOES'

type Props = {
  onLogout: () => void
}

export default function DashboardAdmin({ onLogout }: Props) {
  const [tela, setTela] = useState<Tela>('HOME')


  // - TELAS FILHAS


  if (tela === 'FUNCIONARIOS') {
    return (
      <ListaFuncionarios onVoltar={() => setTela('HOME')} />
    )
  }

  if (tela === 'MODELOS') {
    return (
      <ModelosAvaliacaoAdmin onVoltar={() => setTela('HOME')} />
    )
  }

  if (tela === 'CONFIGURACOES') {
    return (
      <Configuracoes onVoltar={() => setTela('HOME')} />
    )
  }


  // - TELA ADMIN

  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">

          <h1 className="dashboard-title">
             Painel Administrativo
          </h1>

          <p className="dashboard-subtitle">
            Gestão estrutural e administrativa do sistema
          </p>

          <div className="dashboard-divider" />

          <div className="dashboard-menu">

            <button
              className="dashboard-item"
              onClick={() => setTela('FUNCIONARIOS')}
            >
              <span className="dashboard-item-title">
                Funcionários
              </span>
              <small>
                Cadastro, edição, ativação e permissões
              </small>
            </button>

            <button
              className="dashboard-item"
              onClick={() => setTela('MODELOS')}
            >
              <span className="dashboard-item-title">
                Modelos de Avaliação
              </span>
              <small>
                Perguntas, pesos e estrutura das avaliações
              </small>
            </button>

            <button
              className="dashboard-item"
              onClick={() => setTela('CONFIGURACOES')}
            >
              <span className="dashboard-item-title">
                ⚙️ Configurações do Sistema
              </span>
              <small>
                Times, ciclos de avaliação e parâmetros
              </small>
            </button>

          </div>

          <div className="dashboard-divider" />

          <button
            className="dashboard-logout"
            onClick={onLogout}
          >
             Sair do sistema
          </button>

        </div>
      </div>
    </div>
  )
}
