import React, { useRef, useState, useEffect } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';

const ObjectDetection = () => {
  const fileInputRef = useRef(null);
  const [imageName, setImageName] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [predictions, setPredictions] = useState([]);
  const canvasRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataURL = e.target.result;
        setImageSrc(imageDataURL);

        const imageElement = new Image();
        imageElement.src = imageDataURL;

        imageElement.onload = async () => {
          const model = await cocoSsd.load();
          const predictions = await model.detect(imageElement);
          console.log(predictions)
          setPredictions(predictions);
        };
      };

      reader.readAsDataURL(file);
    }
  };

  const drawBoundingBoxes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!canvas) {
      console.error('Canvas not available.');
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imageElement = new Image();
    imageElement.src = imageSrc;

    imageElement.onload = () => {
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;

      // Draw the image on the canvas
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

      predictions.forEach((prediction) => {
        // Draw bounding box
        ctx.beginPath();
        const [x, y, width, height] = prediction.bbox;
        const scaleX = canvas.width / imageElement.width;
        const scaleY = canvas.height / imageElement.height;
        ctx.rect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'transparent';
        ctx.stroke();

        // Display type and confidence
        ctx.font = '14px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText(
          `${prediction.class} - ${Math.round(prediction.score * 100)}%`,
          x * scaleX,
          y * scaleY > 10 ? y * scaleY - 5 : 10
        );
      });
    };
  };

  //////////////////////////////////
  useEffect(() => {
    if (imageSrc && predictions.length > 0) {
      // drawBoundingBoxes();
    }
  }, [imageSrc, predictions]);

  return (
    <Box
      paddingTop={5}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      {/* Styled file input */}
      <TextField
        type="file"
        InputLabelProps={{
          shrink: true,
        }}
        variant="outlined"
        margin="normal"
        fullWidth
        InputProps={{
          inputProps: {
            accept: 'image/*',
          },
        }}
        onChange={handleFileUpload}
        inputRef={fileInputRef}
        style={{ width: '300px' }}
      />

      <Button variant="contained" color="primary" onClick={drawBoundingBoxes}>
        Detect Objects
      </Button>

      {imageName && (
        <Box display="flex" justifyContent="center" marginTop="20px">
          {/* Image Preview */}
          <Card style={{ maxWidth: '600px', marginRight: '20px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Image Preview
              </Typography>
              <img
                src={imageSrc}
                alt="Uploaded"
                onLoad={drawBoundingBoxes}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px', // Set max height to prevent overflow
                }}
              />
              <Typography variant="subtitle1" style={{ marginTop: 10 }}>
                Image Name: {imageName}
              </Typography>
            </CardContent>
          </Card>

          {/* Canvas element */}
          <Card style={{ border: '1px solid #ddd', maxWidth: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Object Detection
              </Typography>
              <canvas
                ref={canvasRef}
                style={{ marginTop: 20, width: '100%', border: '1px solid #ddd' }}
                width={imageSrc ? imageSrc.width : 0}
                height={imageSrc ? imageSrc.height : 0}
              />
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default ObjectDetection;
