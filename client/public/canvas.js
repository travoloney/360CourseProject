
export function setupCanvas(canvas){
    const ctx = canvas.getContext("2d");

    // Dynamic canvas sizing — fits screen width on mobile
    function resizeCanvas() {
        const parent = canvas.parentElement;
        const maxWidth = Math.min(600, parent.clientWidth - 20);
        const ratio = 400 / 600;
        canvas.width = maxWidth;
        canvas.height = maxWidth * ratio;
        redraw();
    }

    let drawing = false;
    let strokes = [];
    let currentStroke = [];
    // Current drawing color — defaults to black
    let currentColor = "#000000";

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);

    // Touch events for mobile support
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchDraw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    function getTouchPos(e) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }

    function handleTouchStart(e) {
        e.preventDefault();
        drawing = true;
        currentStroke = [];
        const point = getTouchPos(e);
        currentStroke.push(point);
    }

    function handleTouchDraw(e) {
        e.preventDefault();
        if (!drawing) return;
        const point = getTouchPos(e);
        currentStroke.push(point);
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        // Use selected color for drawing
        ctx.strokeStyle = currentColor;
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
        // Use selected color for drawing
        ctx.strokeStyle = currentColor;
        const prev = currentStroke[currentStroke.length - 2];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }

    function stopDrawing() {
        if (!drawing) return;
        drawing = false;
        // Store color with each stroke so it renders correctly later
        strokes.push({ points: currentStroke, color: currentColor });
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    // Redraws all strokes with their original colors
    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokes.forEach(stroke => {
            const points = stroke.points || stroke;
            const color = stroke.color || "#000000";
            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const curr = points[i];
                ctx.lineWidth = 4;
                ctx.lineCap = "round";
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(curr.x, curr.y);
                ctx.stroke();
            }
        });
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return {
        getStrokes: () => strokes,
        clear: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            strokes = [];
        },
        // Allow setting the drawing color from outside
        setColor: (color) => { currentColor = color; }
    };
}