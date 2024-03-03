import React, { useRef, useEffect, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const CameraDetection = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [detections, setDetections] = useState([]);
  const modelRef = useRef();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const startDetection = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();

      const model = await cocoSsd.load();
      modelRef.current = model;

      const detectFrame = async () => {
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;

          const predictions = await detectObjects(model, video, canvas);
          setDetections(predictions);

          isProcessingRef.current = false;
        }

        requestAnimationFrame(detectFrame);
      };

      detectFrame();
    };

    startDetection(); 

    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const detectObjects = async (model, video, canvas) => {
    const { videoWidth, videoHeight } = video;
    const aspectRatio = videoWidth / videoHeight;

    // Calculating new dimensions for canvas
    const maxWidth = 640;
    const maxHeight = 480;
    let newWidth = maxWidth;
    let newHeight = maxHeight;

    if (aspectRatio < 1) {
      newHeight = maxHeight;
      newWidth = Math.round(newHeight * aspectRatio);
    } else {
      newWidth = maxWidth;
      newHeight = Math.round(newWidth / aspectRatio);
    }

    // Setting canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, newWidth, newHeight);

    const image = context.getImageData(0, 0, newWidth, newHeight);
    const predictions = await model.detect(image);
    drawBoundingBoxes(predictions, context);

    return predictions;
  };

  const drawBoundingBoxes = (predictions, context) => {
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      context.beginPath();
      context.rect(x, y, width, height);
      context.lineWidth = 2;
      context.strokeStyle = 'red';
      context.fillStyle = 'transparent';
      context.stroke();

      context.font = '14px Arial';
      context.fillStyle = 'red';
      context.fillText(
        `${prediction.class} - ${Math.round(prediction.score * 100)}%`,
        x,
        y > 10 ? y - 5 : 10
      );
    });
  };

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          left: '50%',
          top: '300px',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          display: 'none', // Hide video element
        }}
      ></video>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '300px',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
        }}
      ></canvas>
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