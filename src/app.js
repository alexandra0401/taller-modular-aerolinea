const express = require('express');
const pilotRoutes = require('./routes/pilotRoutes');
const airplaneRoutes = require('./routes/airplaneRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/pilotos', pilotRoutes);
app.use('/api/aviones', airplaneRoutes);
app.use('/api/asignaciones', assignmentRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
