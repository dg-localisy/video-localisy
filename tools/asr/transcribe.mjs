import { pipeline, env } from '@huggingface/transformers';
import wavefile from 'wavefile';
const { WaveFile } = wavefile;
import fs from 'node:fs';

env.allowRemoteModels = false;
env.localModelPath = '/home/user/video-localisy/tools/asr/node_modules/sts-whisper-small/models';

const wavPath = process.argv[2];
const outPath = process.argv[3];
const wav = new WaveFile(fs.readFileSync(wavPath));
wav.toBitDepth('32f');
wav.toSampleRate(16000);
let samples = wav.getSamples();
if (Array.isArray(samples)) {
  if (samples.length > 1) {
    const mono = new Float32Array(samples[0].length);
    for (let i = 0; i < mono.length; i++) mono[i] = (samples[0][i] + samples[1][i]) / 2;
    samples = mono;
  } else samples = samples[0];
}
const audio = Float32Array.from(samples);
console.log('audio samples', audio.length, 'duration', (audio.length / 16000).toFixed(2));

const t0 = Date.now();
const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', { dtype: 'q8', device: 'cpu' });
console.log('model loaded in', ((Date.now() - t0) / 1000).toFixed(1), 's');

const t1 = Date.now();
const out = await transcriber(audio, {
  language: 'french',
  task: 'transcribe',
  return_timestamps: 'word',
  chunk_length_s: 30,
  stride_length_s: 5,
});
console.log('transcribed in', ((Date.now() - t1) / 1000).toFixed(1), 's');
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log('TEXT:', out.text);
console.log('words:', out.chunks.length);
for (const c of out.chunks) console.log(c.timestamp[0], c.timestamp[1], JSON.stringify(c.text));
