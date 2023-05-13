import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
const port = 3000;

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

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Cleanup resources when the server is shutting down
const cleanup = async () => {
  await prisma.$disconnect();
  server.close();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
