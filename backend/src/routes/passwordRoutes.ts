import bcrypt from 'bcryptjs'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from 'typebox'

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const modifPassword: FastifyPluginAsyncTypebox = async (fastify, options) => {
	
	const pwSchema =
		Type.Object({
			currentPw: Type.String({ minLength: 8, maxLength: 64 }),
			newPw: Type.String({ minLength: 8, maxLength: 64 }),
		})
	
	const schema = {
		body: pwSchema,
	}
	
	//changer le mdp
	fastify.patch('/password', { schema }, async (request, reply) => {

		const userHashedPw = await fastify.prisma.user.findUnique({
			where: { id: request.user.id },
			select: { hashedPw: true },
		})
		if (!userHashedPw) {
			reply.code(401).send({ error: 'Password not found' })
			return
		}
		
		const pw = await bcrypt.compare(request.body.currentPw, userHashedPw.hashedPw)
		if (pw) {
			const newHash = await bcrypt.hash(request.body.newPw, 12)
			
			const updatePw = await fastify.prisma.user.update({
				where: { id: request.user.id },
				data: { hashedPw: newHash, pwChangedAt: new Date() },
				select: { id: true }
			})

			//creer un nouveau cookie
			const token = await reply.jwtSign({ id: updatePw.id })
			
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
			reply.code(401).send({ error: 'Incorrect password' })
			return
		}
	})	
}

export default modifPassword