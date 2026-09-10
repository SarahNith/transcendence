import bcrypt from 'bcryptjs'
import type { FastifyPluginAsync } from 'fastify'

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

interface UserSchema {
	email: string
	username: string
	password: string
}

const routes: FastifyPluginAsync = async (fastify, options) => {

	const userSchema = {
		type: 'object',
		required: ['email', 'username', 'password'],
		properties: {
			email: { type: 'string', format: 'email' },
			username: { type: 'string', minLength: 3 },
			password: { type: 'string', minLength: 8, maxLength: 64 },
		},
	}
	
	const schema = {
		body: userSchema,
	}

	fastify.post<{ Body: UserSchema }>('/', { schema }, async (request, reply) => {
		const value = await fastify.prisma.user.findFirst({ 
			where: { OR: [ { email: request.body.email	}, { username: request.body.username } ]}})
		if (value) {
			reply.code(409).send('Existing value')
			return
		}

		const hash = await bcrypt.hash(request.body.password, 12)

		const userInit = {
		email: request.body.email,
		username: request.body.username,
		hashedPw: hash,
		avatar: '/uploads/avatars/default.png',
		status: 'offline'
		}
	
		const result = await fastify.prisma.user.create({ data: userInit })
		return result
	})
}

export default routes
