
export function extractSoudData(canvas, frequencyData, maxFreq, audioCtx, analyser, barNumber){
    canvas.width= window.innerWidth - 100
    canvas.height = window.innerHeight - 100


    analyser.getByteFrequencyData(frequencyData);
    let currentBar = 0
    let n = Math.floor(maxFreq / (audioCtx.sampleRate / analyser.fftSize));
    let bars = [0]

    let step = Math.floor(n / barNumber)
    n -= n%step
    let binCounter = 0

    for(let i =0; i < n; i++){
        bars[currentBar] += frequencyData[i]
        binCounter ++
        if(binCounter == step){
            binCounter = 0

            bars[currentBar] /= step     

            currentBar ++;
            if(i != n -1){
                bars.push(0)
            }
        }
    }
    //console.log(bars)
    return bars

}

export function updateCanvas(canvas, ctx, bars){
    let cHeight = canvas.height
    let cWidth = canvas.width
    let barsN = bars.length;
    let separation = 2;
    if(window.innerWidth < 1000){
        separation = 1
    }
    let barWidth = (cWidth - separation * (barsN * 2 + 1)) / (barsN * 2)

    let maxAmplitude = 500
    ctx.clearRect( 0, 0, canvas.width, canvas.height);
    let x = separation

    for(let j = 0; j < 2; j++){
        for(let i = 0; i < bars.length; i++){
            let k = i
            if(j == 0){
                k = bars.length - i - 1
            }
            let w = barWidth
            let h = (bars[k] / maxAmplitude) * cHeight

            let y = cHeight - h

            ctx.fillRect(x, y, w, h)
            x += barWidth + separation

        }
    }
}
