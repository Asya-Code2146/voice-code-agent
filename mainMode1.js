import readline from 'readline';
import { transcribeAudio } from './sttService.js';
import { generateCodeFromPrompt } from './agentAutonomous.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== AI VOICE CODING AGENT (NODE.JS MODE 1: LIVE DICTATION) ===");
console.log("Tekan [Enter] untuk mulai dikte, atau ketik 'q' lalu [Enter] untuk keluar.\n");

function startSession(sessionCount) {
    rl.question(`[Sesi Dikte #${sessionCount}] Tekan [Enter] untuk bicara (atau 'q' untuk keluar): `, async (input) => {
        if (input.trim().toLowerCase() === 'q') {
            console.log("👋 Keluar dari Mode Dikte. Terima kasih!");
            rl.close();
            return;
        }

        console.log("🎙️ Memulai perekaman suara...");
        rl.question("Ketik hasil dikte suara kamu (sementara untuk uji coba): ", async (dictatedText) => {
            if (dictatedText.trim()) {
                await generateCodeFromPrompt(dictatedText);
            }
            startSession(sessionCount + 1);
        });
    });
}

startSession(1);