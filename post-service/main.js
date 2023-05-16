import express from 'express';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
}));

app.use(express.json())

app.use(passport.initialize());
app.use(passport.session());

//Can serve static files in the future
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Landing page
app.get('/', (req, res) => {
  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    // Render the customized landing page for authenticated users
    // res.render('dashboard', { user: req.user });
    res.redirect('/posts');
  } else {
    // Render the landing page with create account/login area for unauthenticated users
    res.render('landing');
  }
});


// Authentication routes

app.get('/login', (req, res) => {
  res.redirect('/auth/google');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(400).send('Unable to log out')
      } else {
        res.redirect('/');
      }
    });
  } else {
    res.end()
  }
});


// Other routes

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy_policy.html'));
});

app.get('/tos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms_of_service.html'));
});

app.get('/posts', ensureAuthenticated, async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.render('posts', { posts });
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).send('An error occurred while retrieving posts.');
  }
});

// Route handler for creating a new post
app.post('/posts', ensureAuthenticated, async (req, res) => {
  try {
    console.log(req);
    const { content } = req.body;

    // Perform post creation logic
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.user.id,
      },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  }
});

const PORT = process.env.PORT || "8080";
const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// Cleanup resources when the server is shutting down
const cleanup = async () => {
  // await prisma.$disconnect();
  debug('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    debug('HTTP server closed')
  })
};

process.on('SIGTERM', cleanup);

// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // If the user is not authenticated, redirect them to the login page
  res.redirect('/auth/google');
}
