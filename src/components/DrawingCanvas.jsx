import { useEffect, useRef, useState } from "react";

const DrawingCanvas = ({ socket, remotePeerRef }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(2);

  const startDrawing = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    const x=e.nativeEvent.offsetX;
    const y=e.nativeEvent.offsetY;
    setDrawing(true);
    socket.emit("start-drawing",{
      to:remotePeerRef.current,
      draw:{
         x,y
      }
    })
  };

  const draw = (e) => {
    if (!drawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
    socket.emit("draw-data", {
      to: remotePeerRef.current,
      draw: {
        x, y,
        color,
        lineWidth
      }
    });
  };

  const stopDrawing = () => {
    setDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear-canvas",{to:remotePeerRef.current});
  };
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    socket.on("start-drawing",({draw})=>{
      ctx.beginPath();
      ctx.moveTo(draw.x, draw.y);
    })
    socket.on("draw-data", ({ draw }) => {
      ctx.strokeStyle = draw.color;
      ctx.lineWidth = draw.lineWidth;
      ctx.lineTo(draw.x, draw.y);
      ctx.stroke();
    });
    socket.on("clear-canvas",()=>{
      const canvas = canvasRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    })
    return () => {
      socket.off("start-drawing");
      socket.off("draw-data");
      socket.off("clear-canvas");
    };
  }, [socket]);

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="flex space-x-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="border p-1"
        />
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
          className="w-24"
        />
        <button onClick={clearCanvas} className="px-3 py-1 bg-red-500 text-white rounded">Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border-2 border-gray-500 bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default DrawingCanvas;
