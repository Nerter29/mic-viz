

export function extractSoudData(canvas, xMargin, yMargin, frequencyData, minHz, maxHz,logFactor, audioCtx, analyser,
    barNumber){
    /*extract the data of the sound to make the amplitude of every sections of frequences by following logarithmic
    and linear evolution*/

    canvas.width= window.innerWidth - xMargin
    canvas.height = window.innerHeight - yMargin

    analyser.getByteFrequencyData(frequencyData);

    let amplitudes = []
    const hzPerBin = audioCtx.sampleRate / analyser.fftSize;

    for (let i = 0; i < barNumber; i++) {
        const barProp = (i / barNumber);
        const nextBarProp = ((i + 1) / barNumber); //proportions of the current section based on total amplitudes

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

        //average amplitude for each section
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


export function updateCanvas(canvas, ctx, amplitudes, amplitudeOffset, maxAmplitude, barSeparation, bars, barAcceleration, startHue, endHue, startIntensity, shininess){
    /*take the amplitudes list and display the corresponding bars and adding a little acceleration process
    to smooth the bar movement*/
    ctx.clearRect( 0, 0, canvas.width, canvas.height);

    let cHeight = canvas.height
    let cWidth = canvas.width
    let sectionNumber = amplitudes.length;
    

    if(window.innerWidth < 1000){barSeparation /= 2}
    let barWidth = (cWidth - barSeparation * (sectionNumber * 2 + 1)) / (sectionNumber * 2)

    bars = updateBars(amplitudes, bars, barAcceleration)

    for(let j = 0; j < 2; j++){
        for(let i = 0; i < bars.length; i++){
            
            //display the bars first in reverse, then normally so it matchs the patern : high low low high
            let k = i
            if(j == 0){k = bars.length - i - 1}

            //calculate the position and size of every bras
            let w = barWidth
            let h = (bars[k] / maxAmplitude) * cHeight - amplitudeOffset + 5 // 5 is the min length for a bar
            let x = (barWidth + barSeparation) * (i + j * bars.length)
            let y = cHeight - h

            //display the bars and applying some cool colors
            ctx.fillStyle = rainbowColors(bars[k] / maxAmplitude, k / bars.length, startHue, endHue,
            startIntensity, shininess)
            ctx.fillRect(x, y, w, h)
        }
    }
}
function updateBars(amplitudes, bars, acceleration){
    //create the bars list from the amplitude one by adding bars a little of acceleration principle so it is smooth
    for(let i = 0; i < amplitudes.length; i++){
        bars[i] += (amplitudes[i] - bars[i]) * acceleration
    }
    return bars
}
function rainbowColors(heightProportion, positionProportion, startHue, endHue, startIntensity, shininess){
    //get the color of a bar based on its height and position
    const hue = (startHue - positionProportion * (startHue - endHue)) % 360;
    return `hsl(${hue}, ${shininess}%, ${heightProportion * (50 - startIntensity) + startIntensity}%`
}
