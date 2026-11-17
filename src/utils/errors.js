// Errores de negocio con codigo HTTP sugerido (el servicio no conoce req/res,
// solo lanza el error; el controlador decide como responder).
const createError = (message, status = 400) => Object.assign(new Error(message), { status });

module.exports = {
  badRequest: (msg) => createError(msg, 400),
  notFound: (msg) => createError(msg, 404),
  conflict: (msg) => createError(msg, 409),
};
