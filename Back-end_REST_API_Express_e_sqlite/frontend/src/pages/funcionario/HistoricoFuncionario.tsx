import { useEffect, useState } from 'react'
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

  useEffect(() => {
    fetch(
      `http://localhost:4000/api/funcionarios/${funcionario.id}/historico`
    )
      .then(res => res.json())
      .then(data => setHistorico(data))
  }, [funcionario.id])

  //- Última avaliação
  const ultimaAvaliacao =
    historico.length > 0
      ? historico[0]
      : null

  return (
    <div style={{ padding: 20 }}>
      <h2>Histórico de {funcionario.nome}</h2>

      {historico.length === 0 && (
        <p>Nenhuma avaliação encontrada para este funcionário.</p>
      )}

      {ultimaAvaliacao && (
        <>
          <h3>Posição Atual na Nine Box</h3>
          <p>
            <strong>Ciclo:</strong>{' '}
            {ultimaAvaliacao.ciclo_nome}
          </p>

          <NineBox
            desempenho={ultimaAvaliacao.desempenho}
            potencial={ultimaAvaliacao.potencial}
          />

          <br />
        </>
      )}

      {historico.length > 0 && (
        <table border={1} cellPadding={8}>
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
                <td>{h.tipo}</td>
                <td>{h.desempenho}</td>
                <td>{h.potencial}</td>
                <td>{h.nine_box}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />

      <button onClick={onVoltar}>Voltar</button>
    </div>
  )
}
