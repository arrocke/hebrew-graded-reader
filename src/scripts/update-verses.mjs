import 'dotenv/config'
import mongoose from 'mongoose'
import Lemma from '../models/lemma.mjs'
import Verse from '../models/verse.mjs'

const conjugations = [{
	stem: 'q',
	conjugations: [ "p", "q", "i", "w", "v", "r", "h", "c" ]
},{
	stem: 'p',
	conjugations: [ "p", "q", "i", "w" ]
}]

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	const lemmas = (await Lemma.find({}, { id: true, awbLesson: true, known: true }).lean())
	const verbForms = conjugations.flatMap(stem => stem.conjugations.map(c => `V${stem.stem}${c}`))

	const cursor = Verse.find().cursor()

	for await (let verse of cursor) {
		const words = verse.elements.filter(element => element.lemma)
		const unknownLemmas = new Set()
		const awbLessons = []

		const knownElements = words.filter(element => {
			const morphElements = element.morph.split('/')
			const lemmaElements = element.lemma.split('/')

			element.known = lemmaElements.every((lemma, i) => {
				try {
					const morph = morphElements[i]
					const lemmaData = lemmas.find(l => l.id === lemma)
					awbLessons.push(lemmaData?.awbLesson)
					const isKnownVocab = lemmaData?.known ?? false
					const isNonVerb = !morph.includes('V')
					const isKnownVerbForm = verbForms.some(form => morph.includes(form))
					if (!isKnownVocab) unknownLemmas.add(lemma)
					return isKnownVocab && (isNonVerb || isKnownVerbForm)
				} catch (error) {
					console.log(verse.bookName, verse.chapterNumber, verse.verseNumber, element)
					throw error
				}
			})
			return element.known
		})
		verse.knownPercent = knownElements.length / words.length
		verse.unknownLemmas = Array.from(unknownLemmas)
		if (awbLessons.every(lesson => typeof lesson === 'number')) {
			verse.awbLesson = awbLessons.reduce((max, lesson) => Math.max(max, lesson), 0)
		} else {
			verse.awbLesson = undefined
		}
		await verse.save()
	}

	await mongoose.disconnect()
})
