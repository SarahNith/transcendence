import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import profileRoutes from '../routes/profileRoutes.js'
import avatarRoutes from '../routes/avatarRoutes.js'
import passwordRoutes from '../routes/passwordRoutes.js'

//gardien qui protege ce qui vient apres l'authentification
//verifie que le token est valide avant de lui permettre d'acceder au reste

const guardPlugin: FastifyPluginAsyncTypebox = async (fastify, options) => {
	
	fastify.addHook('onRequest', async (request, reply) => {
		try {
			//verifie qu'il y a bien un cookie pw correspondant si c'est le cas on peut acceder au reste
			await request.jwtVerify()

			//tout ca c'est pour rejeter un vieux cookie suite a un changement de pw
			const lastPw = await fastify.prisma.user.findUnique({
				where: { id: request.user.id },
				select: { pwChangedAt: true }
			})

			if (lastPw?.pwChangedAt) {
				const lastPwTime = lastPw.pwChangedAt.getTime()

				//on passe LastPwTime en secondes et on tronque pour que ca soit precis
				const pwTimeSeconds = Math.floor(lastPwTime / 1000)
				if (request.user.iat < pwTimeSeconds) {
					reply.code(401).send({ error: 'Unknown user' })
					return
				}
			}
		}
		catch {
			reply.code(401).send({ error: 'Unknown user' })
			return
		}
	});

	fastify.register(profileRoutes, { prefix: '/profile' })
	fastify.register(avatarRoutes, { prefix: '/profile' })
	fastify.register(passwordRoutes, { prefix: '/profile' })
}

export default guardPlugin