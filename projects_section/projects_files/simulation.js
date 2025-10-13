document.addEventListener('DOMContentLoaded', function () {
    // Canvas and Context Setup
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');
    const chartCanvas = document.getElementById('detectorChart');
    const chartCtx = chartCanvas.getContext('2d');

    // DOM Elements
    const particleCountSpan = document.getElementById('particleCount');
    const particleRateSlider = document.getElementById('particleRate');
    const particleRateValue = document.getElementById('particleRateValue');
    const slitSeparationSlider = document.getElementById('slitSeparation');
    const slitSeparationValue = document.getElementById('slitSeparationValue');
    const slitWidthSlider = document.getElementById('slitWidth');
    const slitWidthValue = document.getElementById('slitWidthValue');
    const detectorSwitch = document.getElementById('detectorSwitch');

    // Buttons
    const btnWave = document.getElementById('btnWave');
    const btnParticle = document.getElementById('btnParticle');
    const btnSingleSlit = document.getElementById('btnSingleSlit');
    const btnDoubleSlit = document.getElementById('btnDoubleSlit');
    const btnRun = document.getElementById('btnRun');
    const btnReset = document.getElementById('btnReset');

    let animationFrameId;
    let simulationRunning = false;
    let waveTime = 0;
    
    // Simulation Parameters
    let params = {
        mode: 'wave',
        slits: 2,
        slitSeparation: 60,
        slitWidth: 10,
        detectorOn: false,
        particleRate: 10,
        wavelength: 10,
        slitPosition: 0.3
    };

    const canvasWidth = 800;
    const canvasHeight = 400;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const numBins = 200;
    let detectorBins = new Array(numBins).fill(0);
    let particleCount = 0;
    let lastChartUpdateTime = 0;

    const detectorChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: numBins }, (_, i) => i),
            datasets: [{
                label: 'Particle Intensity',
                data: detectorBins,
                backgroundColor: 'rgba(0, 212, 255, 0.6)',
                borderColor: 'rgba(0, 212, 255, 1)',
                borderWidth: 1,
                barPercentage: 1.0,
                categoryPercentage: 1.0,
            }]
        },
        options: {
            animation: false,
            scales: { x: { display: false }, y: { beginAtZero: true, ticks: { color: '#a0a0a0' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } } },
            plugins: { legend: { display: false } }
        }
    });

    // --- SIMULATION LOGIC ---

    function drawWave(time) {
        const imageData = ctx.createImageData(canvasWidth, canvasHeight);
        const data = imageData.data;
        const slitX = canvasWidth * params.slitPosition;
        
        let slitPoints = [];
        if (params.slits === 1) slitPoints.push({ y: canvasHeight / 2 });
        else if (params.slits === 2) {
            slitPoints.push({ y: canvasHeight / 2 - params.slitSeparation / 2 });
            slitPoints.push({ y: canvasHeight / 2 + params.slitSeparation / 2 });
        }

        for (let x = 0; x < canvasWidth; x++) {
            for (let y = 0; y < canvasHeight; y++) {
                const index = (y * canvasWidth + x) * 4;
                let amplitude = 0;

                if (x < slitX) { // Draw incoming wave
                    amplitude = Math.cos((x - time) / params.wavelength * 2 * Math.PI);
                } else { // Draw wave after slits
                    for (const slit of slitPoints) {
                        for(let w = -params.slitWidth / 2; w <= params.slitWidth / 2; w++) {
                             const dist = Math.sqrt((x - slitX) ** 2 + (y - (slit.y + w)) ** 2);
                             amplitude += Math.cos((dist - time) / params.wavelength * 2 * Math.PI);
                        }
                    }
                }
                
                const intensity = Math.pow(amplitude, 2);
                const brightness = intensity * 25; // **FIX: Increased brightness**
                data[index] = 0;
                data[index + 1] = brightness * 0.8;
                data[index + 2] = brightness;
                data[index + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        drawSlits();
    }
    
    function drawSlits() {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(canvasWidth * params.slitPosition - 5, 0, 10, canvasHeight);

        let slitPoints = [];
        if (params.slits === 1) slitPoints.push({ y: canvasHeight / 2 });
        else if (params.slits === 2) {
            slitPoints.push({ y: canvasHeight / 2 - params.slitSeparation / 2 });
            slitPoints.push({ y: canvasHeight / 2 + params.slitSeparation / 2 });
        }

        for (const slit of slitPoints) {
            ctx.clearRect(canvasWidth * params.slitPosition - 5, slit.y - params.slitWidth / 2, 10, params.slitWidth);
        }
        
        if (params.detectorOn && params.slits > 0) {
            ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
            for (const slit of slitPoints) {
                 ctx.beginPath();
                 ctx.arc(canvasWidth * params.slitPosition, slit.y, 10, 0, 2 * Math.PI);
                 ctx.fill();
            }
        }
    }
    
    function calculateProbabilityDistribution() {
        const distribution = new Array(canvasHeight).fill(0);
        let totalIntensity = 0;

        let slitPoints = [];
        if(params.slits === 2) {
            slitPoints.push({ y: canvasHeight / 2 - params.slitSeparation / 2 });
            slitPoints.push({ y: canvasHeight / 2 + params.slitSeparation / 2 });
        } else if (params.slits === 1) {
            slitPoints.push({ y: canvasHeight / 2 });
        }

        const screenX = canvasWidth * (1-params.slitPosition);
        const slitX = canvasWidth * params.slitPosition;

        if (params.slits > 0 && (params.detectorOn || params.slits === 1)) { // Particle behavior (no interference)
            for (let y = 0; y < canvasHeight; y++) {
                let intensity = 0;
                for(const slit of slitPoints) {
                    let amp = 0;
                    for(let w = -params.slitWidth / 2; w <= params.slitWidth / 2; w++) {
                        const dist = Math.sqrt(screenX ** 2 + (y - (slit.y + w)) ** 2);
                        amp += Math.cos(dist / params.wavelength * 2 * Math.PI);
                    }
                    intensity += Math.pow(amp, 2);
                }
                distribution[y] = intensity;
                totalIntensity += intensity;
            }
        } else if (params.slits > 0) { // Wave behavior (interference)
            for (let y = 0; y < canvasHeight; y++) {
                let totalPhasor = { re: 0, im: 0 };
                for (const slit of slitPoints) {
                    for(let w = -params.slitWidth / 2; w <= params.slitWidth / 2; w++) {
                        const dist = Math.sqrt(screenX ** 2 + (y - (slit.y + w)) ** 2);
                        const phase = dist / params.wavelength * 2 * Math.PI;
                        totalPhasor.re += Math.cos(phase);
                        totalPhasor.im += Math.sin(phase);
                    }
                }
                distribution[y] = totalPhasor.re ** 2 + totalPhasor.im ** 2;
                totalIntensity += distribution[y];
            }
        }
        
        if (totalIntensity === 0) return distribution;
        return distribution.map(d => d / totalIntensity);
    }
    
    function fireParticle() {
        const probDist = calculateProbabilityDistribution();
        const cdf = probDist.reduce((acc, val, i) => {
            acc.push((acc[i - 1] || 0) + val);
            return acc;
        }, []);

        const rand = Math.random();
        let landingY = cdf.findIndex(p => p >= rand);
        if (landingY === -1) landingY = canvasHeight - 1;

        // **FIX: Draw particle trail and hit**
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight / 2);
        const chosenSlitY = (params.slits === 1 || params.detectorOn) ? 
            (Math.random() < 0.5 ? canvasHeight / 2 - params.slitSeparation / 2 : canvasHeight / 2 + params.slitSeparation / 2) :
            canvasHeight/2; // Simplified for interference case
        ctx.lineTo(canvasWidth * params.slitPosition, chosenSlitY);
        ctx.lineTo(canvasWidth - 1, landingY);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.fillRect(canvasWidth - 5, landingY - 1, 5, 3);

        const binIndex = Math.floor(landingY / canvasHeight * numBins);
        if (binIndex >= 0 && binIndex < numBins) {
            detectorBins[binIndex]++;
            particleCount++;
        }
    }

    function updateChart() {
        detectorChart.data.datasets[0].data = detectorBins;
        detectorChart.update();
        particleCountSpan.textContent = particleCount;
    }

    function loop(timestamp) {
        if (!simulationRunning) return;

        if (params.mode === 'wave') {
            waveTime += 2;
            drawWave(waveTime);
        } else {
            // Firing multiple particles per frame for speed
            for(let i = 0; i < params.particleRate / 2; i++) {
                fireParticle();
            }
            if (timestamp - lastChartUpdateTime > 100) {
                updateChart();
                lastChartUpdateTime = timestamp;
            }
        }
        
        animationFrameId = requestAnimationFrame(loop);
    }

    function runSimulation() {
        if (simulationRunning) return;
        simulationRunning = true;
        btnRun.textContent = "Pause";
        lastChartUpdateTime = performance.now();
        if (params.mode === 'particle') {
            // In particle mode, clear screen before starting
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawSlits();
        }
        animationFrameId = requestAnimationFrame(loop);
    }

    function pauseSimulation() {
        if (!simulationRunning) return;
        simulationRunning = false;
        btnRun.textContent = "Run";
        cancelAnimationFrame(animationFrameId);
        if (params.mode === 'particle') updateChart();
    }
    
    function resetSimulation() {
        pauseSimulation();
        particleCount = 0;
        detectorBins.fill(0);
        waveTime = 0;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        if(params.mode === 'wave') {
             drawWave(0);
        } else {
            drawSlits();
        }
        updateChart();
    }
    
    // --- EVENT LISTENERS ---
    
    btnRun.addEventListener('click', () => { simulationRunning ? pauseSimulation() : runSimulation(); });
    btnReset.addEventListener('click', resetSimulation);
    btnWave.addEventListener('click', () => { if(params.mode === 'wave') return; params.mode = 'wave'; btnWave.classList.add('active'); btnParticle.classList.remove('active'); resetSimulation(); });
    btnParticle.addEventListener('click', () => { if(params.mode === 'particle') return; params.mode = 'particle'; btnParticle.classList.add('active'); btnWave.classList.remove('active'); resetSimulation(); });
    btnSingleSlit.addEventListener('click', () => { if(params.slits === 1) return; params.slits = 1; btnSingleSlit.classList.add('active'); btnDoubleSlit.classList.remove('active'); resetSimulation(); });
    btnDoubleSlit.addEventListener('click', () => { if(params.slits === 2) return; params.slits = 2; btnDoubleSlit.classList.add('active'); btnSingleSlit.classList.remove('active'); resetSimulation(); });
    particleRateSlider.addEventListener('input', (e) => { params.particleRate = Number(e.target.value); particleRateValue.textContent = params.particleRate; });
    slitSeparationSlider.addEventListener('input', (e) => { params.slitSeparation = Number(e.target.value); slitSeparationValue.textContent = params.slitSeparation; resetSimulation(); });
    slitWidthSlider.addEventListener('input', (e) => { params.slitWidth = Number(e.target.value); slitWidthValue.textContent = params.slitWidth; resetSimulation(); });
    detectorSwitch.addEventListener('change', (e) => { params.detectorOn = e.target.checked; resetSimulation(); });

    // Initial draw
    resetSimulation();
});