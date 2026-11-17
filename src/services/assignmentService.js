const assignmentModel = require('../models/assignmentModel');
const pilotModel = require('../models/pilotModel');
const airplaneModel = require('../models/airplaneModel');
const { badRequest, notFound, conflict } = require('../utils/errors');

// Validacion relacional: el piloto y el avion deben existir.
const verifyRelations = async (idPiloto, idAvion) => {
  if (idPiloto !== undefined) {
    const pilot = await pilotModel.findById(idPiloto);
    if (!pilot) throw notFound(`El piloto con id ${idPiloto} no existe`);
  }
  if (idAvion !== undefined) {
    const airplane = await airplaneModel.findById(idAvion);
    if (!airplane) throw notFound(`El avion con id ${idAvion} no existe`);
  }
};

const validateFields = (data) => {
  for (const field of ['idPiloto', 'idAvion', 'fechaVuelo', 'rutaAsignada']) {
    if (data[field] === undefined || data[field] === '') {
      throw badRequest(`El campo "${field}" es obligatorio`);
    }
  }
  if (!Number.isInteger(data.idPiloto) || !Number.isInteger(data.idAvion)) {
    throw badRequest('idPiloto e idAvion deben ser numeros enteros');
  }
  if (Number.isNaN(Date.parse(data.fechaVuelo))) {
    throw badRequest('fechaVuelo no tiene un formato de fecha valido (ej: 2026-12-01)');
  }
};

// Un piloto no puede tener dos asignaciones el mismo dia.
const verifyPilotAvailability = async (idPiloto, fechaVuelo, ignoreId = null) => {
  const existing = await assignmentModel.findBy('idPiloto', idPiloto);
  const clash = existing.find(
    (a) => a.fechaVuelo === fechaVuelo && a.idAsignacion !== Number(ignoreId)
  );
  if (clash) throw conflict('El piloto ya tiene una asignacion para esa fecha');
};

const getAllAssignments = () => assignmentModel.findAll();

const getAssignmentById = async (id) => {
  const assignment = await assignmentModel.findById(id);
  if (!assignment) throw notFound(`No existe una asignacion con id ${id}`);
  return assignment;
};

const createAssignment = async (data) => {
  validateFields(data);
  await verifyRelations(data.idPiloto, data.idAvion);
  await verifyPilotAvailability(data.idPiloto, data.fechaVuelo);
  return assignmentModel.save({
    idPiloto: data.idPiloto,
    idAvion: data.idAvion,
    fechaVuelo: data.fechaVuelo,
    rutaAsignada: data.rutaAsignada,
  });
};

const updateAssignment = async (id, data) => {
  const current = await getAssignmentById(id);
  const merged = { ...current, ...data };
  validateFields(merged);
  await verifyRelations(merged.idPiloto, merged.idAvion);
  await verifyPilotAvailability(merged.idPiloto, merged.fechaVuelo, id);
  return assignmentModel.update(id, data);
};

const deleteAssignment = async (id) => {
  await getAssignmentById(id);
  return assignmentModel.remove(id);
};

module.exports = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
