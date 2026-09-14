import bcrypt from 'bcryptjs'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import Type from 'typebox'


/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const routes: FastifyPluginAsyncTypebox = async (fastify, options) => {

	const userSchema = 
		Type.Object({
			email: Type.String({ format: 'email' }),
			username: Type.String({ minLength: 3 }),
			password: Type.String({ minLength: 8, maxLength: 64 }),
		})
	
	const schema = {
		body: userSchema,
	}

	fastify.post('/', { schema }, async (request, reply) => {
		const value = await fastify.prisma.user.findFirst({ 
			where: { OR: [ { email: request.body.email }, { username: request.body.username } ]}})
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
	
		const result = await fastify.prisma.user.create({ 
			data: userInit,
			select: { id:true, email: true, username: true, avatar: true, status: true } })
		
		const token = await reply.jwtSign({ id: result.id })
			
		reply.setCookie('token', token, {
			path: '/',
			secure: false,
			httpOnly: true,
			sameSite: true
		})
		.code(200)
		.send({ success: true })
		
		// return result
	})
}

export default routes