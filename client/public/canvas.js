
export function setupCanvas(canvas){
    const ctx = canvas.getContext("2d");

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
    let strokes = []; // A way to store drawings
    //let testStrokes = []; // For testing, remove later
    let currentStroke = [];

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
        currentStroke = [];
        const point = getTouchPos(e);
        currentStroke.push(point);
    }

    // [Lucky] Touch move handler — draws on canvas via touch
    function handleTouchDraw(e) {
        e.preventDefault();
        if (!drawing) return;

        const point = getTouchPos(e);
        currentStroke.push(point);

        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";

        const prev = currentStroke[currentStroke.length - 2];

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }

    function startDrawing(e) {
        drawing = true;
        currentStroke = [];

        const point = getMousePos(e);
        currentStroke.push(point);
    }

    function draw(e) {
        if (!drawing) return;

        const point = getMousePos(e);
        currentStroke.push(point);

        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";

        const prev = currentStroke[currentStroke.length - 2];

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
            for (let i = 1; i < stroke.length; i++) {
                const prev = stroke[i - 1];
                const curr = stroke[i];
                ctx.lineWidth = 4;
                ctx.lineCap = "round";
                ctx.strokeStyle = "black";
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

    return {
    getStrokes: () => strokes,
    clear: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokes = [];
    }
    };
}