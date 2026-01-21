import { useEffect, useState } from 'react'
import Login from './pages/auth/Login'
import DashboardGestor from './pages/gestor/DashboardGestor'
import DashboardFuncionario from './pages/funcionario/DashboardFuncionario'
import DashboardAdmin from './pages/admin/DashboardAdmin'
import './App.css'

// - TIPOS
type Perfil = 'ADMIN' | 'GESTOR' | 'FUNCIONARIO'

export type Usuario = {
  id: number
  nome: string
  email: string
  privilegios: Perfil
}

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  // - CARREGA USUÁRIO DO LOCALSTORAGE
  useEffect(() => {
    const salvo = localStorage.getItem('usuario')
    if (!salvo) return

    try {
      const usuarioSalvo: Usuario = JSON.parse(salvo)

      if (
        typeof usuarioSalvo.id !== 'number' ||
        !usuarioSalvo.email ||
        !usuarioSalvo.privilegios
      ) {
        throw new Error()
      }

      setUsuario(usuarioSalvo)
    } catch {
      localStorage.removeItem('usuario')
      setUsuario(null)
    }
  }, [])

  // - LOGIN
  function handleLogin(user: Usuario) {
    localStorage.setItem('usuario', JSON.stringify(user))
    setUsuario(user)
  }

  // - LOGOUT
  function handleLogout() {
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  // - NÃO AUTENTICADO
  if (!usuario) {
    return <Login onLogin={handleLogin} />
  }

  // - ADMIN
  if (usuario.privilegios === 'ADMIN') {
    return (
      <DashboardAdmin
        onLogout={handleLogout}
      />
    )
  }

  // - GESTOR
  if (usuario.privilegios === 'GESTOR') {
    return (
      <DashboardGestor
        usuario={usuario}
        onLogout={handleLogout}
      />
    )
  }

  // - FUNCIONÁRIO
  return (
    <DashboardFuncionario
      funcionario={usuario}
      onLogout={handleLogout}
    />
  )
}

export default App
