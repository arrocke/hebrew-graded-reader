import 'dotenv/config'
import mongoose from 'mongoose'
import Verse from './verse.mjs'
import Lemma from './lemma.mjs'

const mark = process.argv[2]
const verses = process.argv.slice(3)

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	for (const verse of verses) {
		const book = verse.split(' ').slice(0, -1).join(' ')
		const chapterN = parseInt(verse.split(' ').slice(-1)[0].split(':')[0])
		const verseN = parseInt(verse.split(' ').slice(-1)[0].split(':')[1])
		const v = await Verse.findOne({ bookName: book, chapterNumber: chapterN, verseNumber: verseN })

		if (mark === 'read') {
			v.hasRead = true
		} else if (mark === 'known') {
			const lemmas = v.elements.filter(el => el.lemma).flatMap(el => el.lemma.split('/'))
			for (const id of lemmas) {
				await Lemma.updateOne({ id }, { $set: { id, known: true }}, { upsert: true })
			}
		}

		await v.save()
	}
	await mongoose.disconnect()
})
