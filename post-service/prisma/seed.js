import { randomBytes, pbkdf2 as _pbkdf2 } from 'crypto';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';

const pbkdf2 = promisify(_pbkdf2);
const prisma = new PrismaClient();

const DEV_USER = 'user';
const DEV_PASSWORD = 'password';

async function main() {
    var salt = randomBytes(16);
    const hashedPassword = await pbkdf2(DEV_PASSWORD, salt, 310000, 32, 'sha256');
    const user = await prisma.user.create({
        data: {
            username: DEV_USER,
            passwordHash: hashedPassword,
            salt: salt
        }   
    });
    console.log(`Created user with id: ${user.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });