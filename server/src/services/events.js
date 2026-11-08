// Server-sent events: one authenticated stream per signed-in browser.
// Staff receive every order event; customers only receive events for their own
// orders. Nothing is broadcast to unauthenticated connections.

const clients = new Set();
let nextId = 1;

export function subscribe(req, res, user) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 3000\n\n');

  const client = { id: nextId++, res, user, alive: true };
  clients.add(client);

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 25_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(client);
    res.end();
  });

  return client;
}

function write(client, event) {
  try {
    client.res.write(`data: ${JSON.stringify(event)}\n\n`);
  } catch {
    clients.delete(client);
  }
}

export function publish(event) {
  for (const client of clients) {
    const isStaff = client.user.role === 'ADMIN' || client.user.role === 'STAFF';
    if (event.scope === 'admin' && !isStaff) continue;
    if (event.scope === 'user' && client.user.id !== event.userId) continue;
    write(client, event);
  }
}
