// Unico lugar (junto con los modelos) donde se usa el sistema de archivos (fs).
const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

const createJsonModel = (fileName, idField) => {
  const filePath = path.join(DATA_DIR, fileName);

  const readAll = async () => {
    try {
      return JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  };

  const writeAll = async (items) => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf8');
  };

  const findAll = () => readAll();

  const findById = async (id) => {
    const items = await readAll();
    return items.find((item) => item[idField] === Number(id)) || null;
  };

  const findBy = async (field, value) => {
    const items = await readAll();
    return items.filter((item) => item[field] === value);
  };

  const save = async (data) => {
    const items = await readAll();
    const nextId = items.reduce((max, item) => Math.max(max, item[idField]), 0) + 1;
    const newItem = { [idField]: nextId, ...data, [idField]: nextId };
    items.push(newItem);
    await writeAll(items);
    return newItem;
  };

  const update = async (id, data) => {
    const items = await readAll();
    const index = items.findIndex((item) => item[idField] === Number(id));
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, [idField]: items[index][idField] };
    await writeAll(items);
    return items[index];
  };

  const remove = async (id) => {
    const items = await readAll();
    const index = items.findIndex((item) => item[idField] === Number(id));
    if (index === -1) return null;
    const [removed] = items.splice(index, 1);
    await writeAll(items);
    return removed;
  };

  return { findAll, findById, findBy, save, update, remove };
};

module.exports = createJsonModel;
