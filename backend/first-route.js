
//JSDoc: partie ignoree par node
//meme principe que @type (dans index.js) mais va s'appliquer aux params d'une fonction plutot qu'a une variable
/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */

async function routes (fastify, options) {
	const collection = fastify.mongo.db.collection('test_collection')

	fastify.get('/', async (request, reply) => {
		return { hello: 'world' }
	})

	//recupere tous les documents de la collection (find) puis transforme le resultat en tableau JS classique qu'on peut manipuler (.toArray())
	//si le tableau est vide, on envoie une erreur
	fastify.get('/animals', async (request, reply) => {
		const result = await collection.find().toArray()
		if (result.length === 0) {
			throw new Error('No documents found')
		}
		return result
	})

	//:animal dans l'URL est un param de route
	//si on appelle /animals/chat, Fastify va capturer automatiquement "chat" et le rend dispo via request.params.animal
	fastify.get('/animals/:animal', async (request, reply) => {
		const result = await collection.findOne({ animal: request.params.animal })
		if (!result) {
			throw new Error('Invalid value')
		}
		return result
	})

	const animalBodyJsonSchema = {
		type: 'object',
		required: ['animal'],
		properties: {
			animal: { type: 'string' },
		},
	}

	const schema = {
		body: animalBodyJsonSchema,
	}

	fastify.post('/animals', { schema }, async (request, reply) => {
		const result = await collection.insertOne({ animal: request.body.animal })
		return result
	})
}

export default routes