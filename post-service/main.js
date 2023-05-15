import express from 'express';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const app = express();

//Can serve static files in the future
// app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy_policy.html'));
});

app.get('/tos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms_of_service.html'));
});

app.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.render('posts', { posts });
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).send('An error occurred while retrieving posts.');
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
