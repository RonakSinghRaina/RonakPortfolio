document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');

    // Controls
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthValue = document.getElementById('lengthValue');
    const gravitySlider = document.getElementById('gravitySlider');
    const gravityValue = document.getElementById('gravityValue');
    const dampingSlider = document.getElementById('dampingSlider');
    const dampingValue = document.getElementById('dampingValue');
    const btnReset = document.getElementById('btnReset');

    canvas.width = 600;
    canvas.height = 500;

    let pendulum = {};

    function resetPendulum() {
        pendulum = {
            length: Number(lengthSlider.value),
            angle: Math.PI / 2, // Start at 90 degrees
            angularVelocity: 0,
            angularAcceleration: 0,
            gravity: Number(gravitySlider.value),
            damping: Number(dampingSlider.value),
            originX: canvas.width / 2,
            originY: 50
        };
        lengthValue.textContent = pendulum.length;
        gravityValue.textContent = pendulum.gravity;
        dampingValue.textContent = pendulum.damping;
    }

    function update() {
        // Calculate the angular acceleration using the pendulum equation
        pendulum.angularAcceleration = (-pendulum.gravity / pendulum.length) * Math.sin(pendulum.angle);

        // Update the angular velocity
        pendulum.angularVelocity += pendulum.angularAcceleration;

        // Apply damping (energy loss)
        pendulum.angularVelocity *= pendulum.damping;

        // Update the angle
        pendulum.angle += pendulum.angularVelocity;
    }

    function draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate the bob's position
        const bobX = pendulum.originX + pendulum.length * Math.sin(pendulum.angle);
        const bobY = pendulum.originY + pendulum.length * Math.cos(pendulum.angle);

        // Draw the rod
        ctx.beginPath();
        ctx.moveTo(pendulum.originX, pendulum.originY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = '#a0a0a0';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the pivot
        ctx.beginPath();
        ctx.arc(pendulum.originX, pendulum.originY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f0f0f0';
        ctx.fill();

        // Draw the bob
        ctx.beginPath();
        ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#00aaff';
        ctx.fill();
    }

    function animate() {
        update();
        draw();
        requestAnimationFrame(animate); // Loop the animation
    }

    // Event Listeners
    lengthSlider.addEventListener('input', (e) => {
        pendulum.length = Number(e.target.value);
        lengthValue.textContent = pendulum.length;
    });

    gravitySlider.addEventListener('input', (e) => {
        pendulum.gravity = Number(e.target.value);
        gravityValue.textContent = pendulum.gravity;
    });

    dampingSlider.addEventListener('input', (e) => {
        pendulum.damping = Number(e.target.value);
        dampingValue.textContent = pendulum.damping;
    });

    btnReset.addEventListener('click', resetPendulum);

    // Initial setup and start
    resetPendulum();
    animate();
});