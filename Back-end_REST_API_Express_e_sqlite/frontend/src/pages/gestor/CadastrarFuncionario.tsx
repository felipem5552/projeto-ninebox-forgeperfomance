import { useState } from 'react'
import { cadastrarFuncionario } from '../../services/api'

type Props = {
  onVoltar: () => void
}

export default function CadastrarFuncionario({ onVoltar }: Props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cargo, setCargo] = useState('')
  const [time, setTime] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    setErro(null)

    if (!nome || !email || !time) {
      setErro('Preencha os campos obrigatórios')
      return
    }

    const result = await cadastrarFuncionario({
      nome,
      email,
      cargo,
      time,
      privilegios: 'FUNCIONARIO'
    })

    if (result.erro) {
      setErro(result.erro)
      return
    }

    alert('Funcionário cadastrado com sucesso')
    onVoltar()
  }

  return (
    <div style={{ padding: 30 }}>
      <button onClick={onVoltar}>Voltar</button>

      <h2>Cadastrar Funcionário</h2>

      <input
        placeholder="Nome"
        value={nome}
        onChange={e => setNome(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Cargo"
        value={cargo}
        onChange={e => setCargo(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Time"
        value={time}
        onChange={e => setTime(e.target.value)}
      />

      <br /><br />

      <button onClick={salvar}>Salvar</button>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  )
}
