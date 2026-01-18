import { useEffect, useState } from 'react'
import {
  nineBoxPorTime,
  listarFuncionarios,
  buscarHistoricoFuncionario
} from '../../services/api'

type Props = {
  onVoltar: () => void
}

type RelatorioTime = {
  time: string
  nine_box: number
  quantidade: number
}

type Funcionario = {
  id: number
  nome: string
  time: string
}

type Historico = {
  ciclo: string
  desempenho: number
  potencial: number
  nine_box: number
}

type TipoRelatorio = 'TIME' | 'FUNCIONARIO'

export default function RelatoriosGestor({ onVoltar }: Props) {
  const [tipo, setTipo] = useState<TipoRelatorio>('TIME')

  const [relatorioTime, setRelatorioTime] =
    useState<RelatorioTime[]>([])

  const [funcionarios, setFuncionarios] =
    useState<Funcionario[]>([])

  const [funcionarioId, setFuncionarioId] =
    useState<number | null>(null)

  const [historico, setHistorico] =
    useState<Historico[]>([])

  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  /* 🔹 RELATÓRIO POR TIME */
  useEffect(() => {
    if (tipo !== 'TIME') return

    setErro(null)
    setLoading(true)

    nineBoxPorTime()
      .then(setRelatorioTime)
      .catch(() =>
        setErro('Erro ao carregar relatório por time')
      )
      .finally(() => setLoading(false))
  }, [tipo])

  /* 🔹 CARREGA FUNCIONÁRIOS */
  useEffect(() => {
    listarFuncionarios().then(setFuncionarios)
  }, [])

  /* 🔹 HISTÓRICO DO FUNCIONÁRIO */
  async function carregarHistorico() {
    if (!funcionarioId) return

    setErro(null)
    setLoading(true)

    try {
      const data =
        await buscarHistoricoFuncionario(funcionarioId)
      setHistorico(data)
    } catch {
      setErro(
        'Erro ao carregar histórico do funcionário'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <button onClick={onVoltar}>Voltar</button>

      <h2>Relatórios</h2>

      {/* 🔹 SELEÇÃO DO TIPO */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setTipo('TIME')}
          disabled={tipo === 'TIME'}
        >
          Por Time
        </button>

        <button
          onClick={() => setTipo('FUNCIONARIO')}
          style={{ marginLeft: 10 }}
          disabled={tipo === 'FUNCIONARIO'}
        >
          Por Funcionário
        </button>
      </div>

      {/* 🔹 RELATÓRIO POR TIME */}
      {tipo === 'TIME' && (
        <>
          <h3>Nine Box por Time</h3>

          {loading && <p>Carregando relatório...</p>}

          {!loading && relatorioTime.length === 0 && (
            <p>Nenhum dado disponível.</p>
          )}

          {relatorioTime.length > 0 && (
            <table border={1} cellPadding={8}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Nine Box Médio</th>
                  <th>Qtd. Avaliações</th>
                </tr>
              </thead>

              <tbody>
                {relatorioTime.map((r, i) => (
                  <tr key={i}>
                    <td>{r.time}</td>
                    <td>{r.nine_box}</td>
                    <td>{r.quantidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* 🔹 RELATÓRIO POR FUNCIONÁRIO */}
      {tipo === 'FUNCIONARIO' && (
        <>
          <h3>Histórico por Funcionário</h3>

          <select
            value={funcionarioId || ''}
            onChange={e =>
              setFuncionarioId(Number(e.target.value))
            }
          >
            <option value="">
              Selecione um funcionário
            </option>
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>
                {f.nome} ({f.time})
              </option>
            ))}
          </select>

          <button
            onClick={carregarHistorico}
            style={{ marginLeft: 10 }}
            disabled={!funcionarioId}
          >
            Buscar
          </button>

          {loading && <p>Carregando histórico...</p>}

          {!loading && funcionarioId && historico.length === 0 && (
            <p>Nenhuma avaliação encontrada.</p>
          )}

          {historico.length > 0 && (
            <table
              border={1}
              cellPadding={8}
              style={{ marginTop: 20 }}
            >
              <thead>
                <tr>
                  <th>Ciclo</th>
                  <th>Desempenho</th>
                  <th>Potencial</th>
                  <th>Nine Box</th>
                </tr>
              </thead>

              <tbody>
                {historico.map((h, i) => (
                  <tr key={i}>
                    <td>{h.ciclo}</td>
                    <td>{h.desempenho}</td>
                    <td>{h.potencial}</td>
                    <td>{h.nine_box}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {erro && (
        <p style={{ color: 'red', marginTop: 10 }}>
          {erro}
        </p>
      )}
    </div>
  )
}
