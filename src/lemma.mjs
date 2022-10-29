import { model, Schema } from 'mongoose'

const LemmaSchema = new Schema({
	id: String,
	known: Boolean,
})

export default model('Lemma', LemmaSchema)
