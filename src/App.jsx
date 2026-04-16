import { useState, useEffect } from 'react'
import './App.css'
import Login from './components/Login'
import RegistroPropietario from './components/RegistroPropietario'
import RegistroCliente from './components/RegistroCliente'
import BusquedaCasas from './components/BusquedaCasas'
import DashboardPropietario from './components/DashboardPropietario'

function App() {
  const [seccionActiva, setSeccionActiva] = useState('login')
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null)

  // Verificar si hay usuario autenticado en localStorage al cargar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioAutenticado')
    if (usuarioGuardado) {
      setUsuarioAutenticado(JSON.parse(usuarioGuardado))
      setSeccionActiva('inicio')
    }
  }, [])

  const handleLoginSuccess = (datosUsuario) => {
    setUsuarioAutenticado(datosUsuario)
    setSeccionActiva('inicio')
  }

  const handleRegistroExitoso = () => {
    setSeccionActiva('login')
  }

  const handleLogout = () => {
    localStorage.removeItem('usuarioAutenticado')
    setUsuarioAutenticado(null)
    setSeccionActiva('login')
  }

  // Si no está autenticado, mostrar login o registro
  if (!usuarioAutenticado) {
    if (seccionActiva === 'registro-cliente' || seccionActiva === 'registro-propietario') {
      return (
        <div className="app">
          <main className="main-content">
            {seccionActiva === 'registro-propietario' && (
              <RegistroPropietario 
                onRegistroExitoso={handleRegistroExitoso}
                onVolver={() => setSeccionActiva('login')}
              />
            )}
            {seccionActiva === 'registro-cliente' && (
              <RegistroCliente 
                onRegistroExitoso={handleRegistroExitoso}
                onVolver={() => setSeccionActiva('login')}
              />
            )}
          </main>
        </div>
      )
    }
    // Mostrar Login 
    return <Login onLoginSuccess={handleLoginSuccess} onRegistroClick={setSeccionActiva} />
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-container">
          <h1 onClick={() => setSeccionActiva('inicio')} style={{cursor: 'pointer'}}>🏡 Casas Rurales</h1>
          <ul className="nav-links">
            <li>
              <button 
                onClick={() => setSeccionActiva('inicio')}
                className={seccionActiva === 'inicio' ? 'active' : ''}
              >
                Inicio
              </button>
            </li>
            <li>
              <button 
                onClick={() => setSeccionActiva('busqueda')}
                className={seccionActiva === 'busqueda' ? 'active' : ''}
              >
                Buscar Casas
              </button>
            </li>
            {usuarioAutenticado?.tipoUsuario === 'propietario' && (
              <li>
                <button 
                  onClick={() => setSeccionActiva('dashboard-propietario')}
                  className={seccionActiva === 'dashboard-propietario' ? 'active' : ''}
                >
                  Mi Dashboard
                </button>
              </li>
            )}
            <li>
              <button 
                onClick={handleLogout}
                className="btn-logout"
                title={`Cerrar sesión (${usuarioAutenticado?.nombreUsuario})`}
              >
                Cerrar Sesión ({usuarioAutenticado?.nombreUsuario})
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {seccionActiva === 'inicio' && (
          <section className="dashboard-page">
            {usuarioAutenticado?.tipoUsuario === 'propietario' ? (
              <div className="dashboard-content">
                <h2>Bienvenido, Propietario: {usuarioAutenticado?.nombreUsuario}</h2>
                <p>Administra tus casas rurales desde aquí</p>
                <div className="btn-group">
                  <button className="btn-primary" onClick={() => setSeccionActiva('dashboard-propietario')}>
                    🔑 Ir a Mi Dashboard
                  </button>
                  <button className="btn-secondary" onClick={() => setSeccionActiva('busqueda')}>
                    🔍 Buscar Casas
                  </button>
                </div>
              </div>
            ) : (
              <div className="dashboard-content">
                <h2>Bienvenido, {usuarioAutenticado?.nombreUsuario}</h2>
                <p>Busca y reserva las mejores casas rurales</p>
                <div className="btn-group">
                  <button className="btn-primary" onClick={() => setSeccionActiva('busqueda')}>
                    🔍 Buscar Casas
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {seccionActiva === 'busqueda' && <BusquedaCasas />}
        {seccionActiva === 'dashboard-propietario' && <DashboardPropietario />}
      </main>
    </div>
  )
}

export default App
