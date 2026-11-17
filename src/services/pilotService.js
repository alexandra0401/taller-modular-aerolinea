const pilotModel = require('../models/pilotModel');
const assignmentModel = require('../models/assignmentModel');
const { badRequest, notFound, conflict } = require('../utils/errors');

const validatePilot = (data, partial = false) => {
  const required = ['nombre', 'licencia'];
  if (!partial) {
    for (const field of required) {
      if (!data[field] || String(data[field]).trim() === '') {
        throw badRequest(`El campo "${field}" es obligatorio`);
      }
    }
  }
  if (data.horasVuelo !== undefined && (typeof data.horasVuelo !== 'number' || data.horasVuelo < 0)) {
    throw badRequest('horasVuelo debe ser un numero mayor o igual a 0');
  }
};

const getAllPilots = () => pilotModel.findAll();

const getPilotById = async (id) => {
  const pilot = await pilotModel.findById(id);
  if (!pilot) throw notFound(`No existe un piloto con id ${id}`);
  return pilot;
};

const registerPilot = async (data) => {
  validatePilot(data);
  const duplicated = await pilotModel.findBy('licencia', data.licencia);
  if (duplicated.length > 0) throw conflict('Ya existe un piloto con esa licencia');
  return pilotModel.save({
    nombre: data.nombre,
    licencia: data.licencia,
    horasVuelo: data.horasVuelo ?? 0,
    estado: data.estado ?? 'activo',
  });
};

const updatePilot = async (id, data) => {
  await getPilotById(id);
  validatePilot(data, true);
  if (data.licencia) {
    const duplicated = await pilotModel.findBy('licencia', data.licencia);
    if (duplicated.some((p) => p.id !== Number(id))) {
      throw conflict('Ya existe otro piloto con esa licencia');
    }
  }
  return pilotModel.update(id, data);
};

const deletePilot = async (id) => {
  await getPilotById(id);
  const assignments = await assignmentModel.findBy('idPiloto', Number(id));
  if (assignments.length > 0) {
    throw conflict('No se puede eliminar: el piloto tiene asignaciones registradas');
  }
  return pilotModel.remove(id);
};

module.exports = { getAllPilots, getPilotById, registerPilot, updatePilot, deletePilot };
