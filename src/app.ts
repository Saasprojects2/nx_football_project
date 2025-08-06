import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from "cors";
import express from 'express';
import session from 'express-session';
import errorHandler from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import tournamentRoutes from './routes/tournamentRoutes';
import teamRoutes from './routes/teamRoutes';
import {setupSwagger} from './swagger';
import postRoutes from './routes/postRoutes'
import fixture from './routes/fixtureRoutes'
import leaderboard from './routes/leaderboardRoutes'
import lineup from './routes/lineupRoutes'
import matchEvent from './routes/matchEventRoutes'
import playerRoutes from './routes/playerRoutes'


const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_APP_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_APP_URL);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

//swagger ui
setupSwagger(app);


app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/post', postRoutes);
app.use('/api/fixture', fixture);
app.use('/api/leaderboard', leaderboard);
app.use('/api/lineup', lineup);
app.use('/api/matchEvent', matchEvent);
app.use('/api/player', playerRoutes);


app.get('/', (req, res) => {
  res.send('For nxchamp-backend docs visit https://prod.nxchamp.com/api-docs time-1d');
});

// Error handling middleware
app.use(errorHandler); // Use the error handler after all routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`swagger server ui is running on http://localhost:${PORT}/api-docs`)
});
