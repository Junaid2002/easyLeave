import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connection.js';
import registerRoutes from './Routes/registerRoutes.js';
import leaveRoutes from './Routes/leaveRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', registerRoutes); 
app.use('/api/leaves', leaveRoutes);

app.get('/ping', (req, res) => {
  res.send('PONG');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });