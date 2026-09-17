import bcrypt from 'bcryptjs'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from 'typebox'

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const dummyHash = bcrypt.hash("dummyPwToCompareWith", 12)

const routes: FastifyPluginAsyncTypebox = async (fastify, options) => {

	const authSchema = 
		Type.Object({
			email: Type.String({ format: 'email' }),
			password: Type.String({ minLength: 8, maxLength: 64 }),
		})


	const schema = {
		body: authSchema,
	}

	fastify.post('/login', { schema }, async (request, reply) =>{
		const user = await fastify.prisma.user.findUnique({ 
			where: {
				email: request.body.email,
			}
		})
		if (!user) {
			
			await bcrypt.compare(request.body.password, await dummyHash)
			reply.code(401).send({ error: 'Incorrect email or password' })
			return
		}

		const pw = await bcrypt.compare(request.body.password, user.hashedPw)
		if (pw) { 

			const updateStatus = await fastify.prisma.user.update({
				where: { id: user.id },
				data: { status: 'online' },
			})

			//cree un token
			const token = await reply.jwtSign({ id: user.id })
			
			reply.setCookie('token', token, {
				path: '/',
				secure: false,
				httpOnly: true,
				sameSite: true
			})
			.code(200)
			.send({ success: true })
			return updateStatus
		}
		else {
			
			reply.code(401).send({ error: 'Incorrect email or password' })
			return
		}
	});
}

export default routes