import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { ApiError } from './api';
import { WORD_TYPES } from '@/lib/constants';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let client: GoogleGenerativeAI | null = null;
function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ApiError(503, 'Yapay zekâ servisi yapılandırılmamış.', 'AI_NOT_CONFIGURED');
  client ??= new GoogleGenerativeAI(key);
  return client.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
  });
}

/** Keeps user text from breaking out of the prompt's quoted section. */
function clean(input: string, max: number) {
  return input.replace(/["`\\]/g, "'").replace(/\s+/g, ' ').trim().slice(0, max);
}

async function generateJson<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
  let text: string;
  try {
    const result = await getModel().generateContent(prompt);
    text = result.response.text();
  } catch (error) {
    console.error('[ai] request failed', error);
    throw new ApiError(502, 'Yapay zekâ şu an yanıt vermiyor. Biraz sonra tekrar dene.', 'AI_UNAVAILABLE');
  }
  try {
    const raw = JSON.parse(text.replace(/^```(?:json)?|```$/g, '').trim());
    return schema.parse(raw);
  } catch (error) {
    console.error('[ai] unexpected response', text, error);
    throw new ApiError(502, 'Yapay zekâ beklenmedik bir yanıt verdi. Tekrar dener misin?', 'AI_BAD_RESPONSE');
  }
}

const typeSchema = z
  .string()
  .transform((t) => t.toLowerCase().trim())
  .transform((t) => ((WORD_TYPES as readonly string[]).includes(t) ? t : 'noun'));

const detailsSchema = z.object({
  turkishTranslation: z.string().min(1).max(120),
  definitionTr: z.string().max(400).default(''),
  exampleSentence: z.string().max(300).default(''),
  exampleSentenceTr: z.string().max(300).default(''),
  type: typeSchema,
  pronunciation: z.string().max(80).optional().default(''),
});

export type WordDetails = z.infer<typeof detailsSchema>;

export async function generateWordDetails(word: string): Promise<WordDetails> {
  const w = clean(word, 60);
  return generateJson(
    `You help Turkish speakers learn English vocabulary.
For the English word or phrase "${w}", return a JSON object with exactly these keys:
- "turkishTranslation": the most common Turkish meaning(s), 1–4 words, comma separated if more than one
- "definitionTr": a short, clear Turkish definition (one sentence)
- "exampleSentence": one natural, everyday English sentence that contains "${w}" exactly as written
- "exampleSentenceTr": a natural Turkish translation of that sentence
- "type": one of noun, verb, adjective, adverb, phrase, preposition, conjunction, pronoun
- "pronunciation": IPA between slashes, e.g. /rɪˈzɪliənt/
If the input is not English, translate it to the closest English word first and describe that word.`,
    detailsSchema,
  );
}

const extractedSchema = z
  .array(
    z.object({
      word: z.string().min(1).max(60),
      turkishTranslation: z.string().min(1).max(120),
      exampleSentence: z.string().max(300).optional().default(''),
    }),
  )
  .max(100);

export async function extractWordPairs(text: string) {
  const input = clean(text, 4000);
  return generateJson(
    `Extract English vocabulary items and their Turkish meanings from the text between <text> tags.
The text may be a messy copy-paste of a word list, notes, or an English paragraph.
- If Turkish meanings are present, use them. If not, provide the most common Turkish meaning.
- Skip very basic words (the, a, is, and...), duplicates and proper names.
- Include an example sentence only if the text contains one for that word.
Return a JSON array (max 50 items) of objects: {"word", "turkishTranslation", "exampleSentence"}.
<text>${input}</text>`,
    extractedSchema,
  );
}

const storySchema = z.object({
  title: z.string().max(120),
  story: z.string().min(20).max(2500),
  storyTr: z.string().max(3000),
});

export async function generateStory(words: string[], level: string) {
  const list = words.map((w) => clean(w, 40)).join(', ');
  return generateJson(
    `Write a short, engaging story in English for a ${clean(level, 2)} (CEFR) learner whose native language is Turkish.
Use ALL of these words naturally: ${list}.
- 120–180 words, simple sentences suited to the level, a light and positive tone.
- Wrap every occurrence of a target word in double asterisks, e.g. **journey**.
Return JSON: {"title": "short English title", "story": "...", "storyTr": "faithful Turkish translation without asterisks"}`,
    storySchema,
  );
}
