import { useEffect, useMemo, useState } from 'react'
import NineBox from './NineBox'

type Historico = {
  ciclo_id: number
  ciclo_nome: string
  desempenho: number
  potencial: number
  nine_box: number
  tipo: 'GESTOR' | 'AUTO'
}

type Props = {
  funcionario: {
    id: number
    nome: string
  }
  onVoltar: () => void
}

export default function HistoricoFuncionario({
  funcionario,
  onVoltar
}: Props) {
  const [historico, setHistorico] = useState<Historico[]>([])
  const [cicloSelecionado, setCicloSelecionado] =
    useState<number | null>(null)

  
  // BUSCAR HISTÓRICO
  
  useEffect(() => {
    fetch(
      `http://localhost:4000/api/funcionarios/${funcionario.id}/historico`
    )
      .then(res => res.json())
      .then((data: Historico[]) => {
        setHistorico(data)

        // seleciona o ciclo mais recente por padrão
        if (data.length > 0) {
          setCicloSelecionado(data[0].ciclo_id)
        }
      })
  }, [funcionario.id])

  
  // CICLOS DISPONÍVEIS
  
  const ciclos = useMemo(() => {
    const map = new Map<number, string>()
    historico.forEach(h =>
      map.set(h.ciclo_id, h.ciclo_nome)
    )
    return Array.from(map.entries()).map(
      ([id, nome]) => ({ id, nome })
    )
  }, [historico])

  
  // AVALIAÇÕES DO CICLO SELECIONADO
  
  const avaliacaoGestor = historico.find(
    h =>
      h.ciclo_id === cicloSelecionado &&
      h.tipo === 'GESTOR'
  )

  const avaliacaoAuto = historico.find(
    h =>
      h.ciclo_id === cicloSelecionado &&
      h.tipo === 'AUTO'
  )

  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">
          {/* HEADER */}
          <div className="page-header">
            <h2>Histórico de {funcionario.nome}</h2>
          </div>

          <button
            className="btn-secondary"
            onClick={onVoltar}
          >
            ⬅️ Voltar
          </button>

          <p className="dashboard-subtitle">
            Selecione um ciclo para visualizar a
            comparação entre gestor e autoavaliação.
          </p>

          <div className="dashboard-divider" />

          {/* SEM HISTÓRICO */}
          {historico.length === 0 && (
            <p className="dashboard-warning">
              Nenhuma avaliação encontrada para este funcionário.
            </p>
          )}

          {/* FILTRO DE CICLO */}
          {historico.length > 0 && (
            <div className="filters-row">
              <label>
                Ciclo:
                <select
                  value={cicloSelecionado ?? ''}
                  onChange={e =>
                    setCicloSelecionado(
                      Number(e.target.value)
                    )
                  }
                >
                  {ciclos.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* NINE BOX DO CICLO */}
          {(avaliacaoGestor || avaliacaoAuto) && (
            <>
              <div className="dashboard-divider" />

              <h3>Nine Box do Ciclo</h3>

              <NineBox
                gestor={
                  avaliacaoGestor
                    ? {
                        desempenho:
                          avaliacaoGestor.desempenho,
                        potencial:
                          avaliacaoGestor.potencial
                      }
                    : undefined
                }
                auto={
                  avaliacaoAuto
                    ? {
                        desempenho:
                          avaliacaoAuto.desempenho,
                        potencial:
                          avaliacaoAuto.potencial
                      }
                    : undefined
                }
              />
            </>
          )}

          {/* TABELA DE HISTÓRICO */}
          {historico.length > 0 && (
            <>
              <div className="dashboard-divider" />

              <div className="table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Ciclo</th>
                      <th>Tipo</th>
                      <th>Desempenho</th>
                      <th>Potencial</th>
                      <th>Nine Box</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map(h => (
                      <tr key={`${h.ciclo_id}-${h.tipo}`}>
                        <td>{h.ciclo_nome}</td>
                        <td>
                          {h.tipo === 'AUTO'
                            ? 'Autoavaliação'
                            : 'Gestor'}
                        </td>
                        <td>{h.desempenho}</td>
                        <td>{h.potencial}</td>
                        <td>{h.nine_box}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
