/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

async function routes (fastify, options) {

	fastify.post('/', async (request, reply) => {
		return { hello: 'world'}
	})

	const userSchema = {
		type: 'object',
		required: ['email', 'username', 'password'],
		properties: {
			email: { type: 'string' },
			username: { type: 'string' },
			password: { type: 'string' },
		},
	}
	
	const schema = {
		body: userSchema,
	}
}

export default routes
