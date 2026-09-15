import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from 'typebox'


/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

const userAvatar: FastifyPluginAsyncTypebox = async (fastify, options) => {

	fastify.patch('/avatar', async (request, reply) => {

		const avatar = await request.file()
		if (!avatar) {
			reply.code(400).send({ error: 'Bad request' })
			return
		}

		const mimetypes = ["image/png", "image/jpeg", "image/webp"];
		if ( !mimetypes.includes(avatar.mimetype) ) {
			reply.code(415).send('Unknown format')
			return
		}

		// const avatarName = 

	})

}

export default userAvatar