import fs from 'fs';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function transcribeAudio(filePath) {
    try {
        console.log("🎙️ Mengirim audio ke Groq Whisper...");
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-large-v3",
            language: "id", 
            response_format: "json",
        });

        console.log(`📝 Hasil Dikte: "${transcription.text}"`);
        return transcription.text;
    } catch (error) {
        console.error("❌ Gagal transkripsi audio:", error.message);
        return "";
    }
}