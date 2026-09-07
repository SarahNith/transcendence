import bcrypt from 'bcryptjs';
/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
const routes = async (fastify, options) => {
    const users = fastify.mongo.db.collection('users_collection');
    const authSchema = {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 64 },
        },
    };
    const schema = {
        body: authSchema,
    };
    fastify.post('/login', { schema }, async (request, reply) => {
        const user = await users.findOne({ email: request.body.email });
        if (!user) {
            reply.code(401).send({ error: 'Incorrect email or password' });
            return;
        }
        const pw = await bcrypt.compare(request.body.password, user.hashedPw);
        if (pw) {
            request.session.userId = user._id;
            return user._id;
        }
        else {
            reply.code(401).send({ error: 'Incorrect email or password' });
            return;
        }
        // return { hello: 'world' }
    });
};
export default routes;
