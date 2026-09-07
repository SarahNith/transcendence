import bcrypt from 'bcryptjs';
/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
const routes = async (fastify, options) => {
    const users = fastify.mongo.db.collection('users_collection');
    // fastify.post('/', async (request, reply) => {
    // 	return { hello: 'world'}
    // })
    const userSchema = {
        type: 'object',
        required: ['email', 'username', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            username: { type: 'string', minLength: 3 },
            password: { type: 'string', minLength: 8, maxLength: 64 },
        },
    };
    const schema = {
        body: userSchema,
    };
    fastify.post('/', { schema }, async (request, reply) => {
        const value = await users.findOne({ $or: [{ email: request.body.email }, { username: request.body.username }] });
        if (value) {
            reply.code(409).send('Existing value');
            return;
        }
        const hash = await bcrypt.hash(request.body.password, 12);
        const userInit = {
            email: request.body.email,
            username: request.body.username,
            hashedPw: hash,
            avatar: '/uploads/avatars/default.png',
            status: 'offline'
        };
        const result = await users.insertOne(userInit);
        return result;
    });
};
export default routes;
