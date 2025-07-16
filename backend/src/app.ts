import { scheduleDailySync } from './jobs/daily-sync.job';
import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import armorRouter from './routes/armor.route';
import containerRouter from './routes/container.route';
import artefactRouter from './routes/artefact.route';
import buildRouter from './routes/build.route';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet'
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
});

scheduleDailySync();

const app = express();
app.use(cors());
app.use(csrfProtection);
app.use(express.json());
app.use(helmet())
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/armor', armorRouter);
app.use('/api/containers', containerRouter);
app.use('/api/artefacts', artefactRouter);
app.use('/api/builds', buildRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
