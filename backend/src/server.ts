import 'dotenv/config'
import Fastify from 'fastify'
import prismaPlugin from './plugins/prisma.js'
import users from './routes/userRegisRoutes.js'
import fastifyCookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import guard from './plugins/guardPlugin.js'
import auth from './routes/authRoutes.js'


const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
	console.error("jwt secret error")
	process.exit(1)
}

//JSDoc : partie ignoree par node
//const fastify doit etre traitee comme ayant le type FastifyInstance
//va me proposer automatiquement .get, .post, .register...
/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */

const fastify = Fastify({ 
	logger: true,
})

// declare route depuis un autre fichier
fastify.register(prismaPlugin)
fastify.register(fastifyCookie)
fastify.register(jwt, {	
	secret: jwtSecret, 
	cookie: {
		cookieName: 'token',
		signed: false
	},
	sign: { expiresIn: '8h' }
})
fastify.register(multipart, {
	limits: {
		fileSize: 2 * 1024 * 1024,
	}
})
fastify.register(users)
fastify.register(guard)
fastify.register(auth)


//run server
fastify.listen({ port: 3000 }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})