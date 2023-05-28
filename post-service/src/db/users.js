// userService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get a user by ID.
 * @param {number} id - The ID of the user.
 * @returns {Promise<object|null>} - A Promise that resolves to the user object or null if not found.
 */
async function getUserById(id) {
  return prisma.user.findUnique({ where: { id: parseInt(id, 10) } });
}

/**
 * Get a user by username.
 * @param {string} username - The username of the user.
 * @returns {Promise<object|null>} - A Promise that resolves to the user object or null if not found.
 */
async function getUserByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}

/**
 * Get a user by email.
 * @param {string} email - The email of the user.
 * @returns {Promise<object|null>} - A Promise that resolves to the user object or null if not found.
 */
async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

export { getUserById, getUserByUsername, getUserByEmail };
