import { model, Schema } from 'mongoose'

const VerseSchema = new Schema({
	bookName: String,
	chapterNumber: Number,
	verseNumber: Number,
	elements: [{
		_id: false,
		text: String,
		morph: String,
		lemma: String,
		known: Boolean
	}],
	unknownLemmas: [String],
	knownPercent: Number,
	hasRead: Boolean,
	awbLesson: Number
})

export default model('Verse', VerseSchema)