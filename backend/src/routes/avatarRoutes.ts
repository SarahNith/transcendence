import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from 'typebox'
import crypto, { randomUUID } from 'node:crypto'
import path from 'node:path'


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

		const generatedUUID = randomUUID()

		const extension: Record<string, string> = {
			"image/png": '.png',
			"image/jpeg": '.jpg',
			"image/webp": '.webp'
		}

		const avatarName = `${generatedUUID}${extension[avatar.mimetype]}`

		const avatarPath = path.join("/uploads/avatars/", avatarName)

	})

}

export default userAvatar