export function setupCanvas(canvas){
    const ctx = canvas.getContext("2d");

    let currentColor = "black";

    // [Lucky] Dynamic canvas sizing — fits screen width on mobile
    function resizeCanvas() {
        const parent = canvas.parentElement;
        const maxWidth = Math.min(600, parent.clientWidth - 20);
        const ratio = 400 / 600;
        canvas.width = maxWidth;
        canvas.height = maxWidth * ratio;
        redraw(); // [Lucky] Redraw strokes after resize so drawings aren't lost
    }

    let drawing = false;
    let strokes = [];  // A way to store drawings
    //let testStrokes = []; // For testing, remove later
    let currentStroke = {
        color: currentColor,
        points: []
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);

    // [Lucky] Touch events for mobile support
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchDraw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    // [Lucky] Converts touch event to mouse-like position
    function getTouchPos(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    // [Lucky] Touch start handler — prevents scrolling while drawing
    function handleTouchStart(e) {
        e.preventDefault();
        drawing = true;
        currentStroke = {
            color: currentColor,
            points: []
        };
        const point = getTouchPos(e);
        currentStroke.points.push(point);
    }

    // [Lucky] Touch move handler — draws on canvas via touch
    function handleTouchDraw(e) {
        e.preventDefault();
        if (!drawing) return;

        const point = getTouchPos(e);
        currentStroke.points.push(point);

        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.strokeStyle = currentStroke.color;

        const prev = currentStroke.points[currentStroke.points.length - 2];

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }

    function startDrawing(e) {
        drawing = true;
        currentStroke = {
            color: currentColor,
            points: []
        };
        const point = getMousePos(e);
        currentStroke.points.push(point);
    }

    function draw(e) {
        if (!drawing) return;

        const point = getMousePos(e);
        currentStroke.points.push(point);

        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.strokeStyle = currentStroke.color;

        const prev = currentStroke.points[currentStroke.points.length - 2];

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }

    function stopDrawing() {
        if (!drawing) return;

        drawing = false;
        strokes.push(currentStroke);
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // [Lucky] Redraws all strokes — used after canvas resize
    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokes.forEach(stroke => {
            ctx.strokeStyle = stroke.color;
            for (let i = 1; i < stroke.points.length; i++) {
                const prev = stroke.points[i - 1];
                const curr = stroke.points[i];
                ctx.lineWidth = 4;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(curr.x, curr.y);
                ctx.stroke();
            }
        });
    }

    // [Lucky] Initial size + listen for window resize
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // [Trav] Onclick for color buttons
    const colorButtons = document.querySelectorAll(".color_button");

    colorButtons.forEach(btn =>{
        btn.style.backgroundColor = btn.dataset.color;

        btn.onclick = () => {
            currentColor = btn.dataset.color;
        };
    });

    const colorPicker = document.getElementById("colorPicker");

    colorPicker.addEventListener("input", () => {
        currentColor = colorPicker.value;
    });

    return {
    getStrokes: () => strokes,
    clear: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokes = [];
    }
    };
}