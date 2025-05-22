import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import helmet from 'helmet';
import connectDB from './db/connection.js';
import registerRoutes from './Routes/registerRoutes.js';
import leaveRoutes from './Routes/leaveRoutes.js';
import salaryRequestRoutes from './Routes/salaryRequestRoutes.js'; 
import userRoutes from './Routes/AuthRouter.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet()); 
app.use(cors({ 
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined')); 

app.use('/api', registerRoutes); 
app.use('/api', userRoutes);
app.use('/api/leaves', leaveRoutes); 
app.use('/api/salary-requests', salaryRequestRoutes); 

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'PONG', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  };
  console.error('Error:', errorDetails);

  const statusCode = err.status || 500;
  const response = {
    message: err.message || 'Something went wrong!',
  };

  if (NODE_ENV === 'development') {
    response.stack = err.stack;
    response.path = req.path;
    response.method = req.method;
  }

  res.status(statusCode).json(response);
});

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
      console.log(`CORS enabled for ${CORS_ORIGIN}`);
      console.log(`Environment: ${NODE_ENV}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Closing server...');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  });