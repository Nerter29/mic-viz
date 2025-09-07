

export function extractSoudData(canvas, frequencyData, minHz, maxHz,logFactor, audioCtx, analyser, barNumber){
    canvas.width= window.innerWidth - 150
    canvas.height = window.innerHeight - 150

    analyser.getByteFrequencyData(frequencyData);

    let bars = []
    const hzPerBin = audioCtx.sampleRate / analyser.fftSize;
    for (let i = 0; i < barNumber; i++) {
        const barProp = (i / barNumber);
        const nextBarProp = ((i + 1) / barNumber); //proportions of the current bar based on total bars

        //logarithmic and linear bin repartition.
        const f1Log = minHz * Math.pow(maxHz / minHz, barProp);
        const f2Log = minHz * Math.pow(maxHz / minHz, nextBarProp);
        const f1Lin = minHz + (maxHz - minHz) * barProp;
        const f2Lin = minHz + (maxHz - minHz) * nextBarProp;
        const f1 = f1Lin * (1 - logFactor) + f1Log * logFactor;
        const f2 = f2Lin * (1 - logFactor) + f2Log * logFactor;

        //fft format
        let i1 = Math.floor(f1 / hzPerBin);
        let i2 = Math.floor(f2 / hzPerBin);

        //to ensure that the frequences are not out of bounds
        if (i1 < 0) i1 = 0;
        if (i2 >= frequencyData.length) i2 = frequencyData.length - 1;

        //average Amplitude for each bars
        let sum = 0;
        for (let j = i1; j <= i2; j++) {
            sum += frequencyData[j];
        }
        sum /= i2 - i1
        
        bars.push(sum);
    }

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

    let maxAmplitude = 250
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
            ctx.fillStyle = rainbowColors(bars[k] /maxAmplitude, k/ bars.length, 100, 250, 10, 50)
            ctx.fillRect(x, y, w, h)
            x += barWidth + separation

        }
    }
}
function rainbowColors(heightProportion, positionProportion, startH, endH, startIntensity, shininess){
    //get the color of a bar ased on its height and position
    const hue = (startH - positionProportion * (startH - endH)) % 360;
    return `hsl(${hue}, ${shininess}%, ${heightProportion * (50- startIntensity) + startIntensity}%`
}
