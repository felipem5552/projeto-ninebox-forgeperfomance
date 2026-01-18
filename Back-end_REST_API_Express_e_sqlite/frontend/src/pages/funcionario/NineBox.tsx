type Props = {
  desempenho: number // 1 a 3
  potencial: number  // 1 a 3
}

export default function NineBox({
  desempenho,
  potencial
}: Props) {
  function getQuadrante(d: number, p: number): string {
    const mapa: Record<string, string> = {
      '1-1': 'I',
      '2-1': 'H',
      '3-1': 'G',
      '1-2': 'F',
      '2-2': 'E',
      '3-2': 'D',
      '1-3': 'C',
      '2-3': 'B',
      '3-3': 'A'
    }

    return mapa[`${d}-${p}`] || ''
  }

  function renderCell(x: number, y: number) {
    const ativo = x === desempenho && y === potencial

    return (
      <td
        key={`${x}-${y}`}
        style={{
          width: 80,
          height: 80,
          textAlign: 'center',
          verticalAlign: 'middle',
          backgroundColor: ativo ? '#4caf50' : '#2a2a2a',
          color: ativo ? '#000' : '#ccc',
          border: '1px solid #555',
          fontWeight: ativo ? 'bold' : 'normal',
          fontSize: 18
        }}
      >
        {ativo ? getQuadrante(x, y) : ''}
      </td>
    )
  }

  return (
    <div>
      <h3>Nine Box</h3>

      <table style={{ borderCollapse: 'collapse' }}>
        <tbody>
          {[3, 2, 1].map(pot => (
            <tr key={pot}>
              {[1, 2, 3].map(des => renderCell(des, pot))}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 10 }}>
        <strong>Desempenho:</strong> {desempenho} <br />
        <strong>Potencial:</strong> {potencial} <br />
        <strong>Quadrante:</strong>{' '}
        {getQuadrante(desempenho, potencial)}
      </p>
    </div>
  )
}
