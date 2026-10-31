import assert from 'node:assert/strict';
import { applyServerEvent } from './chat.js';

{
  const state = { mensajes: [{ tipo: 'mensaje', texto: 'viejo' }], usuarios: [] };
  const event = { tipo: 'historial', mensajes: [{ tipo: 'mensaje', texto: 'hola' }] };
  assert.deepEqual(applyServerEvent(state, event), { mensajes: event.mensajes, usuarios: [] });
}

{
  const state = { mensajes: [{ tipo: 'mensaje', texto: 'hola' }], usuarios: [] };
  const event = { tipo: 'usuarios', lista: ['Ana', 'Pedro'] };
  assert.deepEqual(applyServerEvent(state, event), { mensajes: state.mensajes, usuarios: event.lista });
}

{
  const state = { mensajes: [], usuarios: [] };
  const msg = { tipo: 'mensaje', nombre: 'Ana', texto: 'hola', hora: '12:00' };
  const system = { tipo: 'sistema', texto: 'Ana entró', hora: '12:01' };
  const next = applyServerEvent(applyServerEvent(state, msg), system);
  assert.deepEqual(next.mensajes, [msg, system]);
}

console.log('OK: protocolo del chat');
