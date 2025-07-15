import { scheduleDailySync } from './jobs/daily-sync.job';
import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import armorRouter from './routes/armor.route';
import containerRouter from './routes/container.route';
import artefactRouter from './routes/artefact.route';
import express from 'express';
import cors from 'cors';


scheduleDailySync();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/armor', armorRouter);
app.use('/api/containers', containerRouter);
app.use('/api/artefacts', artefactRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
