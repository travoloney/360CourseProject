
export function setupCanvas(canvas){
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 400;

    let drawing = false;
    let strokes = []; // A way to store drawings
    //let testStrokes = []; // For testing, remove later
    let currentStroke = [];

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);

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

    return {
    getStrokes: () => strokes,
    clear: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokes = [];
    }
    };
}