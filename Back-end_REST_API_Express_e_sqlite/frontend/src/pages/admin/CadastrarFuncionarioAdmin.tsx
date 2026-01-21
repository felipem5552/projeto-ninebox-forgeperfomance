import { useEffect, useState } from 'react'
import {
  cadastrarFuncionario,
  listarTimes,
  type Privilegio,
  type Time
} from '../../services/api'

type Props = {
  onVoltar: () => void
  onSalvo?: () => void
}

export default function CadastrarFuncionarioAdmin({
  onVoltar,
  onSalvo
}: Props) {

  // - ESTADOS

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cargo, setCargo] = useState('')
  const [privilegios, setPrivilegios] =
    useState<Privilegio>('FUNCIONARIO')

  const [times, setTimes] = useState<Time[]>([])
  const [timeId, setTimeId] = useState<number | ''>('')

  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)


  // - CARREGA TIMES

  useEffect(() => {
    listarTimes()
      .then(setTimes)
      .catch(() =>
        setErro('Erro ao carregar lista de times')
      )
  }, [])


  // - SALVAR

  async function salvar() {
    setErro(null)
    setMensagem(null)

    if (!nome || !email || !timeId) {
      setErro('Preencha os campos obrigatórios')
      return
    }

    try {
      setSalvando(true)

      await cadastrarFuncionario({
        nome,
        email,
        cargo: cargo || undefined,
        time_id: timeId,
        privilegios
      })

      setMensagem('Funcionário cadastrado com sucesso')

      // limpa formulário
      setNome('')
      setEmail('')
      setCargo('')
      setTimeId('')
      setPrivilegios('FUNCIONARIO')

      onSalvo?.()
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Erro ao cadastrar funcionário'
      )
    } finally {
      setSalvando(false)
    }
  }


  // - RENDER

  return (
    <div className="page">
      <div className="page-content form-sm">
        <h2>➕ Cadastrar Funcionário</h2>
        <label>Nome *</label>
        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          disabled={salvando}
        />
        <label>Email *</label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={salvando}
        />
        <label>Cargo</label>
        <input
          value={cargo}
          onChange={e => setCargo(e.target.value)}
          disabled={salvando}
        />
        <label>Time *</label>
        <select
          value={timeId}
          onChange={e => setTimeId(Number(e.target.value))}
          disabled={salvando}
        >
          <option value="">Selecione um time</option>
          {times.map(t => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        <label>Perfil *</label>
        <select
          value={privilegios}
          onChange={e =>
            setPrivilegios(e.target.value as Privilegio)
          }
          disabled={salvando}
        >
          <option value="FUNCIONARIO">Funcionário</option>
          <option value="GESTOR">Gestor</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {erro && <p className="error-text">{erro}</p>}
        {mensagem && <p className="success-text">{mensagem}</p>}
        <div className="actions-row">
          <button onClick={salvar} disabled={salvando}>
            💾 {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button onClick={onVoltar} disabled={salvando}>
            ⬅️ Voltar
          </button>
        </div>
      </div>
    </div>
  )

}
