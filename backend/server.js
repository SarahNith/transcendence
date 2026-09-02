import Fastify from 'fastify'
import dbConnector from './db-connector.js'
import routes from './first-route.js'
import users from './routes/users.js'
import formats from 'ajv-formats'
import auth from './routes/auth.js'

//JSDoc : partie ignoree par node
//const fastify doit etre traitee comme ayant le type FastifyInstance
//va me proposer automatiquement .get, .post, .register...
/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */

const fastify = Fastify({ 
	logger: true,
	ajv: {
		plugins: [formats]	
	}
})

// const fastify = Fastify ({
// 	ajv: {
// 		plugins: [formats]	
// 	}
// })

//declare route directement dans le fichier d'entree
// fastify.get('/', function (request, reply) {
// 	reply.send({ hello: 'world' })
// })

// declare route depuis un autre fichier
fastify.register(dbConnector)
fastify.register(routes)
fastify.register(users)
fastify.register(auth)


//run server
fastify.listen({ port: 3000 }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})