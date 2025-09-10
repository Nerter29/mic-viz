import { extractSoudData, updateCanvas } from "./logic.js";

const canvas = document.getElementById("barCanvas")
const ctx = canvas.getContext('2d')

canvas.width= window.innerWidth - 50
canvas.height = window.innerHeight - 80

const startButton = document.getElementById("startButton")
startButton.addEventListener('click', ()=>{
    startMic(canvas, ctx)
});


export async function startMic(canvas, ctx) {
  let barNumber = 24
  const minFreq = 50
  const maxFreq = 8000;
  const logFactor = 0.5
  const barAcceleration = 0.4
  const maxAmplitude = 300

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  let amplitudes =[]; //theorical values
  let bars = new Array(barNumber).fill(0);; // graphical values
  source.connect(analyser);
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  function update() {

    amplitudes = extractSoudData(canvas, frequencyData, minFreq, maxFreq, logFactor, audioCtx, analyser, barNumber)
    updateCanvas(canvas, ctx, amplitudes, maxAmplitude, bars, barAcceleration)
    requestAnimationFrame(update);
  }

  update();
}




