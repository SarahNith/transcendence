import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.js"

const prismaPlugin: FastifyPluginAsync = async (fastify, options) => {
	
	const databaseUrl = process.env.DATABASE_URL
	if (!databaseUrl) {
			process.exit(1)
		}

	const adapter = new PrismaPg({ 
		connectionString: databaseUrl });
	
	const prisma = new PrismaClient({ adapter });

	fastify.decorate('prisma', prisma);

	fastify.addHook('onClose', async () => {
		await prisma.$disconnect();
	});

}

export default fp(prismaPlugin)

declare module 'fastify' {
	interface FastifyInstance {
		prisma: PrismaClient
	}
}