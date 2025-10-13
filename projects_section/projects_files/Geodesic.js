document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');
    const infoOverlay = document.getElementById('infoOverlay');

    // Controls
    const massSlider = document.getElementById('massSlider');
    const massValue = document.getElementById('massValue');
    const velocityXSlider = document.getElementById('velocityXSlider');
    const velocityXValue = document.getElementById('velocityXValue');
    const velocityYSlider = document.getElementById('velocityYSlider');
    const velocityYValue = document.getElementById('velocityYValue');
    const flatPathSwitch = document.getElementById('flatPathSwitch');
    const btnLaunch = document.getElementById('btnLaunch');
    const btnReset = document.getElementById('btnReset');

    canvas.width = 800;
    canvas.height = 600;

    let params = {
        mass: 500,
        velX: 1.5,
        velY: 0.5,
        showFlatPath: false
    };

    let particle = null;
    let trajectory = [];
    let animationFrameId;

    // --- Physics and Rendering ---
    const gridSize = 20;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };

    function getWarp(x, y) {
        const dx = x - center.x;
        const dy = y - center.y;
        const distSq = dx * dx + dy * dy;
        return params.mass / (distSq + 10000); // Inverse square-like warp
    }

    function getGradient(x, y) {
        const epsilon = 1;
        const warp_x_plus = getWarp(x + epsilon, y);
        const warp_x_minus = getWarp(x - epsilon, y);
        const warp_y_plus = getWarp(x, y + epsilon);
        const warp_y_minus = getWarp(x, y - epsilon);

        const gradX = (warp_x_plus - warp_x_minus) / (2 * epsilon);
        const gradY = (warp_y_plus - warp_y_minus) / (2 * epsilon);
        return { x: gradX, y: gradY };
    }

    function drawGrid() {
        ctx.strokeStyle = 'rgba(65, 105, 225, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridSize; i++) {
            const pos = i / gridSize;
            // Vertical lines
            ctx.beginPath();
            for (let y = 0; y <= canvas.height; y++) {
                const warp = getWarp(pos * canvas.width, y);
                const perspective = 1 + warp * 5;
                const newX = center.x + (pos * canvas.width - center.x) / perspective;
                if (y === 0) ctx.moveTo(newX, y);
                else ctx.lineTo(newX, y);
            }
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x++) {
                const warp = getWarp(x, pos * canvas.height);
                const perspective = 1 + warp * 5;
                const newY = center.y + (pos * canvas.height - center.y) / perspective;
                if (x === 0) ctx.moveTo(x, newY);
                else ctx.lineTo(x, newY);
            }
            ctx.stroke();
        }
    }

    function drawCentralMass() {
        const radius = 10 + params.mass / 100;
        const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    function drawTrajectory() {
        if (trajectory.length < 2) return;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(trajectory[0].x, trajectory[0].y);
        for (let i = 1; i < trajectory.length; i++) {
            ctx.lineTo(trajectory[i].x, trajectory[i].y);
        }
        ctx.stroke();
    }
    
    function drawFlatPath() {
        if (!particle) return;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(particle.startX, particle.startY);
        ctx.lineTo(particle.startX + params.velX * 1000, particle.startY + params.velY * 1000);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function launchParticle() {
        particle = {
            x: 20,
            y: canvas.height / 3,
            vx: params.velX,
            vy: params.velY,
            startX: 20,
            startY: canvas.height / 3,
            radius: 4
        };
        trajectory = [{ x: particle.x, y: particle.y }];
        infoOverlay.style.opacity = '0';
        animate();
    }

    function reset() {
        cancelAnimationFrame(animationFrameId);
        particle = null;
        trajectory = [];
        infoOverlay.style.opacity = '1';
        draw();
    }

    function update() {
    if (!particle) return;

    // Define a small time step for consistent speed
    const dt = 0.1; 

    const forceFactor = 5000; // Adjusted for the new time step
    const gradient = getGradient(particle.x, particle.y);
    
    // Calculate acceleration
    const accX = -gradient.x * forceFactor;
    const accY = -gradient.y * forceFactor;

    // Update velocity using the time step
    particle.vx += accX * dt;
    particle.vy += accY * dt;

    // Update position using the time step
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    
    trajectory.push({x: particle.x, y: particle.y});

    if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
        particle = null; // Stop animation if particle is off-screen
    }
}

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawCentralMass();
        if (params.showFlatPath) drawFlatPath();
        drawTrajectory();
        if (particle) {
            ctx.fillStyle = '#E6F1FF';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function animate() {
        if (!particle) {
            btnLaunch.disabled = false;
            draw(); // Final draw to show full trajectory
            return;
        }
        update();
        draw();
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // --- Event Listeners ---
    massSlider.addEventListener('input', (e) => {
        params.mass = Number(e.target.value);
        massValue.textContent = params.mass;
        if(!particle) draw();
    });
    velocityXSlider.addEventListener('input', (e) => {
        params.velX = Number(e.target.value);
        velocityXValue.textContent = params.velX;
    });
    velocityYSlider.addEventListener('input', (e) => {
        params.velY = Number(e.target.value);
        velocityYValue.textContent = params.velY;
    });
    flatPathSwitch.addEventListener('change', (e) => {
        params.showFlatPath = e.target.checked;
        if(!particle) draw();
    });
    btnLaunch.addEventListener('click', () => {
        reset();
        launchParticle();
        btnLaunch.disabled = true;
    });
    btnReset.addEventListener('click', () => {
        reset();
        btnLaunch.disabled = false;
    });

    // Initial Draw
    draw();
});