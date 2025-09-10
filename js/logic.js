

export function extractSoudData(canvas, frequencyData, minHz, maxHz,logFactor, audioCtx, analyser,
    barNumber){
    canvas.width= window.innerWidth - 50
    canvas.height = window.innerHeight - 80

    analyser.getByteFrequencyData(frequencyData);

    let amplitudes = []
    const hzPerBin = audioCtx.sampleRate / analyser.fftSize;

    for (let i = 0; i < barNumber; i++) {
        const barProp = (i / barNumber);
        const nextBarProp = ((i + 1) / barNumber); //proportions of the current bar based on total amplitudes

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

        //average Amplitude for each amplitudes
        let sum = 0;
        for (let j = i1; j <= i2; j++) {
            sum += frequencyData[j];
        }
        //another logarithm to highlight high Hz
        sum /= (i2 -i1) - (0.025 * Math.pow(1000, i / barNumber))

        amplitudes.push(sum);
    }

    return amplitudes
}


export function updateCanvas(canvas, ctx, amplitudes, maxAmplitude, bars, barAcceleration){
    let cHeight = canvas.height
    let cWidth = canvas.width
    let amplitudesN = amplitudes.length;
    let separation = 2;
    if(window.innerWidth < 1000){
        separation = 1
    }
    let barWidth = (cWidth - separation * (amplitudesN * 2 + 1)) / (amplitudesN * 2)

    ctx.clearRect( 0, 0, canvas.width, canvas.height);
    let x = separation

    bars = updateBars(amplitudes, bars, barAcceleration)
    for(let j = 0; j < 2; j++){
        for(let i = 0; i < bars.length; i++){
            let k = i
            if(j == 0){
                k = bars.length - i - 1
            }
            let w = barWidth
            let h = (bars[k] / maxAmplitude) * cHeight

            let y = cHeight - h
            ctx.fillStyle = rainbowColors(bars[k] / maxAmplitude, k / bars.length, 100, 300, 5, 50)
            ctx.fillRect(x, y, w, h)
            x += barWidth + separation

        }
    }
}
function updateBars(amplitudes, bars, acceleration){
    for(let i = 0; i < amplitudes.length; i++){
        bars[i] += (amplitudes[i] - bars[i]) * acceleration
    }
    return bars
}
function rainbowColors(heightProportion, positionProportion, startH, endH, startIntensity, shininess){
    //get the color of a bar ased on its height and position
    const hue = (startH - positionProportion * (startH - endH)) % 360;
    return `hsl(${hue}, ${shininess}%, ${heightProportion * (50- startIntensity) + startIntensity}%`
}
