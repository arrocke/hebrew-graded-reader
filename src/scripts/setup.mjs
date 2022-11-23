import 'dotenv/config'
import { XMLParser } from 'fast-xml-parser'
import fs from 'fs/promises'
import mongoose from 'mongoose'
import Verse from '../models/verse.mjs'
import Lemma from '../models/lemma.mjs'

const parser = new XMLParser({
	preserveOrder: true,
	ignoreAttributes: false
})

const bookMap = [
{ file: 'Gen.xml', name: 'Genesis' },
{ file: 'Exod.xml', name: 'Exodus' },
{ file: 'Lev.xml', name: 'Leviticus' },
{ file: 'Num.xml', name: 'Numbers' },
{ file: 'Deut.xml', name: 'Deuteronomy' },
{ file: 'Josh.xml', name: 'Joshua' },
{ file: 'Judg.xml', name: 'Judges' },
{ file: 'Ruth.xml', name: 'Ruth' },
{ file: '1Sam.xml', name: '1 Samuel' },
{ file: '2Sam.xml', name: '2 Samuel' },
{ file: '1Kgs.xml', name: '1 Kings' },
{ file: '2Kgs.xml', name: '2 Kings' },
{ file: '1Chr.xml', name: '1 Chronicles' },
{ file: '2Chr.xml', name: '2 Chronicles' },
{ file: 'Ezra.xml', name: 'Ezra' },
{ file: 'Neh.xml', name: 'Nehemiah' },
{ file: 'Esth.xml', name: 'Esther' },
{ file: 'Job.xml', name: 'Job' },
{ file: 'Ps.xml', name: 'Psalms' },
{ file: 'Prov.xml', name: 'Proverbs' },
{ file: 'Eccl.xml', name: 'Ecclesiastes' },
{ file: 'Song.xml', name: 'Song of Solomon' },
{ file: 'Isa.xml', name: 'Isaiah' },
{ file: 'Jer.xml', name: 'Jeremiah' },
{ file: 'Lam.xml', name: 'Lamentations' },
{ file: 'Ezek.xml', name: 'Ezekiel' },
{ file: 'Dan.xml', name: 'Daniel' },
{ file: 'Hos.xml', name: 'Hosea' },
{ file: 'Joel.xml', name: 'Joel' },
{ file: 'Amos.xml', name: 'Amos' },
{ file: 'Obad.xml', name: 'Obadiah' },
{ file: 'Jonah.xml', name: 'Jonah' },
{ file: 'Mic.xml', name: 'Micah' },
{ file: 'Nah.xml', name: 'Nahum' },
{ file: 'Hab.xml', name: 'Habakkuk' },
{ file: 'Zeph.xml', name: 'Zephaniah' },
{ file: 'Hag.xml', name: 'Haggai' },
{ file: 'Zech.xml', name: 'Zechariah' },
{ file: 'Mal.xml', name: 'Malachi' },
]

async function loadData() {
	const lemmas = new Set()
	for (const order in bookMap) {
		const { file, name } = bookMap[order]
		console.log(name)
		const data = await fs.readFile(`./data/wlc/${file}`)
		const json = parser.parse(data)
		const book = json[1].osis[0].osisText[1]

		const chapters = book.div
		for (let chapterN = 0; chapterN < chapters.length; chapterN++) {
			const chapter = chapters[chapterN]

			const verses = chapter.chapter
			for (let verseN = 0; verseN < verses.length; verseN++) {
				const verse = verses[verseN]

				const elements = verse.verse.map(element => {
					switch (Object.keys(element)[0]) {
						case 'w': {
							const text = element.w[0]['#text']
							const lemma = element[':@']['@_lemma']
							const morph = element[':@']['@_morph']
							lemma.split('/').forEach(l => lemmas.add(l))
							return { text, lemma, morph }
						}
						case 'seg': {
							const text = element.seg[0]['#text']
							return { text }
						}
						default: {
							return false
						}
					}
				}).filter(Boolean)

				if (!elements.some(element => element.morph?.startsWith('A'))) {
					await Verse.create({
						bookName: name,
						bookOrder: order + 1,
						chapterNumber: chapterN + 1,
						verseNumber: verseN + 1,
						elements
					})
				}
			}
		}
	}
	await Lemma.create(...lemmas.map(l => ({ id: l })))
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
	await loadData()
	await mongoose.disconnect()
})