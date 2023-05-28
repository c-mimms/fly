// postService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all posts.
 * @param {object} [options] - The query options.
 * @param {array} [options.authors] - Comma-separated author IDs.
 * @param {Date} [options.startTime] - Start time for filtering posts.
 * @param {Date} [options.endTime] - End time for filtering posts.
 * @param {number} [options.outgoingLinks] - The ID of the post to filter outgoing links.
 * @param {number} [options.incomingLinks] - The ID of the post to filter incoming links.
 * @returns {Promise<object[]>} - A Promise that resolves to an array of posts.
 */
async function getPosts(options = {}) {
    const { authors, startTime, endTime, outgoingLinks, incomingLinks } = options;
    let prismaQuery = {};

    // If authors are provided, convert them into an array of numbers
    if (authors) {
        prismaQuery.authorId = {
            in: authors,
        };
    }

    // If startTime is provided, add it to the query
    if (startTime) {
        prismaQuery.timestamp = {
            gte: startTime,
            ...prismaQuery.timestamp,
        };
    }

    // If endTime is provided, add it to the query
    if (endTime) {
        prismaQuery.timestamp = {
            lte: endTime,
            ...prismaQuery.timestamp,
        };
    }

    // If outgoingLinks is provided, add it to the query
    if (outgoingLinks) {
        prismaQuery.outgoingLinks = {
            some: {
                id: parseInt(outgoingLinks, 10),
            },
        };
    }

    // If incomingLinks is provided, add it to the query
    if (incomingLinks) {
        prismaQuery.incomingLinks = {
            some: {
                id: parseInt(incomingLinks, 10),
            },
        };
    }

    return prisma.post.findMany({
        where: prismaQuery,
        include: {
            author: true,
            incomingLinks: true,
            outgoingLinks: true,
        },
    });
}


/**
 * Get a post by ID.
 * @param {number} id - The ID of the post.
 * @returns {Promise<object|null>} - A Promise that resolves to the post object or null if not found.
 */
async function getPost(id) {
    return prisma.post.findUnique({
        where: { id: parseInt(id, 10)},
        include: {
            author: true
        },
    });
}

/**
 * Create a new post.
 * @param {object} postData - The data for creating the post.
 * @returns {Promise<object>} - A Promise that resolves to the newly created post.
 */
async function createPost(postData) {
    return prisma.post.create({
        data: postData,
    });
}

/**
 * Update a post by ID.
 * @param {number} id - The ID of the post.
 * @param {object} updatedData - The updated data for the post.
 * @returns {Promise<object|null>} - A Promise that resolves to the updated post object or null if not found.
 */
async function updatePost(id, updatedData) {
    return prisma.post.update({
        where: { id: parseInt(id, 10) },
        data: updatedData,
    });
}

/**
 * Delete a post by ID.
 * @param {number} id - The ID of the post.
 * @returns {Promise<void>} - A Promise that resolves when the post is deleted.
 */
async function deletePost(id) {
    return prisma.post.delete({ where: { id: parseInt(id, 10) } });
}

/**
 * Delete posts by IDs.
 * @param {number[]} ids - An array of post IDs.
 * @returns {Promise<void>} - A Promise that resolves when all the posts are deleted.
 */
async function deletePosts(ids) {
    return prisma.post.deleteMany({
        where: {
            id: {
                in: ids.map(id => parseInt(id, 10))
            }
    }});
  }


export { getPosts, getPost, createPost, updatePost, deletePost, deletePosts };
