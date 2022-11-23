import 'dotenv/config'
import mongoose from 'mongoose'
import Lemma from '../models/lemma.mjs'
import Verse from '../models/verse.mjs'
import fs from 'fs'

const lemmaFile = new URL('../../data/lemmas.json', import.meta.url).pathname
const verseFile = new URL('../../data/verses.json', import.meta.url).pathname

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	const lemmas = await Lemma.find({}, { _id: false, __v: false }).sort({ id: 1 }).lean()
	fs.writeFileSync(lemmaFile, JSON.stringify(lemmas, null, 2))
	const verses = await Verse.find({}, { _id: false, __v: false }).lean()
	fs.writeFileSync(verseFile, JSON.stringify(verses, null, 2))
	await mongoose.disconnect()
})
