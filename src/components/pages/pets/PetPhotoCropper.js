import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { blobToFile, getCroppedImage } from '../../../utils/cropImage';
import './PetPhotoCropper.css';

export default function PetPhotoCropper({ imageSrc, onCancel, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) {
      setErrorMessage('Adjust the image, then try again.');
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
      onComplete(blobToFile(blob));
    } catch (err) {
      console.warn(err);
      setErrorMessage('Could not crop this image. Try a different file.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pet-photo-cropper" role="dialog" aria-label="Adjust profile photo">
      <p className="pet-photo-cropper-title">Drag and zoom to choose what shows in the circle</p>

      <div className="pet-photo-cropper-area">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <label className="pet-photo-cropper-zoom-label" htmlFor="pet-photo-zoom">
        Zoom
      </label>
      <input
        id="pet-photo-zoom"
        type="range"
        min={1}
        max={3}
        step={0.05}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="pet-photo-cropper-zoom"
      />

      {errorMessage && <p className="diary-error">{errorMessage}</p>}

      <div className="pet-photo-cropper-actions">
        <button type="button" className="pet-photo-cropper-cancel" onClick={onCancel} disabled={processing}>
          Cancel
        </button>
        <button type="button" className="pet-photo-cropper-apply" onClick={handleApply} disabled={processing}>
          {processing ? 'Saving crop…' : 'Use this photo'}
        </button>
      </div>
    </div>
  );
}
