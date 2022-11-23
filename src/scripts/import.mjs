import 'dotenv/config'
import mongoose from 'mongoose'
import Lemma from '../models/lemma.mjs'
import Verse from '../models/verse.mjs'
import fs from 'fs'

const lemmaFile = new URL('../../data/lemmas.json', import.meta.url).pathname
const verseFile = new URL('../../data/verses.json', import.meta.url).pathname

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	const lemmas = JSON.parse(fs.readFileSync(lemmaFile))
	await Lemma.insertMany(lemmas)
	const verses = JSON.parse(fs.readFileSync(verseFile))
	await Verse.insertMany(verses)
	await mongoose.disconnect()
})
