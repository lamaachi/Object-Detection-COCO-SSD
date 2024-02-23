// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Components/Header';
import ObjectDetection from './Components/ObjectDetection';
import CameraDetection from './Components/CameraDetection';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<ObjectDetection />} />
          <Route path="/camera" element={<CameraDetection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
