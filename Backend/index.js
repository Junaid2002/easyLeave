import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connection.js';
import registerRoutes from './Routes/registerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  console.log(' Database connected successfully.');
});

app.use(cors());
app.use(express.json());

app.use('/api/registers', registerRoutes);

app.get('/ping', (req, res) => {
  res.send('PONG');
});

app.listen(PORT, () => {
  console.log(` Server is running at http://localhost:${PORT}`);
});
