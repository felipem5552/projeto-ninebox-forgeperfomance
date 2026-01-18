import { useState } from 'react'
import { login, criarSenha } from '../../services/api'

type UsuarioLogin = {
  id?: number
  nome?: string
  email?: string
  privilegios?: 'GESTOR' | 'FUNCIONARIO'
  primeiroAcesso?: boolean
  erro?: string
}

type Props = {
  onLogin: (usuario: {
    id: number
    nome: string
    email: string
    privilegios: 'GESTOR' | 'FUNCIONARIO'
  }) => void
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false)
  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function handleLogin() {
    setErro(null)

    if (!email || !senha) {
      setErro('Preencha email e senha')
      return
    }

    try {
      const result: UsuarioLogin = await login(email, senha)

      // ❌ ERRO DO BACKEND (email não encontrado / senha errada)
      if (result.erro) {
        setErro(result.erro)
        return
      }

      // 🔑 PRIMEIRO ACESSO
      if (result.primeiroAcesso && result.id) {
        setPrimeiroAcesso(true)
        setUsuarioId(result.id)
        setSenha('')
        return
      }

      // ❌ RESPOSTA INVÁLIDA
      if (
        !result.id ||
        !result.nome ||
        !result.email ||
        !result.privilegios
      ) {
        setErro('Resposta inválida do servidor')
        return
      }

      // ✅ LOGIN OK (NORMALIZADO)
      onLogin({
        id: result.id,
        nome: result.nome,
        email: result.email,
        privilegios: result.privilegios
      })
    } catch {
      setErro('Erro ao conectar com o servidor')
    }
  }

  async function handleCriarSenha() {
    setErro(null)

    if (!usuarioId || !senha) {
      setErro('Informe a nova senha')
      return
    }

    try {
      const result = await criarSenha(usuarioId, senha)

      if (result?.erro) {
        setErro(result.erro)
        return
      }

      alert('Senha criada! Faça login novamente.')
      setPrimeiroAcesso(false)
      setSenha('')
    } catch {
      setErro('Erro ao criar senha')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{primeiroAcesso ? 'Criar Senha' : 'Login'}</h2>

      {!primeiroAcesso && (
        <>
          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <br /><br />
        </>
      )}

      <input
        type="password"
        placeholder={primeiroAcesso ? 'Nova senha' : 'Senha'}
        value={senha}
        onChange={e => setSenha(e.target.value)}
      />

      <br /><br />

      {erro && (
        <div style={{ color: 'red', marginBottom: 10 }}>
          {erro}
        </div>
      )}

      {!primeiroAcesso && (
        <button onClick={handleLogin}>Entrar</button>
      )}

      {primeiroAcesso && (
        <button onClick={handleCriarSenha}>Criar Senha</button>
      )}
    </div>
  )
}
