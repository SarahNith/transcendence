import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import profileRoutes from '../routes/profileRoutes.js'
import avatarRoutes from '../routes/avatarRoutes.js'



//gardien qui protege ce qui vient apres l'authentification
//verifie que le token est valide avant de lui permettre d'acceder au reste

const guardPlugin: FastifyPluginAsyncTypebox = async (fastify, options) => {
	
	fastify.addHook('onRequest', async (request, reply) => {
		try {
			await request.jwtVerify()
		}
		catch {
			reply.code(401).send({ error: 'Unknown user' })
			return
		}
	});

	fastify.register(profileRoutes)
	fastify.register(avatarRoutes)

}

export default guardPlugin