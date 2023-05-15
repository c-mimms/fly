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

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy_policy.html'));
});

app.get('/tos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms_of_service.html'));
});

app.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany();

    // Render the posts in a basic HTML format
    const html = `
      <html>
        <head>
          <title>Posts</title>
        </head>
        <body>
          <h1>Posts</h1>
          <ul>
            ${posts
              .map((post) => `<li>${post.content}</li>`)
              .join('')}
          </ul>
        </body>
      </html>
    `;

    res.send(html);
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
  await prisma.$disconnect();
  server.close();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
