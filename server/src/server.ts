import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dbConnect from './config/db';
import reportsRouter from './routes/reports';
import researchRouter from './routes/research';
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to DB
dbConnect().catch(err => console.error("Database connection failed:", err));

app.use('/api/reports', reportsRouter);
app.use('/api/research', researchRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
