const airplaneModel = require('../models/airplaneModel');
const assignmentModel = require('../models/assignmentModel');
const { badRequest, notFound, conflict } = require('../utils/errors');

const validateAirplane = (data, partial = false) => {
  if (!partial) {
    for (const field of ['modelo', 'matricula', 'fabricante']) {
      if (!data[field] || String(data[field]).trim() === '') {
        throw badRequest(`El campo "${field}" es obligatorio`);
      }
    }
    if (data.capacidadMaxima === undefined) throw badRequest('El campo "capacidadMaxima" es obligatorio');
  }
  if (
    data.capacidadMaxima !== undefined &&
    (!Number.isInteger(data.capacidadMaxima) || data.capacidadMaxima <= 0)
  ) {
    throw badRequest('capacidadMaxima debe ser un entero mayor a 0');
  }
};

const getAllAirplanes = () => airplaneModel.findAll();

const getAirplaneById = async (id) => {
  const airplane = await airplaneModel.findById(id);
  if (!airplane) throw notFound(`No existe un avion con id ${id}`);
  return airplane;
};

const registerAirplane = async (data) => {
  validateAirplane(data);
  const duplicated = await airplaneModel.findBy('matricula', data.matricula);
  if (duplicated.length > 0) throw conflict('Ya existe un avion con esa matricula');
  return airplaneModel.save({
    modelo: data.modelo,
    matricula: data.matricula,
    capacidadMaxima: data.capacidadMaxima,
    fabricante: data.fabricante,
  });
};

const updateAirplane = async (id, data) => {
  await getAirplaneById(id);
  validateAirplane(data, true);
  if (data.matricula) {
    const duplicated = await airplaneModel.findBy('matricula', data.matricula);
    if (duplicated.some((a) => a.id !== Number(id))) {
      throw conflict('Ya existe otro avion con esa matricula');
    }
  }
  return airplaneModel.update(id, data);
};

const deleteAirplane = async (id) => {
  await getAirplaneById(id);
  const assignments = await assignmentModel.findBy('idAvion', Number(id));
  if (assignments.length > 0) {
    throw conflict('No se puede eliminar: el avion tiene asignaciones registradas');
  }
  return airplaneModel.remove(id);
};

module.exports = { getAllAirplanes, getAirplaneById, registerAirplane, updateAirplane, deleteAirplane };
