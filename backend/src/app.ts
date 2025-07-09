import { scheduleDailySync } from './jobs/daily-sync.job';
import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.route';


scheduleDailySync();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API ready on http://localhost:${PORT}`));


