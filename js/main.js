import { extractSoudData, updateCanvas } from "./logic.js";

const canvas = document.getElementById("barCanvas")
const ctx = canvas.getContext('2d')

const xMargin = 50
const yMargin = 80
canvas.width= window.innerWidth - xMargin
canvas.height = window.innerHeight - yMargin

const startButton = document.getElementById("startButton")
startButton.addEventListener('click', ()=>{
    startMic(canvas, ctx)
});


export async function startMic(canvas, ctx) {
  let barNumber = 24
  const minFreq = 50
  const maxFreq = 8000;
  const maxAmplitude = 300

  const logFactor = 0.5
  const barAcceleration = 0.25
  let barSeparation = 2;

  //color
  const startHue = 100
  const endHue = 300
  const startIntensity= 5
  const shininess = 50

  let amplitudes =[]; //theorical values
  let bars = new Array(barNumber).fill(0);; // graphical values

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  source.connect(analyser);
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);

  function update() {

    amplitudes = extractSoudData(canvas, xMargin, yMargin, frequencyData, minFreq, maxFreq, logFactor,
    audioCtx, analyser, barNumber)

    updateCanvas(canvas, ctx, amplitudes, maxAmplitude, barSeparation, bars, barAcceleration,
    startHue, endHue, startIntensity, shininess)

    requestAnimationFrame(update);
  }
  update();
}




