import { extractSoudData, updateCanvas } from "./logic.js";

const canvas = document.getElementById("barCanvas")
const ctx = canvas.getContext('2d')

canvas.width= window.innerWidth - 150
canvas.height = window.innerHeight - 150

const startButton = document.getElementById("startButton")
startButton.addEventListener('click', ()=>{
    startMic(canvas, ctx)
});


export async function startMic(canvas, ctx) {
  let barNumber = 24
  const minFreq = 50
  const maxFreq = 10000;
  const logFactor = 0.4
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  source.connect(analyser);
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  function update() {

    let bars = extractSoudData(canvas, frequencyData, minFreq, maxFreq, logFactor, audioCtx, analyser, barNumber)
    updateCanvas(canvas, ctx, bars)
    requestAnimationFrame(update);
  }

  update();
}




