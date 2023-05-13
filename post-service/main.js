import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany();
  console.log(posts);

  // const newPost = await prisma.post.create({
  //   data: {
  //     user_id: 0,
  //     visibility: 'public',
  //     content: 'https://fly.io/docs/reference/postgres'
  //   }
  // })
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
