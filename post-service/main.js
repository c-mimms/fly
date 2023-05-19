import express from 'express';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';
import { router as authRouter } from './routes/auth.js';
import { router as apiRouter } from './routes/api/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.use('/auth', authRouter);
// app.use('/p', postRouter);
app.use('/api', apiRouter);
app.get('/', landingPageHandler);
app.get('/privacy', privacyPageHandler);
app.get('/tos', tosPageHandler);

const PORT = process.env.PORT || "8080";
const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// Cleanup resources when the server is shutting down
process.on('SIGTERM', cleanup);

async function cleanup() {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  });
}

// Route Handlers
function landingPageHandler(req, res) {
  req.isAuthenticated() ? res.render('app') : res.render('landing');
}

function privacyPageHandler(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'privacy_policy.html'));
}

function tosPageHandler(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'terms_of_service.html'));
}
