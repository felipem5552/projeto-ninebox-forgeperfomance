type Avaliacao = {
  desempenho: number // 1 a 3
  potencial: number  // 1 a 3
}

type Props = {
  gestor?: Avaliacao
  auto?: Avaliacao
}

/**
 * Mapeia desempenho + potencial para o quadrante da Nine Box
 */
function calcularQuadrante(
  desempenho: number,
  potencial: number
): string {
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

  return mapa[`${desempenho}-${potencial}`] ?? ''
}

/**
 * Classe visual por nível de quadrante
 */
function classeQuadrante(quadrante: string) {
  if (['A', 'B', 'D'].includes(quadrante)) return 'q-alto'
  if (['C', 'E', 'G'].includes(quadrante)) return 'q-medio'
  return 'q-baixo'
}

/**
 * Significado dos quadrantes (linguagem clara)
 */
const SIGNIFICADO: Record<string, string> = {
  A: 'Alto desempenho e alto potencial',
  B: 'Bom desempenho com potencial de crescimento',
  C: 'Potencial presente, desempenho abaixo do esperado',
  D: 'Desempenho consistente, potencial moderado',
  E: 'Desempenho e potencial em desenvolvimento',
  F: 'Potencial limitado no momento',
  G: 'Bom desempenho técnico, baixo potencial',
  H: 'Desempenho abaixo do esperado',
  I: 'Baixo desempenho e baixo potencial'
}

export default function NineBox({
  gestor,
  auto
}: Props) {
  return (
    <div className="ninebox-container">
      <h3 className="dashboard-section-title">
        Nine Box
      </h3>

      {/* LAYOUT COM EIXO Y + GRID */}
      <div className="ninebox-layout">
        {/* EIXO Y – POTENCIAL */}
        <div className="axis axis-y">
          <span>Alto</span>
          <span>Médio</span>
          <span>Baixo</span>
          <strong>Potencial</strong>
        </div>

        {/* GRID */}
        <table className="ninebox-grid">
          <tbody>
            {[3, 2, 1].map(potencial => (
              <tr key={potencial}>
                {[1, 2, 3].map(desempenho => {
                  const gestorAtivo =
                    gestor?.desempenho === desempenho &&
                    gestor?.potencial === potencial

                  const autoAtivo =
                    auto?.desempenho === desempenho &&
                    auto?.potencial === potencial

                  const quadrante = calcularQuadrante(
                    desempenho,
                    potencial
                  )

                  return (
                    <td
                      key={`${desempenho}-${potencial}`}
                      className={`ninebox-cell ${classeQuadrante(
                        quadrante
                      )}`}
                    >
                      {/* MARCADOR COMBINADO */}
                      {gestorAtivo && autoAtivo && (
                        <span className="marker both">
                          G + A
                        </span>
                      )}

                      {/* MARCADORES INDIVIDUAIS */}
                      {gestorAtivo && !autoAtivo && (
                        <span className="marker gestor">
                          G
                        </span>
                      )}

                      {autoAtivo && !gestorAtivo && (
                        <span className="marker auto">
                          A
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EIXO X – DESEMPENHO */}
      <div className="axis axis-x">
        <span>Baixo</span>
        <span>Médio</span>
        <span>Alto</span>
        <strong>Desempenho</strong>
      </div>

      {/* LEGENDA */}
      <div className="ninebox-legend">
        <div>
          <span className="legend gestor">G</span> Avaliação do Gestor
        </div>
        <div>
          <span className="legend auto">A</span> Autoavaliação
        </div>
        <div>
          <span className="legend both">G + A</span> Avaliações alinhadas
        </div>
      </div>

      {/* RESUMO */}
      <div className="ninebox-summary">
        {gestor && (
          <p>
            <strong>Gestor:</strong>{' '}
            Quadrante{' '}
            <strong>
              {calcularQuadrante(
                gestor.desempenho,
                gestor.potencial
              )}
            </strong>{' '}
            –{' '}
            {
              SIGNIFICADO[
                calcularQuadrante(
                  gestor.desempenho,
                  gestor.potencial
                )
              ]
            }
          </p>
        )}

        {auto && (
          <p>
            <strong>Autoavaliação:</strong>{' '}
            Quadrante{' '}
            <strong>
              {calcularQuadrante(
                auto.desempenho,
                auto.potencial
              )}
            </strong>{' '}
            –{' '}
            {
              SIGNIFICADO[
                calcularQuadrante(
                  auto.desempenho,
                  auto.potencial
                )
              ]
            }
          </p>
        )}
      </div>
    </div>
  )
}
