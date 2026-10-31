import { useEffect, useRef, useState } from 'react';
import { applyServerEvent } from './chat.js';
import './App.css';

const URL_WS = import.meta.env.VITE_WS_URL;

function useChat(nombre) {
  const socketRef = useRef(null);
  const reconnectRef = useRef(null);
  const [estado, setEstado] = useState('conectando');
  const [chat, setChat] = useState({ mensajes: [], usuarios: [] });

  useEffect(() => {
    if (!nombre) return undefined;

    if (!URL_WS) {
      setEstado('sin-configuracion');
      return undefined;
    }

    let cerradoPorReact = false;

    function conectar() {
      setEstado('conectando');
      const ws = new WebSocket(URL_WS);
      socketRef.current = ws;

      ws.onopen = () => {
        setEstado('conectado');
        ws.send(JSON.stringify({ tipo: 'entrar', nombre }));
      };

      ws.onmessage = (evento) => {
        try {
          const dato = JSON.parse(evento.data);
          setChat((actual) => applyServerEvent(actual, dato));
        } catch (error) {
          console.error('Mensaje inválido del servidor:', error);
        }
      };

      ws.onerror = () => {
        setEstado('error');
      };

      ws.onclose = () => {
        socketRef.current = null;
        if (cerradoPorReact) return;
        setEstado('reconectando');
        reconnectRef.current = window.setTimeout(conectar, 1500);
      };
    }

    conectar();

    return () => {
      cerradoPorReact = true;
      window.clearTimeout(reconnectRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [nombre]);

  function enviar(texto) {
    const limpio = texto.trim();
    const ws = socketRef.current;

    if (!limpio || !ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    ws.send(JSON.stringify({ tipo: 'mensaje', texto: limpio }));
    return true;
  }

  return {
    mensajes: chat.mensajes,
    usuarios: chat.usuarios,
    estado,
    enviar,
  };
}

function EstadoConexion({ estado }) {
  const etiquetas = {
    conectado: 'Conectado',
    conectando: 'Conectando…',
    reconectando: 'Reconectando…',
    error: 'Error de conexión',
    'sin-configuracion': 'Falta VITE_WS_URL',
  };

  return (
    <span className={`estado estado-${estado}`}>
      <span className="estado-punto" />
      {etiquetas[estado] ?? estado}
    </span>
  );
}

function Mensaje({ mensaje, nombreActual }) {
  if (mensaje.tipo === 'sistema') {
    return (
      <div className="mensaje-sistema">
        <span>{mensaje.texto}</span>
        {mensaje.hora && <time>{mensaje.hora}</time>}
      </div>
    );
  }

  const propio = mensaje.nombre === nombreActual;

  return (
    <article className={`mensaje ${propio ? 'mensaje-propio' : ''}`}>
      <div className="mensaje-meta">
        <strong>{propio ? 'Tú' : mensaje.nombre || 'Anónimo'}</strong>
        {mensaje.hora && <time>{mensaje.hora}</time>}
      </div>
      <p>{mensaje.texto}</p>
    </article>
  );
}

function PantallaEntrada({ onEntrar }) {
  const [nombre, setNombre] = useState('');

  function enviarFormulario(evento) {
    evento.preventDefault();
    const limpio = nombre.trim();
    if (limpio) onEntrar(limpio);
  }

  return (
    <main className="entrada-shell">
      <section className="entrada-card">
        <div className="logo-chat">WS</div>
        <p className="eyebrow">TICS316 · WebSocket</p>
        <h1>Chat grupal en tiempo real</h1>
        <p className="entrada-texto">
          Ingresa un nombre para entrar a la sala común.
        </p>

        <form onSubmit={enviarFormulario} className="entrada-form">
          <label htmlFor="nombre">Tu nombre</label>
          <input
            id="nombre"
            value={nombre}
            onChange={(evento) => setNombre(evento.target.value)}
            placeholder="Ej. Ignacio"
            maxLength={30}
            autoFocus
          />
          <button type="submit" disabled={!nombre.trim()}>
            Entrar al chat
          </button>
        </form>
      </section>
    </main>
  );
}

function Chat({ nombre, onSalir }) {
  const { mensajes, usuarios, estado, enviar } = useChat(nombre);
  const [texto, setTexto] = useState('');
  const finalRef = useRef(null);

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  function enviarMensaje(evento) {
    evento.preventDefault();
    if (enviar(texto)) setTexto('');
  }

  return (
    <main className="chat-shell">
      <section className="chat-card">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Sala común</p>
            <h1>Chat WebSocket</h1>
          </div>
          <div className="header-actions">
            <EstadoConexion estado={estado} />
            <button className="boton-secundario" onClick={onSalir}>
              Cambiar nombre
            </button>
          </div>
        </header>

        {estado === 'sin-configuracion' && (
          <div className="aviso-config">
            Configura la variable <code>VITE_WS_URL</code> en Vercel con la URL
            <code> wss://…</code> del servidor.
          </div>
        )}

        <div className="chat-layout">
          <aside className="usuarios-panel">
            <div className="usuarios-titulo">
              <h2>En línea</h2>
              <span>{usuarios.length}</span>
            </div>
            <ul>
              {usuarios.length === 0 ? (
                <li className="usuarios-vacio">Sin usuarios informados</li>
              ) : (
                usuarios.map((usuario) => (
                  <li key={usuario} className={usuario === nombre ? 'usuario-propio' : ''}>
                    <span className="avatar">{usuario.slice(0, 1).toUpperCase()}</span>
                    <span>{usuario === nombre ? `${usuario} (tú)` : usuario}</span>
                  </li>
                ))
              )}
            </ul>
          </aside>

          <section className="mensajes-panel">
            <div className="mensajes-lista" aria-live="polite">
              {mensajes.length === 0 ? (
                <div className="sin-mensajes">
                  <strong>Aún no hay mensajes.</strong>
                  <span>Escribe el primero cuando la conexión esté lista.</span>
                </div>
              ) : (
                mensajes.map((mensaje, indice) => (
                  <Mensaje
                    key={`${mensaje.hora ?? 'sin-hora'}-${indice}`}
                    mensaje={mensaje}
                    nombreActual={nombre}
                  />
                ))
              )}
              <div ref={finalRef} />
            </div>

            <form className="composer" onSubmit={enviarMensaje}>
              <input
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                placeholder="Escribe un mensaje…"
                maxLength={500}
                disabled={estado !== 'conectado'}
              />
              <button
                type="submit"
                disabled={estado !== 'conectado' || !texto.trim()}
              >
                Enviar
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [nombre, setNombre] = useState('');

  if (!nombre) {
    return <PantallaEntrada onEntrar={setNombre} />;
  }

  return <Chat nombre={nombre} onSalir={() => setNombre('')} />;
}
