import Fastify from 'fastify'
import dbConnector from './db-connector.js'
import routes from './first-route.js'
import users from './users.js'
import formats from 'ajv-formats'

//JSDoc : partie ignoree par node
//const fastify doit etre traitee comme ayant le type FastifyInstance
//va me proposer automatiquement .get, .post, .register...
/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */

const fastify = Fastify({ logger: true })

const fasify = Fastify ({
	ajv: {
		plugins: [formats]	
	}
})

//declare route directement dans le fichier d'entree
// fastify.get('/', function (request, reply) {
// 	reply.send({ hello: 'world' })
// })

// declare route depuis un autre fichier
fastify.register(dbConnector)
fastify.register(routes)
fastify.register(users)



//run server
fastify.listen({ port: 3000 }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
})