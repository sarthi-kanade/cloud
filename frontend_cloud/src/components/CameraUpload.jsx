import React, { useRef, useState } from 'react';
import axios from 'axios';

const CameraUpload = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [location, setLocation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Start camera
  const startCamera = async () => {
    setError('');
    setSuccess('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err) {
      setError('Camera access denied or not available.');
    }
  };

  // Capture image from video
  const captureImage = () => {
    setError('');
    setSuccess('');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageData(dataUrl);
    }
  };

  // Get geolocation
  const getLocation = () => {
    setError('');
    setSuccess('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => setError('Unable to retrieve your location.'),
      { enableHighAccuracy: true }
    );
  };

  // Upload image and location
  const handleUpload = async () => {
    if (!imageData) {
      setError('No image captured.');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('http://localhost:3000/upload', {
        file: imageData,
        location,
      });
      setSuccess('Image uploaded successfully!');
      setImageData(null);
      setLocation(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="camera-upload">
      <h2>Capture & Upload Flat Photo (with Geotag)</h2>
      {!streaming && (
        <button onClick={startCamera}>Start Camera</button>
      )}
      <div style={{ display: streaming ? 'block' : 'none' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: 400 }} />
        <button onClick={captureImage}>Capture Photo</button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {imageData && (
        <div>
          <img src={imageData} alt="Captured" style={{ maxWidth: 400, margin: '1rem 0' }} />
          <button onClick={getLocation}>Attach Geotag</button>
        </div>
      )}
      {location && (
        <div>
          <p>Location: {location.latitude}, {location.longitude}</p>
        </div>
      )}
      <button onClick={handleUpload} disabled={uploading || !imageData || !location}>
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: '1rem' }}>{success}</div>}
    </div>
  );
};

export default CameraUpload;
