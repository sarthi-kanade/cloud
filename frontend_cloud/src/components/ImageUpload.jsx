import { useState } from 'react';
import axios from 'axios';
import './ImageUpload.css';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Starting upload process...');
      
      // Create axios instance with default config
      const instance = axios.create({
        baseURL: 'http://localhost:3000',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Sending image data to server...');
      const response = await instance.post('/upload', {
        file: preview
      });

      console.log('Server response:', response.data);

      if (response.data && response.data.url) {
        console.log('Upload successful');
        setUploadedImageUrl(response.data.url);
        setSelectedFile(null);
        setPreview('');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Upload error details:', err.response?.data || err.message);
      let errorMessage = 'Error uploading image. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="image-upload">
      <h2>Upload Property Image</h2>
      
      <div className="upload-container">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input"
        />

        {preview && (
          <div className="preview-container">
            <h3>Preview:</h3>
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
          className="upload-button"
        >
          {isLoading ? 'Uploading...' : 'Upload Image'}
        </button>

        {error && <div className="error-message">{error}</div>}

        {uploadedImageUrl && (
          <div className="success-container">
            <h3>Upload Successful!</h3>
            <img src={uploadedImageUrl} alt="Uploaded" className="uploaded-image" />
            <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer" className="image-link">
              View Full Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;