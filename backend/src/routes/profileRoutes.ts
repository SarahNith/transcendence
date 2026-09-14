import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import fastify from 'fastify'
import { Type } from 'typebox'

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

//Renvoie les informations du compte de la personne concernee => "mon profil"

const myProfile: FastifyPluginAsyncTypebox = async (fastify, options) => {

	fastify.get('/', async (request, reply) => {
		const profile = await fastify.prisma.user.findUnique({
			where: {
				id: request.user.id
			},
			select: { email: true, username: true, avatar: true, status: true } })

			return profile
	})

	fastify.patch('/', async (request, reply) => {
		const updateSchema = Type.Optional({
			email: Type.String({ format: 'email' }),
			username: Type.String({ minLength: 3 }),
		})

		const schema = {
			body: updateSchema,
		}

		const updateProfile = await fastify.prisma.user.update({
			where: { OR: [ { email: request.body.email }, { username: request.body.username } ]}})
	})
}
export default myProfile


