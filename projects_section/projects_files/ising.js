document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('isingCanvas');
    const ctx = canvas.getContext('2d');

    // Controls
    const tempSlider = document.getElementById('tempSlider');
    const tempValue = document.getElementById('tempValue');
    const fieldSlider = document.getElementById('fieldSlider');
    const fieldValue = document.getElementById('fieldValue');
    const btnRun = document.getElementById('btnRun');
    const btnReset = document.getElementById('btnReset');

    // Data Displays
    const magnetizationValue = document.getElementById('magnetizationValue');
    const energyValue = document.getElementById('energyValue');

    const L = 200; // Lattice size (L x L)
    canvas.width = L;
    canvas.height = L;

    let spin = [];
    let T = 2.27; // Temperature
    let H = 0.0;  // External magnetic field
    const J = 1;  // Interaction strength

    let simulationRunning = false;
    let animationFrameId;

    function init() {
        spin = [];
        for (let i = 0; i < L; i++) {
            spin[i] = [];
            for (let j = 0; j < L; j++) {
                spin[i][j] = Math.random() < 0.5 ? 1 : -1;
            }
        }
        updateDataDisplays();
    }

    function metropolisStep() {
        for (let i = 0; i < L * L; i++) { // One Monte Carlo step per frame
            const x = Math.floor(Math.random() * L);
            const y = Math.floor(Math.random() * L);

            const s = spin[x][y];
            const nn = spin[(x + 1) % L][y] + spin[x][(y + 1) % L] + spin[(x - 1 + L) % L][y] + spin[x][(y - 1 + L) % L];
            
            const dE = 2 * s * (J * nn + H);

            if (dE < 0 || Math.random() < Math.exp(-dE / T)) {
                spin[x][y] *= -1;
            }
        }
    }

    function calculateObservables() {
        let M = 0, E = 0;
        for (let i = 0; i < L; i++) {
            for (let j = 0; j < L; j++) {
                M += spin[i][j];
                const nn = spin[(i + 1) % L][j] + spin[i][(j + 1) % L];
                E += -J * spin[i][j] * nn - H * spin[i][j];
            }
        }
        return {
            magnetization: M / (L * L),
            energy: E / (L * L)
        };
    }
    
    let lastUpdateTime = 0;
    function updateDataDisplays() {
       const now = performance.now();
       if (now - lastUpdateTime < 250) return; // Update only 4 times per second
       lastUpdateTime = now;

       const { magnetization, energy } = calculateObservables();
       magnetizationValue.textContent = magnetization.toFixed(2);
       energyValue.textContent = energy.toFixed(2);
    }
    
    function draw() {
        const imageData = ctx.createImageData(L, L);
        for (let i = 0; i < L; i++) {
            for (let j = 0; j < L; j++) {
                const index = (j * L + i) * 4;
                const color = spin[i][j] === 1 ? 255 : 0;
                imageData.data[index] = color;
                imageData.data[index + 1] = color;
                imageData.data[index + 2] = color;
                imageData.data[index + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function animate() {
        if (!simulationRunning) return;
        metropolisStep();
        draw();
        updateDataDisplays();
        animationFrameId = requestAnimationFrame(animate);
    }

    function startSimulation() {
        if (simulationRunning) return;
        simulationRunning = true;
        btnRun.textContent = 'Pause';
        btnRun.classList.add('running');
        animate();
    }
    
    function pauseSimulation() {
        if (!simulationRunning) return;
        simulationRunning = false;
        btnRun.textContent = 'Run';
        btnRun.classList.remove('running');
        cancelAnimationFrame(animationFrameId);
    }

    // --- Event Listeners ---
    tempSlider.addEventListener('input', (e) => {
        T = parseFloat(e.target.value);
        tempValue.textContent = T.toFixed(2);
        
        // Dynamic color for temperature slider thumb
        const tempRatio = (T - 0.1) / (5.0 - 0.1);
        const red = 255 * tempRatio;
        const blue = 255 * (1 - tempRatio);
        e.target.style.setProperty('--thumb-color', `rgb(${red}, 100, ${blue})`);
        tempSlider.querySelector('::-webkit-slider-thumb').style.background = `rgb(${red}, 100, ${blue})`;
    });

    fieldSlider.addEventListener('input', (e) => {
        H = parseFloat(e.target.value);
        fieldValue.textContent = H.toFixed(2);
    });

    btnRun.addEventListener('click', () => {
        simulationRunning ? pauseSimulation() : startSimulation();
    });

    btnReset.addEventListener('click', () => {
        pauseSimulation();
        init();
        draw();
    });

    // Initial setup
    init();
    draw();
});