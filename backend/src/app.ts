import { scheduleDailySync } from './jobs/daily-sync.job';
import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import armorRouter from './routes/armor.route';
import containerRouter from './routes/container.route';
import artefactRouter from './routes/artefact.route';
import buildRouter from './routes/build.route';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import csrf from 'csurf';
import morgan from 'morgan';

scheduleDailySync();

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:3001',
    /\.tunnel4\.com$/ // Регулярное выражение для всех поддоменов
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// const csrfProtection = csrf({
//   cookie: {
//     key: '_csrf',
//     secure: false,
//     httpOnly: false,
//     sameSite: 'lax',
//     path: '/'
//   }
// });

// app.get('/api/csrf-token', csrfProtection, (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });

// app.use('/api', csrfProtection);

// app.use((err, req, res, next) => {
//   if (err.code === 'EBADCSRFTOKEN') {
//     console.error('CSRF ERROR:', {
//       tokenFromHeader: req.headers['x-csrf-token'],
//       tokenFromCookie: req.cookies['_csrf'],
//       message: err.message,
//     });
//     return res.status(403).json({ message: 'Invalid CSRF token' });
//   }
//   next(err);
// });

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/armor', armorRouter);
app.use('/api/containers', containerRouter);
app.use('/api/artefacts', artefactRouter);
app.use('/api/builds', buildRouter);

app.use(morgan('dev'));


app.use(helmet());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
