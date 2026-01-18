import { useEffect, useState } from 'react'
import Login from './pages/auth/Login'
import DashboardGestor from './pages/gestor/DashboardGestor'
import DashboardFuncionario from './pages/funcionario/DashboardFuncionario'

type Perfil = 'GESTOR' | 'FUNCIONARIO'

type Usuario = {
  id: number
  nome: string
  email: string
  privilegios: Perfil
}

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  // 🔁 CARREGA USUÁRIO SALVO
  useEffect(() => {
    const salvo = localStorage.getItem('usuario')
    if (salvo) {
      setUsuario(JSON.parse(salvo))
    }
  }, [])

  function handleLogin(user: Usuario) {
    localStorage.setItem('usuario', JSON.stringify(user))
    setUsuario(user)
  }

  function handleLogout() {
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  // 🔐 NÃO LOGADO
  if (!usuario) {
    return <Login onLogin={handleLogin} />
  }

  const perfil = usuario.privilegios.toUpperCase() as Perfil

  // 👔 GESTOR
  if (perfil === 'GESTOR') {
    return (
      <DashboardGestor onLogout={handleLogout} />
    )
  }

  // 👷 FUNCIONÁRIO
  if (perfil === 'FUNCIONARIO') {
    return (
      <DashboardFuncionario
        funcionario={usuario}
        onLogout={handleLogout}
      />
    )
  }

  // 🚫 FALLBACK
  return (
    <div style={{ padding: 20 }}>
      <h2>Perfil inválido</h2>
    </div>
  )
}

export default App
