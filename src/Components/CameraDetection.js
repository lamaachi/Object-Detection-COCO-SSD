import React, { useRef, useEffect, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const CameraDetection = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    const runObjectDetection = async () => {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        video.srcObject = stream;

        const model = await cocoSsd.load();

        video.addEventListener('loadeddata', async () => {
          video.play();

          const detectFrame = async () => {
            const predictions = await model.detect(video);
            setDetections(predictions);
            console.log("========================================"); // Log predictions
            console.log(predictions); // Log predictions
            drawBoundingBoxes(predictions, canvas);
            requestAnimationFrame(detectFrame);
          };

          detectFrame();
        });
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    runObjectDetection();

    return () => {
      // Cleanup code (e.g., stop the camera stream) can be added here
    };
  }, []);

  const drawBoundingBoxes = (predictions, canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((prediction) => {
      // Draw bounding box
      ctx.beginPath();
      const [x, y, width, height] = prediction.bbox;
      ctx.rect(x, y, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'transparent';
      ctx.stroke();

      // Display type and confidence
      ctx.font = '14px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(
        `${prediction.class} - ${Math.round(prediction.score * 100)}%`,
        x,
        y > 10 ? y - 5 : 10
      );
    });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <video ref={videoRef} width="640" height="480" autoPlay playsInline muted></video>
      <canvas ref={canvasRef} width="640" height="480" style={{ marginTop: '20px' }} />
      <div style={{ marginTop: '20px' }}>
        {detections.map((detection, index) => (
          <p key={index}>
            {`${detection.class} - ${Math.round(detection.score * 100)}%`}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CameraDetection;
