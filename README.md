# Cliente WebSocket · TICS316

Cliente React/Vite para la actividad de chat grupal en tiempo real con WebSocket.

## Funciones

- Entrada a la sala con nombre.
- Conexión WebSocket con `VITE_WS_URL`.
- Reconexión automática.
- Mensajes e historial.
- Lista de usuarios conectados.
- Mensajes propios diferenciados.
- Estado de conexión.
- Autoscroll al último mensaje.

## Protocolo

Cliente → servidor:

```json
{ "tipo": "entrar", "nombre": "Ignacio" }
{ "tipo": "mensaje", "texto": "Hola" }
```

Servidor → cliente:

- `mensaje`
- `sistema`
- `usuarios`
- `historial`

## Desarrollo local

```bash
npm install
npm run dev
```

Crea `.env.local` usando `.env.example` y agrega la URL real del servidor.

## Vercel

En **Settings → Environment Variables** agrega:

```text
VITE_WS_URL=wss://[servidor]/api/ws
```

Luego haz un nuevo deployment.
