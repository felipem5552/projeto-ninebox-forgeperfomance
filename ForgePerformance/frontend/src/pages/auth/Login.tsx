import { useState } from 'react'
import { login, criarSenha } from '../../services/api'
import type { Privilegio, LoginResponse } from '../../services/api'

type Modo = 'LOGIN' | 'PRIMEIRO_ACESSO'

type Props = {
  onLogin: (usuario: {
    id: number
    nome: string
    email: string
    privilegios: Privilegio
  }) => void
}

export default function Login({ onLogin }: Props) {
  const [modo, setModo] = useState<Modo>('LOGIN')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')

  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)


  // - LOGIN NORMAL

  async function handleLogin() {
    if (loading) return

    setErro(null)
    setLoading(true)

    if (!email.trim() || !senha) {
      setErro('Preencha email e senha')
      setLoading(false)
      return
    }

    try {
      const result: LoginResponse = await login(
        email.trim(),
        senha
      )

      // 🔑 PRIMEIRO ACESSO
      if ('primeiroAcesso' in result) {
        setUsuarioId(result.id)
        setSenha('')
        setConfirmacao('')
        setModo('PRIMEIRO_ACESSO')
        return
      }

      // ✅ LOGIN OK → SALVA USUÁRIO
      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(result)
      )

      onLogin({
        id: result.id,
        nome: result.nome,
        email: result.email,
        privilegios: result.privilegios
      })
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Erro ao autenticar'
      )
    } finally {
      setLoading(false)
    }
  }


  // - VALIDAR PRIMEIRO ACESSO

  async function iniciarPrimeiroAcesso() {
    if (loading) return

    setErro(null)
    setLoading(true)

    if (!email.trim()) {
      setErro('Informe o email')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        'http://localhost:4000/api/primeiro-acesso-validar',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.erro)
      }

      // ✅ email válido → vai para criar senha
      setUsuarioId(data.id)
      setSenha('')
      setConfirmacao('')
      setModo('PRIMEIRO_ACESSO')
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Erro ao validar usuário'
      )
    } finally {
      setLoading(false)
    }
  }


  // - CRIAR SENHA

  async function handleCriarSenha() {
    if (loading) return

    setErro(null)
    setLoading(true)

    if (!usuarioId) {
      setErro('Usuário inválido')
      setLoading(false)
      return
    }

    if (!senha || !confirmacao) {
      setErro('Preencha a senha e a confirmação')
      setLoading(false)
      return
    }

    if (senha !== confirmacao) {
      setErro('As senhas não conferem')
      setLoading(false)
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      setLoading(false)
      return
    }

    try {
      await criarSenha(usuarioId, senha)

      alert('Senha criada com sucesso! Faça login.')
      setModo('LOGIN')
      setSenha('')
      setConfirmacao('')
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Erro ao criar senha'
      )
    } finally {
      setLoading(false)
    }
  }


  // - RENDER

  return (
    <div className="page-auth">
      <div className="page-auth-content dashboard">

        <h2 className="dashboard-title">
          {modo === 'LOGIN' ? '🔐 Login' : '🔑 Primeiro Acesso'}
        </h2>

        <p className="dashboard-subtitle">
          Acesse o sistema para continuar
        </p>

        <label>Email</label>
        <input
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />

        <label>
          {modo === 'LOGIN' ? 'Senha' : 'Nova senha'}
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          disabled={loading}
        />

        {modo === 'PRIMEIRO_ACESSO' && (
          <>
            <label>Confirmar senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmacao}
              onChange={e => setConfirmacao(e.target.value)}
              disabled={loading}
            />
          </>
        )}

        {erro && <p className="error-text">{erro}</p>}

        <div className="actions-row">
          {modo === 'LOGIN' && (
            <>
              <button onClick={handleLogin} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button
                className="btn-secondary"
                onClick={iniciarPrimeiroAcesso}
                disabled={loading}
              >
                🔑 Primeiro acesso
              </button>
            </>
          )}

          {modo === 'PRIMEIRO_ACESSO' && (
            <>
              <button
                onClick={handleCriarSenha}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Criar Senha'}
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  setErro(null)
                  setSenha('')
                  setConfirmacao('')
                  setModo('LOGIN')
                }}
                disabled={loading}
              >
                ⬅️ Voltar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
