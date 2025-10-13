document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');
    const infoOverlay = document.getElementById('infoOverlay');

    // Controls
    const l1Slider = document.getElementById('l1Slider'); const l1Value = document.getElementById('l1Value');
    const l2Slider = document.getElementById('l2Slider'); const l2Value = document.getElementById('l2Value');
    const m1Slider = document.getElementById('m1Slider'); const m1Value = document.getElementById('m1Value');
    const m2Slider = document.getElementById('m2Slider'); const m2Value = document.getElementById('m2Value');
    const traceSwitch = document.getElementById('traceSwitch');
    const btnReset = document.getElementById('btnReset');

    canvas.width = 800;
    canvas.height = 600;
    const origin = { x: canvas.width / 2, y: 250 };
    
    let pendulum = {};
    let trace = [];
    let animationFrameId;
    let isDragging = false;

    function reset() {
        cancelAnimationFrame(animationFrameId);
        infoOverlay.style.opacity = '1';

        pendulum = {
            l1: Number(l1Slider.value),
            l2: Number(l2Slider.value),
            m1: Number(m1Slider.value),
            m2: Number(m2Slider.value),
            a1: Math.PI / 2, a2: Math.PI,
            v1: 0, v2: 0,
            g: 0.5
        };
        trace = [];
        
        l1Value.textContent = pendulum.l1;
        l2Value.textContent = pendulum.l2;
        m1Value.textContent = pendulum.m1;
        m2Value.textContent = pendulum.m2;
        
        draw();
    }
    
    function update() {
        const { l1, l2, m1, m2, a1, a2, v1, v2, g } = pendulum;

        // Equations of motion for the angular accelerations
        let num1 = -g * (2 * m1 + m2) * Math.sin(a1);
        let num2 = -m2 * g * Math.sin(a1 - 2 * a2);
        let num3 = -2 * Math.sin(a1 - a2) * m2;
        let num4 = v2 * v2 * l2 + v1 * v1 * l1 * Math.cos(a1 - a2);
        let den = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
        const accel1 = (num1 + num2 + num3 * num4) / den;

        num1 = 2 * Math.sin(a1 - a2);
        num2 = (v1 * v1 * l1 * (m1 + m2));
        num3 = g * (m1 + m2) * Math.cos(a1);
        num4 = v2 * v2 * l2 * m2 * Math.cos(a1 - a2);
        den = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2));
        const accel2 = (num1 * (num2 + num3 + num4)) / den;
        
        pendulum.v1 += accel1;
        pendulum.v2 += accel2;
        pendulum.a1 += pendulum.v1;
        pendulum.a2 += pendulum.v2;

        // Optional damping
        // pendulum.v1 *= 0.999;
        // pendulum.v2 *= 0.999;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Trace
        if (traceSwitch.checked && trace.length > 2) {
            ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(trace[0].x, trace[0].y);
            for (let i = 1; i < trace.length; i++) {
                ctx.lineTo(trace[i].x, trace[i].y);
            }
            ctx.stroke();
        }

        const { l1, l2, m1, m2, a1, a2 } = pendulum;
        const x1 = origin.x + l1 * Math.sin(a1);
        const y1 = origin.y + l1 * Math.cos(a1);
        const x2 = x1 + l2 * Math.sin(a2);
        const y2 = y1 + l2 * Math.cos(a2);

        // Draw Arms
        ctx.strokeStyle = '#a0a0c0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Draw Bobs
        ctx.fillStyle = '#9f7aea';
        ctx.beginPath();
        ctx.arc(x1, y1, m1 / 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#e94560';
        ctx.beginPath();
        ctx.arc(x2, y2, m2 / 2, 0, 2 * Math.PI);
        ctx.fill();

        if (traceSwitch.checked) {
            trace.push({ x: x2, y: y2 });
            if (trace.length > 500) trace.shift(); // Limit trace length
        }
    }

    function animate() {
        update();
        draw();
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // --- Mouse Dragging Interaction ---
    function getMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        cancelAnimationFrame(animationFrameId);
        infoOverlay.style.opacity = '0';
    });
    
    canvas.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            pendulum.v1 = 0; pendulum.v2 = 0; // Reset velocities
            trace = [];
            animate();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const mousePos = getMousePos(e);
            let dx = mousePos.x - origin.x;
            let dy = mousePos.y - origin.y;
            pendulum.a1 = Math.atan2(dx, dy);

            dx = mousePos.x - (origin.x + pendulum.l1 * Math.sin(pendulum.a1));
            dy = mousePos.y - (origin.y + pendulum.l1 * Math.cos(pendulum.a1));
            pendulum.a2 = Math.atan2(dx, dy);
            
            draw();
        }
    });
    
    // --- Control Panel Event Listeners ---
    [l1Slider, l2Slider, m1Slider, m2Slider].forEach(slider => slider.addEventListener('input', reset));
    btnReset.addEventListener('click', reset);
    
    // Initial Setup
    reset();
});