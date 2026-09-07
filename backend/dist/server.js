import 'dotenv/config';
import Fastify from 'fastify';
import users from './routes/users.js';
// import formats from 'ajv-formats'
import fastifyCookie from '@fastify/cookie';
import session from '@fastify/session';
import auth from './routes/auth.js';
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    console.error("session secret error");
    process.exit(1);
}
//JSDoc : partie ignoree par node
//const fastify doit etre traitee comme ayant le type FastifyInstance
//va me proposer automatiquement .get, .post, .register...
/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
    logger: true,
    // ajv: {
    // 	plugins: [formats]	
    // }
});
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
fastify.register(users);
fastify.register(fastifyCookie);
fastify.register(session, {
    secret: sessionSecret,
    cookie: {
        secure: false
    },
    saveUninitialized: false
});
fastify.register(auth);
//run server
fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
