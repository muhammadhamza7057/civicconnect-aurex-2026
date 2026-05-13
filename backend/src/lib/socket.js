let io = null;

function setIO(server) {
  if (io && io === server) return io;
  if (io && io !== server) {
    console.warn('Socket IO instance already set - ignoring new instance');
    return io;
  }
  io = server;
}

function getIO() {
  if (!io) {
    console.warn('Socket IO not initialized yet');
  }
  return io;
}

function safeEmit(event, payload) {
  try {
    const server = getIO();
    if (!server) return;
    server.emit(event, payload);
  } catch (err) {
    console.error('safeEmit failed', err && err.message ? err.message : err);
  }
}

module.exports = { setIO, getIO, safeEmit };
