import { getApiBaseUrl } from './petsApi';

export function buildPetFormData(fields, photoFile) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value ?? '');
  });
  if (photoFile) {
    formData.append('photo', photoFile);
  }
  return formData;
}

function apiBaseForMedia() {
  const fromEnv = getApiBaseUrl();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  return '';
}

export function getPetPhotoSrc(pet) {
  if (!pet?.photo_url) return null;
  const url = pet.photo_url;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/')) {
    const base = apiBaseForMedia();
    return base ? `${base}${url}` : url;
  }

  return url;
}
