import { exec } from 'child_process';
import path from 'path';

export function recordAudio(durationInSeconds = 5) {
    return new Promise((resolve) => {
        const outputFile = path.join(process.cwd(), 'command.wav');
        console.log(`🎙️ Silakan bicara/dikte sekarang (merekam selama ${durationInSeconds} detik)...`);
        setTimeout(() => {
            console.log("⏹️ Perekaman selesai.");
            resolve(outputFile);
        }, durationInSeconds * 1000);
    });
}