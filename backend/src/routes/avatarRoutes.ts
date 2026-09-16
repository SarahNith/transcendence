import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from 'typebox'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'


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
		if (!mimetypes.includes(avatar.mimetype)) {
			reply.code(415).send('Unknown format')
			return
		}

		const generatedUUID = randomUUID()

		const extension: Record<string, string> = {
			"image/png": '.png',
			"image/jpeg": '.jpg',
			"image/webp": '.webp'
		}

		//creer un nom pour le fichier uploade
		const avatarName = `${generatedUUID}${extension[avatar.mimetype]}`

		//l'endroit ou le fichier sera stocke
		const avatarPath = path.join(import.meta.dirname, '..', '..', 'uploads', 'avatars', avatarName)
		//cree le fichier dans avatarPath
		await pipeline(avatar.file, fs.createWriteStream(avatarPath))

		const avatarUrl = `/uploads/avatars/${avatarName}`

		const currentAvatar = await fastify.prisma.user.findUnique({
			where: { id: request.user.id },
			select: { avatar: true },
		})
		if (!currentAvatar) {
			reply.code(401).send({ error: 'Avatar not found' })
			return
		}

		const updateAvatar = await fastify.prisma.user.update({
			where: { id: request.user.id },
			data: { avatar: avatarUrl },
			select: { id:true, email: true, username: true, avatar: true, status: true }
		})

		const oldAvatarPath = path.join(import.meta.dirname, '..', '..', currentAvatar.avatar)
		if (currentAvatar.avatar !== "/uploads/avatars/default.png") {
			try {
				await fs.promises.unlink(oldAvatarPath)
			}
			catch (err) {
				fastify.log.error(err, 'Failed to delete old avatar file')
			}
		}

		return updateAvatar
	})

}

export default userAvatar