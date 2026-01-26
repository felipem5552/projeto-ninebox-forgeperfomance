import { useEffect, useState } from 'react'
import type { Funcionario, Privilegio, Time } from '../../services/api'
import { listarTimes } from '../../services/api'

type Props = {
  funcionario: Funcionario
  onVoltar: () => void
  onSalvo: () => void
}

export default function EditarFuncionario({
  funcionario,
  onVoltar,
  onSalvo
}: Props) {

  // - ESTADOS

  const [nome, setNome] = useState(funcionario.nome)
  const [cargo, setCargo] = useState(funcionario.cargo || '')
  const [timeId, setTimeId] = useState<number>(
    funcionario.time_id
  )
  const [privilegios, setPrivilegios] =
    useState<Privilegio>(funcionario.privilegios)

  const [ativo, setAtivo] = useState<boolean>(funcionario.ativo)

  const [times, setTimes] = useState<Time[]>([])

  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)

  const [salvando, setSalvando] = useState(false)
  const [resetando, setResetando] = useState(false)
  const [alterandoStatus, setAlterandoStatus] =
    useState(false)


  // - CARREGA TIMES

  useEffect(() => {
    listarTimes().then(setTimes)
  }, [])


  // - SALVAR ALTERAÇÕES

  async function salvar() {
    if (salvando) return

    setErro(null)
    setMensagem(null)

    if (!nome.trim() || !timeId) {
      setErro('Nome e time são obrigatórios')
      return
    }

    setSalvando(true)

    try {
      const res = await fetch(
        `http://localhost:4000/api/funcionarios/${funcionario.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: nome.trim(),
            cargo: cargo.trim() || null,
            time_id: timeId,
            privilegios
          })
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.erro)
      }

      setMensagem('Funcionário atualizado com sucesso')
      onSalvo()
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar funcionário')
    } finally {
      setSalvando(false)
    }
  }


  // - RESETAR SENHA

  async function resetarSenha() {
    if (resetando) return

    if (
      !confirm(
        `Deseja resetar a senha de ${funcionario.nome}?`
      )
    )
      return

    setErro(null)
    setMensagem(null)
    setResetando(true)

    try {
      const res = await fetch(
        `http://localhost:4000/api/funcionarios/${funcionario.id}/reset-senha`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.erro)
      }

      setMensagem(
        'Senha resetada. O usuário deverá criar uma nova senha no próximo login.'
      )
    } catch (e: any) {
      setErro(e.message || 'Erro ao resetar senha')
    } finally {
      setResetando(false)
    }
  }


  // - DESATIVAR / REATIVAR

  async function alterarStatus() {
    if (alterandoStatus) return

    const acao = ativo ? 'desativar' : 'reativar'

    if (
      !confirm(
        `Deseja ${acao} o funcionário ${funcionario.nome}?`
      )
    )
      return

    setErro(null)
    setMensagem(null)
    setAlterandoStatus(true)

    try {
      const res = await fetch(
        `http://localhost:4000/api/funcionarios/${funcionario.id}/${acao}`,
        { method: 'POST' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.erro)
      }

      setAtivo(!ativo)
      setMensagem(
        ativo
          ? 'Funcionário desativado com sucesso'
          : 'Funcionário reativado com sucesso'
      )
      onSalvo()
    } catch (e: any) {
      setErro(
        e.message ||
          'Erro ao alterar status do funcionário'
      )
    } finally {
      setAlterandoStatus(false)
    }
  }


  // - RENDER

  return (
    <div className="page">
      <div className="page-content form-sm">
        <h2>✏️ Editar Funcionário</h2>

        {!ativo && (
          <p className="status inativo">
            ⛔ Funcionário desativado
          </p>
        )}

        <label>Nome *</label>
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          disabled={!ativo || salvando}
        />

        <label>Email</label>
        <input value={funcionario.email} disabled />

        <label>Cargo</label>
        <input
          value={cargo}
          onChange={e => setCargo(e.target.value)}
          disabled={!ativo || salvando}
        />

        <label>Time *</label>
        <select
          value={timeId}
          onChange={e => setTimeId(Number(e.target.value))}
          disabled={!ativo || salvando}
        >
          <option value="">Selecione um time</option>
          {times.map(t => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>

        <label>Perfil</label>
        <select
          value={privilegios}
          onChange={e =>
            setPrivilegios(e.target.value as Privilegio)
          }
          disabled={!ativo || salvando}
        >
          <option value="FUNCIONARIO">Funcionário</option>
          <option value="GESTOR">Gestor</option>
          <option value="ADMIN">Admin</option>
        </select>

        <div className="dashboard-divider" />

        <h3>🛠️ Ações Administrativas</h3>

        <div className="actions-row">
          <button
            onClick={resetarSenha}
            disabled={!ativo || resetando}
          >
            🔑 {resetando
              ? 'Resetando...'
              : 'Resetar Senha'}
          </button>

          <button
            onClick={alterarStatus}
            disabled={alterandoStatus}
          >
            {alterandoStatus
              ? 'Processando...'
              : ativo
              ? '⛔ Desativar'
              : '✅ Reativar'}
          </button>
        </div>

        <div className="dashboard-divider" />

        <div className="actions-row">
          <button
            onClick={salvar}
            disabled={!ativo || salvando}
          >
            💾 {salvando
              ? 'Salvando...'
              : 'Salvar'}
          </button>

          <button
            className="btn-secondary"
            onClick={onVoltar}
          >
            ⬅️ Voltar
          </button>
        </div>

        {mensagem && (
          <p className="success-text">{mensagem}</p>
        )}

        {erro && (
          <p className="error-text">{erro}</p>
        )}
      </div>
    </div>
  )
}
