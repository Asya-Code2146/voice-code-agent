import fs from 'fs';
import path from 'path';
import readline from 'readline';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function selectWorkspace() {
    return new Promise((resolve) => {
        console.log("\n📁 === PILIH WORKSPACE / FOLDER TARGET ===");
        console.log("Contoh: output_project atau E:\\LKS AI\\project-kamu");
        
        rl.question("Masukkan nama atau path folder target: ", (inputPath) => {
            let targetDir;
            
            if (inputPath.includes(':')) {
                targetDir = inputPath.trim();
            } else {
                targetDir = path.join(process.cwd(), inputPath.trim());
            }
            
            if (!fs.existsSync(targetDir)) {
                console.log(`⚠️ Folder tidak ditemukan. Membuat folder baru di: ${targetDir}`);
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            console.log(`✅ Berhasil memberikan izin akses ke folder: ${targetDir}`);
            resolve(targetDir);
        });
    });
}

async function runWorkspaceAgent() {
    const targetFolder = await selectWorkspace();

    rl.question("\nApa yang ingin kamu perintahkan pada AI untuk folder ini?: ", async (prompt) => {
        if (!prompt.trim()) {
            console.log("Perintah dibatalkan.");
            rl.close();
            return;
        }

        try {
            console.log("🤖 AI sedang memproses kode untuk foldermu...");
            
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Kamu adalah AI Coding Assistant yang berpengalaman. Berikan HANYA kode program murni (misal: struktur HTML lengkap dengan CSS & JS di dalamnya jika diminta web). JANGAN sertakan teks pembuka, penutup, ataupun format JSON. Langsung tulis kodenya."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama-3.3-70b-versatile",
            });

            let aiResponse = chatCompletion.choices[0]?.message?.content || "";
            
            aiResponse = aiResponse.replace(/```html/g, '').replace(/```javascript/g, '').replace(/```css/g, '').replace(/```/g, '').trim();

            let fileName = 'index.html';
            const lowerPrompt = prompt.toLowerCase();
            if (lowerPrompt.includes('js') || lowerPrompt.includes('javascript') && !lowerPrompt.includes('html')) {
                fileName = 'app.js';
            } else if (lowerPrompt.includes('py') || lowerPrompt.includes('python')) {
                fileName = 'main.py';
            }

            const filePath = path.join(targetFolder, fileName);
            fs.writeFileSync(filePath, aiResponse, 'utf-8');

            console.log(`🎉 Sukses! File berhasil dibuat: ${fileName} di ${filePath}`);

        } catch (error) {
            console.error("❌ Terjadi kesalahan:", error.message);
        }

        rl.close();
    });
}

runWorkspaceAgent();