import 'dotenv/config'
import mongoose from 'mongoose'
import Lemma from './lemma.mjs'
import Verse from './verse.mjs'

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	const lemmas = (await Lemma.find({ known: true }, { id: true }).lean()).map(lemma => lemma.id)

	const cursor = Verse.find().cursor()

	for await (let verse of cursor) {
		const words = verse.elements.filter(element => element.lemma)
		const knownElements = words.filter(element => {
			element.known = element.lemma.split('/').every(morph => lemmas.includes(morph))
			return element.known
		})
		verse.knownPercent = knownElements.length / words.length
		await verse.save()
	}

	await mongoose.disconnect()
})
