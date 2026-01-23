import { useState } from 'react'
import CiclosAdmin from './CiclosAdmin'
import TimesAdmin from './TimesAdmin'

type Aba = 'TIMES' | 'CICLOS'

type Props = {
  onVoltar: () => void
}

export default function Configuracoes({ onVoltar }: Props) {
  const [aba, setAba] = useState<Aba>('TIMES')

  return (
    <div className="page page-top">
      <div className="page-content">
        <div className="dashboard">

          <h1 className="dashboard-title">
            ⚙️ Configurações do Sistema
          </h1>

          <p className="dashboard-subtitle">
            Gerencie dados estruturais do sistema
          </p>

          <div className="dashboard-divider" />

          {/* ABAS */}
          <div className="tabs-row">
            <button
              className={`tab-button ${aba === 'TIMES' ? 'active' : ''}`}
              onClick={() => setAba('TIMES')}
            >
              Times
            </button>

            <button
              className={`tab-button ${aba === 'CICLOS' ? 'active' : ''}`}
              onClick={() => setAba('CICLOS')}
            >
              🔁 Ciclos de Avaliação
            </button>

            <button className="btn-secondary" onClick={onVoltar}>
              ⬅️ Voltar
            </button>
          </div>

          <div className="dashboard-divider" />

          {aba === 'TIMES' && <TimesAdmin />}
          {aba === 'CICLOS' && <CiclosAdmin />}

        </div>
      </div>
    </div>
  )
}
