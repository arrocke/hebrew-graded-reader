import 'dotenv/config'
import mongoose from 'mongoose'
import Lemma from './lemma.mjs'
import VerbStem from './verb-stem.mjs'
import Verse from './verse.mjs'

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	const lemmas = (await Lemma.find({ known: true }, { id: true }).lean()).map(lemma => lemma.id)
	const verbForms = (await VerbStem.find({}).lean()).flatMap(stem => stem.conjugations.map(c => `V${stem.stem}${c}`))

	const cursor = Verse.find().cursor()

	for await (let verse of cursor) {
		const words = verse.elements.filter(element => element.lemma)
		const knownElements = words.filter(element => {
			const morphElements = element.morph.split('/')
			const lemmaElements = element.lemma.split('/')

			element.known = lemmaElements.every((lemma, i) => {
				try {
					const morph = morphElements[i]
					const isKnownVocab = lemmas.includes(lemma)
					const isNonVerb = !morph.includes('V')
					const isKnownVerbForm = verbForms.some(form => morph.includes(form))
					return isKnownVocab && (isNonVerb || isKnownVerbForm)
				} catch (error) {
					console.log(verse.bookName, verse.chapterNumber, verse.verseNumber, element)
					throw error
				}
			})
			return element.known
		})
		verse.knownPercent = knownElements.length / words.length
		await verse.save()
	}

	await mongoose.disconnect()
})
