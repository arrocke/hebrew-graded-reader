import { model, Schema } from 'mongoose'

const VerbStemSchema = new Schema({
	stem: String,
	conjugations: [String],
})

export default model('VerbStem', VerbStemSchema)
