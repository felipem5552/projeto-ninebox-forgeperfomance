import { useEffect, useState } from 'react'
import { listarFuncionarios } from '../../services/api'
import CadastrarFuncionarioAdmin from './CadastrarFuncionarioAdmin'
import EditarFuncionario from './EditarFuncionario'
import type { Funcionario } from '../../services/api'

type Tela = 'LISTA' | 'CADASTRO' | 'EDICAO'

type Props = {
  onVoltar: () => void
}

export default function ListaFuncionarios({ onVoltar }: Props) {
 
  // - ESTADOS
 
  const [tela, setTela] = useState<Tela>('LISTA')
  const [funcionarios, setFuncionarios] =
    useState<Funcionario[]>([])
  const [funcionarioEdicao, setFuncionarioEdicao] =
    useState<Funcionario | null>(null)

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // 🔍 FILTROS
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroStatus, setFiltroStatus] =
    useState<'ALL' | 'ATIVO' | 'INATIVO'>('ALL')
  const [filtroTime, setFiltroTime] = useState('ALL')

 
  // - CARREGAR FUNCIONARIOS
 
  useEffect(() => {
    if (tela === 'LISTA') carregar()
  }, [tela])

  async function carregar() {
    setErro(null)
    setLoading(true)
    try {
      const data = await listarFuncionarios()
      setFuncionarios(data)
    } catch {
      setErro('Erro ao carregar funcionários')
    } finally {
      setLoading(false)
    }
  }

 
  // - TIMES ÚNICOS
 
  const timesUnicos = Array.from(
    new Set(funcionarios.map(f => f.time_nome).filter(Boolean))
  )

 
  // - FILTRO
 
  const funcionariosFiltrados = funcionarios.filter(f => {
    const matchNome = f.nome
      .toLowerCase()
      .includes(filtroNome.toLowerCase())

    const matchStatus =
      filtroStatus === 'ALL' ||
      (filtroStatus === 'ATIVO' && f.ativo) ||
      (filtroStatus === 'INATIVO' && !f.ativo)

    const matchTime =
      filtroTime === 'ALL' || f.time_nome === filtroTime

    return matchNome && matchStatus && matchTime
  })

 
  // - TELAS FILHAS
 
  if (tela === 'CADASTRO') {
    return (
      <CadastrarFuncionarioAdmin
        onVoltar={() => setTela('LISTA')}
      />
    )
  }

  if (tela === 'EDICAO' && funcionarioEdicao) {
    return (
      <EditarFuncionario
        funcionario={funcionarioEdicao}
        onVoltar={() => {
          setFuncionarioEdicao(null)
          setTela('LISTA')
        }}
        onSalvo={carregar}
      />
    )
  }

 
  // - TELA LISTA
 
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard">

          <h2 className="dashboard-title">👥 Funcionários</h2>

          <div className="dashboard-divider" />
          <div className="filters-row">
            <input
              placeholder="🔍 Buscar por nome"
              value={filtroNome}
              onChange={e => setFiltroNome(e.target.value)}
            />

            <select
              value={filtroTime}
              onChange={e => setFiltroTime(e.target.value)}
            >
              <option value="ALL">Todos os times</option>
              {timesUnicos.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={e =>
                setFiltroStatus(
                  e.target.value as
                    | 'ALL'
                    | 'ATIVO'
                    | 'INATIVO'
                )
              }
            >
              <option value="ALL">Todos</option>
              <option value="ATIVO">Ativos</option>
              <option value="INATIVO">Inativos</option>
            </select>

            <button
              className="btn-secondary"
              onClick={onVoltar}
            >
              ⬅️ Voltar
            </button>
          </div>

          {loading && <p>Carregando funcionários...</p>}
          {erro && <p className="error-text">{erro}</p>}

          {!loading && !erro && (
            <>
              {funcionariosFiltrados.length === 0 ? (
                <p>Nenhum funcionário encontrado.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Cargo</th>
                      <th>Time</th>
                      <th>Perfil</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {funcionariosFiltrados.map(f => (
                      <tr
                        key={f.id}
                        style={{
                          opacity: f.ativo ? 1 : 0.5
                        }}
                      >
                        <td>{f.nome}</td>
                        <td>{f.email}</td>
                        <td>{f.cargo}</td>
                        <td>{f.time_nome}</td>
                        <td>{f.privilegios}</td>
                        <td>
                          {f.ativo ? (
                            <span className="status ativo">
                              🟢 Ativo
                            </span>
                          ) : (
                            <span className="status inativo">
                              🔴 Inativo
                            </span>
                          )}
                        </td>
                        <td className="table-actions">
                          <button
                            onClick={() => {
                              setFuncionarioEdicao(f)
                              setTela('EDICAO')
                            }}
                          >
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="dashboard-divider" />
              <div className="actions-row">
                <button onClick={() => setTela('CADASTRO')}>
                  ➕ Cadastrar
                </button>

                <button onClick={carregar}>
                  🔄 Atualizar
                </button>

                <button
                  className="btn-secondary"
                  onClick={onVoltar}
                >
                  ⬅️ Voltar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
