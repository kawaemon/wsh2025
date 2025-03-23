import { FastifyReply } from 'fastify/types/reply';

export const cacheable = (r: FastifyReply) => r.header('cache-control', 'public, max-age=2592000, immutable');
