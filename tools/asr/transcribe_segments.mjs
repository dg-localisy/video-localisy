import { pipeline, env } from '@huggingface/transformers';
import wavefile from 'wavefile';
import fs from 'node:fs';
const { WaveFile } = wavefile;
env.allowRemoteModels = false;
env.localModelPath = '/home/user/video-localisy/tools/asr/node_modules/sts-whisper-small/models';
const wav = new WaveFile(fs.readFileSync('/home/user/video-localisy/work/audio_16k_mono.wav'));
wav.toBitDepth('32f'); wav.toSampleRate(16000);
let s = wav.getSamples(); if (Array.isArray(s)) s = s[0];
const audio = Float32Array.from(s);
const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', { dtype: 'q8', device: 'cpu' });
const segs = [[7.4, 13.3], [20.0, 26.3], [25.4, 31.4], [31.3, 39.85], [0, 8.4]];
for (const [a, b] of segs) {
  const sub = audio.slice(Math.floor(a * 16000), Math.floor(b * 16000));
  for (const beams of [1, 4]) {
    try {
      const out = await transcriber(sub, { language: 'french', task: 'transcribe', return_timestamps: false, num_beams: beams, chunk_length_s: 30 });
      console.log(`[${a}-${b}] beams=${beams}:`, out.text.trim());
    } catch (e) { console.log(`[${a}-${b}] beams=${beams}: ERROR`, e.message.slice(0, 120)); }
  }
}
