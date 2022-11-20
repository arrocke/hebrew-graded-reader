import { model, Schema } from 'mongoose'

const LemmaSchema = new Schema({
	id: String,
	known: Boolean,
	awbLesson: Number,
})

export default model('Lemma', LemmaSchema)
