import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateCodeFromPrompt(userPrompt) {
    try {
        console.log("🤖 AI sedang berpikir menggunakan Groq (JavaScript)...");

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Kamu adalah AI Coding Assistant. Berikan HANYA kode pemrograman murni berdasarkan permintaan user, tanpa basa-basi teks penjelasan. Jika perlu membuat file, berikan format nama file dan kodenya dengan jelas."
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "";
        
        const outputDir = path.join(process.cwd(), 'output_project');
        if (!fs.existsSync(outputDir)){
            fs.mkdirSync(outputDir);
        }

        const filePath = path.join(outputDir, 'generated_code.txt');
        fs.writeFileSync(filePath, aiResponse, 'utf-8');

        console.log(`✅ Berhasil! File tersimpan di: ${filePath}`);

    } catch (error) {
        console.error("❌ Terjadi kesalahan saat memanggil Groq API:", error.message);
    }
}