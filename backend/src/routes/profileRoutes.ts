import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from 'typebox'

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

//Renvoie les informations du compte de la personne concernee => "mon profil"

const userProfile: FastifyPluginAsyncTypebox = async (fastify, options) => {

	fastify.get('/', async (request, reply) => {
		const profile = await fastify.prisma.user.findUnique({
			where: {
				id: request.user.id
			},
			select: { email: true, username: true, avatar: true, status: true } })

			return profile
	})

	//modifier email et/ou username	
	const updateSchema = Type.Object({
			email: Type.Optional( Type.String({ format: 'email' }) ),
			username: Type.Optional( Type.String({ minLength: 3 }) ),
		})
	
	const schema = {
			body: updateSchema,
		}

	fastify.patch('/', { schema }, async (request, reply) => {
		
		const values = []
		if (request.body.email) {
			values.push({ email: request.body.email })
		}
		if (request.body.username) {
			values.push({ username: request.body.username })
		}

		if (values.length > 0) {
			const searchConflict = await fastify.prisma.user.findFirst({
				where: {
					OR: values,
					NOT: [{ id: request.user.id }],
				}
			})
			if (searchConflict) {
				reply.code(409).send('Existing value')
				return
			}
		}
	
		const updateProfile = await fastify.prisma.user.update({
			where: { id: request.user.id },
			data: { email: request.body.email, username: request.body.username },
			select: { id:true, email: true, username: true, avatar: true, status: true }
		})
		
		return updateProfile
})
}

export default userProfile
