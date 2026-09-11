import bcrypt from 'bcryptjs'
import type { FastifyPluginAsync } from 'fastify'

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

interface AuthSchema {
		email: string
		password: string
	}

const routes: FastifyPluginAsync = async (fastify, options) => {

	const authSchema = {
		type: 'object',
		required: ['email', 'password'],
		properties: {
			email: { type: 'string', format: 'email' },
			password: { type: 'string', minLength: 8, maxLength: 64 },
		},
	}

	const schema = {
		body: authSchema,
	}

	fastify.post<{ Body: AuthSchema }>('/login', { schema }, async (request, reply) =>{
		const user = await fastify.prisma.user.findUnique({ 
			where: {
				email: request.body.email,
			}
		})
		if (!user) {
			reply.code(401).send({ error: 'Incorrect email or password' })
			return
		}

		const pw = await bcrypt.compare(request.body.password, user.hashedPw)
		if (pw) { 
			const token = await reply.jwtSign({ id: user.id })
			
			reply.setCookie('token', token, {
				path: '/',
				secure: false,
				httpOnly: true,
				sameSite: true
			})
			.code(200)
			.send({ success: true })
		}
		else {
			reply.code(401).send({ error: 'Incorrect email or password' })
			return
		}
		
		// const pw = await bcrypt.compare(request.body.password, user.hashedPw)
		// if (pw) {
		// 	request.session.userId = user.id
		// 	return user.id
		// }
		// else {
		// 	reply.code(401).send({ error: 'Incorrect email or password' })
		// 	return
		// }

		// return { hello: 'world' }
	});

}

export default routes