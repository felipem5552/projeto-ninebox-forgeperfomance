import { useState } from 'react'

import RelatorioTimes from './RelatorioTimes'
import RelatorioFuncionarios from './RelatorioFuncionarios'
import GraficosEvolucao from './GraficosEvolucao'

type Props = {
  onVoltar: () => void
}

type TelaRelatorio =
  | 'MENU'
  | 'TIMES'
  | 'FUNCIONARIOS'
  | 'GRAFICOS'
export default function RelatoriosGestor({ onVoltar }: Props) {
  const [tela, setTela] = useState<TelaRelatorio>('MENU')

  //- PAGINA INTERNA

  if (tela === 'TIMES') {
    return (
      <RelatorioTimes
        onVoltar={() => setTela('MENU')}
      />
    )
  }

  if (tela === 'FUNCIONARIOS') {
    return (
      <RelatorioFuncionarios
        onVoltar={() => setTela('MENU')}
      />
    )
  }

  if (tela === 'GRAFICOS') {
    return (
      <GraficosEvolucao
        onVoltar={() => setTela('MENU')}
      />
    )
  }

  //- RELATÓRIOS 

  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard dashboard-center">
          <h1 className="dashboard-title"> Relatórios</h1>

          <p className="dashboard-subtitle">
            Escolha o tipo de relatório que deseja visualizar
          </p>

          <div className="dashboard-divider" />

          <div className="dashboard-menu">
            <button
              className="dashboard-item"
              onClick={() => setTela('TIMES')}
            >
               Relatórios por Time
              <small>
                Nine Box consolidada por time e ciclo
              </small>
            </button>

            <button
              className="dashboard-item"
              onClick={() => setTela('FUNCIONARIOS')}
            >
               Relatórios por Funcionário
              <small>
                Histórico individual e avaliações
              </small>
            </button>

            <button
              className="dashboard-item"
              onClick={() => setTela('GRAFICOS')}
            >
               Gráficos de Evolução
              <small>
                Evolução da Nine Box ao longo dos ciclos
              </small>
            </button>

            <div className="dashboard-divider" />

            <button
              className="dashboard-logout"
              onClick={onVoltar}
            >
              ⬅️ Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
