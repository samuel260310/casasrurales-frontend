import { useState, useEffect } from 'react'
import '../styles/dashboard.css'

export default function DashboardPropietario() {
  const [casas, setCasas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [casaAEliminar, setCasaAEliminar] = useState(null)
  const [confirmacion, setConfirmacion] = useState(false)

  useEffect(() => {
    obtenerMisCasas()
  }, [])

  const obtenerMisCasas = async () => {
    try {
      const response = await fetch('/api/propietario/mis-casas', {
        credentials: 'same-origin'
      })
      
      if (response.status === 401) {
        setMensaje('Debes estar autenticado como propietario')
        setCargando(false)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setCasas(data)
      } else if (response.status === 404) {
        setMensaje('No tienes casas registradas aún')
      } else {
        setMensaje('Error al cargar tus casas')
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor')
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  const mostrarConfirmazione = (casa) => {
    setCasaAEliminar(casa)
    setConfirmacion(true)
  }

  const cancelarBaja = () => {
    setCasaAEliminar(null)
    setConfirmacion(false)
  }

  const confirmarBaja = async () => {
    if (!casaAEliminar) return

    try {
      const response = await fetch(`/api/propietario/${casaAEliminar.codigoCasa}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      })

      const data = await response.json()

      if (response.ok) {
        setMensaje('Casa dada de baja exitosamente')
        obtenerMisCasas()
      } else if (response.status === 409) {
        setMensaje(`${data.error}`)
      } else {
        setMensaje(`${data.error || 'Error al dar de baja la casa'}`)
      }
    } catch (error) {
      setMensaje('Error de conexión')
      console.error(error)
    } finally {
      setCasaAEliminar(null)
      setConfirmacion(false)
    }
  }

  const reactivarCasa = async (codigoCasa) => {
    try {
      const response = await fetch(`/api/propietario/${codigoCasa}/reactivar`, {
        method: 'POST',
        credentials: 'same-origin'
      })

      const data = await response.json()

      if (response.ok) {
        setMensaje('Casa reactivada exitosamente')
        obtenerMisCasas()
      } else {
        setMensaje(`${data.error || 'Error al reactivar'}`)
      }
    } catch (error) {
      setMensaje('Error de conexión')
      console.error(error)
    }
  }

  if (cargando) {
    return <div className="dashboard-container"><p>Cargando...</p></div>
  }

  return (
    <div className="dashboard-container">
      <h2>Mi Dashboard de Propietario</h2>
      
      {mensaje && <div className={`mensaje ${mensaje.includes('') ? 'exito' : mensaje.includes('') ? 'advertencia' : 'error'}`}>
        {mensaje}
      </div>}

      {casas.length === 0 ? (
        <div className="sin-casas">
          <p>No tienes casas registradas aún</p>
        </div>
      ) : (
        <div className="casas-propietario">
          <h3>Mis Casas ({casas.length})</h3>
          <table className="tabla-casas">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Población</th>
                <th>Habitaciones</th>
                <th>Reservas Activas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {casas.map(casa => (
                <tr key={casa.codigoCasa} className={!casa.activa ? 'inactiva' : ''}>
                  <td>{casa.codigoCasa}</td>
                  <td>{casa.nombrePropiedad}</td>
                  <td>{casa.poblacion}</td>
                  <td>{casa.habitaciones}</td>
                  <td>{casa.reservasActivas}</td>
                  <td>
                    <span className={`estado-badge ${casa.activa ? 'activa' : 'inactiva'}`}>
                      {casa.activa ? 'Activa' : 'Dada de Baja'}
                    </span>
                  </td>
                  <td className="acciones">
                    {casa.activa ? (
                      <button 
                        className="btn-danger"
                        onClick={() => mostrarConfirmazione(casa)}
                        disabled={casa.reservasActivas > 0}
                        title={casa.reservasActivas > 0 ? 'No puedes dar de baja con reservas activas' : ''}
                      >
                        🗑 Dar de Baja
                      </button>
                    ) : (
                      <button 
                        className="btn-success"
                        onClick={() => reactivarCasa(casa.codigoCasa)}
                      >
                        ♻️ Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmacion && casaAEliminar && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3>Confirmar Baja de Casa</h3>
            <div className="modal-cuerpo">
              <p>¿Estás seguro de que quieres dar de baja esta casa?</p>
              <div className="info-casa">
                <p><strong>Código:</strong> {casaAEliminar.codigoCasa}</p>
                <p><strong>Nombre:</strong> {casaAEliminar.nombrePropiedad}</p>
                <p><strong>Población:</strong> {casaAEliminar.poblacion}</p>
                <p><strong>Reservas Activas:</strong> {casaAEliminar.reservasActivas}</p>
              </div>
              <p className="advertencia">
                Una vez dada de baja, la casa no aparecerá en búsquedas ni dispondrá de nuevas reservas.
                Puedes reactivarla en cualquier momento.
              </p>
            </div>
            <div className="modal-botones">
              <button className="btn-cancelar" onClick={cancelarBaja}>
                Cancelar
              </button>
              <button className="btn-confirmar" onClick={confirmarBaja}>
                Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
