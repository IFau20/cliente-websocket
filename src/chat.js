export function applyServerEvent(state, event) {
  if (!event || typeof event !== 'object') return state;

  if (event.tipo === 'historial') {
    return {
      ...state,
      mensajes: Array.isArray(event.mensajes) ? event.mensajes : [],
    };
  }

  if (event.tipo === 'usuarios') {
    return {
      ...state,
      usuarios: Array.isArray(event.lista) ? event.lista : [],
    };
  }

  if (event.tipo === 'mensaje' || event.tipo === 'sistema') {
    return {
      ...state,
      mensajes: [...state.mensajes, event],
    };
  }

  return state;
}
