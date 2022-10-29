import { model, Schema } from 'mongoose'

const VerseSchema = new Schema({
	bookName: String,
	bookOrder: Number,
	chapterNumber: Number,
	verseNumber: Number,
	elements: [{
		_id: false,
		text: String,
		morph: String,
		lemma: String
	}]
})

export default model('Verse', VerseSchema)