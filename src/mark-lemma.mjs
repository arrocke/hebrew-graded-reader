import 'dotenv/config'
import mongoose from 'mongoose'
import Lemma from './lemma.mjs'

const lemmaIds = process.argv.slice(2)

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	for (const id of lemmaIds) {
		await Lemma.updateOne({ id }, { $set: { id, known: true }}, { upsert: true })
	}
	await mongoose.disconnect()
})