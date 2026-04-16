import { useState } from 'react'
import '../styles/busqueda.css'

export default function BusquedaCasas() {
  const [tipoBusqueda, setTipoBusqueda] = useState('poblacion')
  const [termino, setTermino] = useState('')
  const [resultados, setResultados] = useState([])
  const [detalle, setDetalle] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const buscarPorPoblacion = async () => {
    if (!termino.trim()) {
      setMensaje('Por favor ingresa un nombre de población')
      return
    }

    setCargando(true)
    setMensaje('')
    setResultados([])

    try {
      const response = await fetch(`/api/busqueda/por-poblacion?poblacion=${encodeURIComponent(termino)}`)

      if (response.status === 204) {
        setMensaje('No se encontraron casas en esa población')
        setResultados([])
      } else if (response.ok) {
        const data = await response.json()
        setResultados(data)
        setMensaje(`Se encontraron ${data.length} casas`)
      } else {
        setMensaje('Error en la búsqueda')
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor')
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  const buscarPorCodigo = async () => {
    if (!termino.trim()) {
      setMensaje('Por favor ingresa un código')
      return
    }

    setCargando(true)
    setMensaje('')
    setDetalle(null)

    try {
      const response = await fetch(`/api/busqueda/${termino}`)

      if (response.status === 404) {
        setMensaje('No se encontró casa con ese código')
      } else if (response.ok) {
        const data = await response.json()
        setDetalle(data)
        setMensaje('Casa encontrada')
      } else {
        setMensaje('Error en la búsqueda')
      }
    } catch (error) {
      setMensaje('Error de conexión con el servidor')
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  const handleBuscar = () => {
    if (tipoBusqueda === 'poblacion') {
      buscarPorPoblacion()
    } else {
      buscarPorCodigo()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBuscar()
    }
  }

  return (
    <div className="busqueda-container">
      <h2>Buscar Casas Rurales</h2>

      <div className="busqueda-options">
        <label>
          <input 
            type="radio" 
            value="poblacion" 
            checked={tipoBusqueda === 'poblacion'}
            onChange={(e) => {
              setTipoBusqueda(e.target.value)
              setTermino('')
              setResultados([])
              setDetalle(null)
              setMensaje('')
            }}
          />
          Buscar por Población
        </label>
        <label>
          <input 
            type="radio" 
            value="codigo" 
            checked={tipoBusqueda === 'codigo'}
            onChange={(e) => {
              setTipoBusqueda(e.target.value)
              setTermino('')
              setResultados([])
              setDetalle(null)
              setMensaje('')
            }}
          />
          Buscar por Código
        </label>
      </div>

      <div className="busqueda-input">
        <input
          type={tipoBusqueda === 'codigo' ? 'number' : 'text'}
          placeholder={tipoBusqueda === 'poblacion' ? 'Ej: Salento' : 'Ej: 1'}
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleBuscar} disabled={cargando}>
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {mensaje && <div className={`mensaje ${mensaje.includes('Se encontraron') || mensaje.includes('encontrada') ? 'exito' : 'info'}`}>
        {mensaje}
      </div>}

      {resultados.length > 0 && (
        <div className="resultados">
          <h3>Resultados ({resultados.length})</h3>
          <div className="casas-grid">
            {resultados.map(casa => (
              <div key={casa.codigoCasa} className="casa-card">
                <h4>{casa.nombrePropiedad}</h4>
                <p><strong>Población:</strong> {casa.poblacion}</p>
                <p><strong>Propietario:</strong> {casa.nombrePropietario}</p>
                <p><strong>Habitaciones:</strong> {casa.habitaciones}</p>
                <p><strong>Baños:</strong> {casa.banos}</p>
                <p><strong>Salas:</strong> {casa.salas}</p>
                <p><strong>Descripción:</strong> {casa.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {detalle && (
        <div className="detalle">
          <h3>Detalles de la Casa</h3>
          <div className="detalle-content">
            <div className="detalle-info">
              <h4>{detalle.nombrePropiedad}</h4>
              <p><strong>Código:</strong> {detalle.codigoCasa}</p>
              <p><strong>Población:</strong> {detalle.poblacion}</p>
              <p><strong>Descripción:</strong> {detalle.descripcion}</p>
              <p><strong>Propietario:</strong> {detalle.nombrePropietario}</p>
              <p><strong>Teléfono:</strong> {detalle.telefonoPropietario}</p>
            </div>
            <div className="detalle-specs">
              <h4>Especificaciones</h4>
              <p><strong>Habitaciones:</strong> {detalle.habitaciones}</p>
              <p><strong>Baños:</strong> {detalle.banos}</p>
              <p><strong>Salas:</strong> {detalle.salas}</p>
              <p><strong>Cocinas:</strong> {detalle.cocinas}</p>
              <p><strong>Precio aproximado:</strong> ${detalle.precioAproximado}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
