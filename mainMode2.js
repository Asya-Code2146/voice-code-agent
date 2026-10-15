import readline from 'readline';
import { generateCodeFromPrompt } from './agentAutonomous.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== AI VOICE CODING AGENT (NODE.JS MODE 2) ===");
rl.question("Ketik perintah koding kamu: ", async (prompt) => {
    if (prompt.trim()) {
        await generateCodeFromPrompt(prompt);
    } else {
        console.log("Perintah tidak boleh kosong!");
    }
    rl.close();
});