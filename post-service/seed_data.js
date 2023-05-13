import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany()
  console.log(posts)
  const users = await prisma.user.findMany()
  console.log(users)

//   const newPost = await prisma.post.create({
//     data: {
//       content: 'Test post please ignore'
//     }
//   })

//   const newPost2 = await prisma.post.create({
//     data: {
//       content: 'Post 2, no user'
//     }
//   })

//   id    Int     @id @default(autoincrement())
//   email String  @unique
//   name  String?
//   posts Post[]

// id         Int      @id @default(autoincrement())
// author     User?     @relation(fields: [authorId], references: [id])
// authorId   Int?
// timestamp  DateTime @default(now())
// visibility String?
// content    String
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
