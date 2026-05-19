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

export function getPetPhotoSrc(pet) {
  if (!pet?.photo_url) return null;
  const url = pet.photo_url;
  if (url.startsWith('/')) {
    const base = getApiBaseUrl();
    return base ? `${base}${url}` : url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const { pathname } = new URL(url);
      if (pathname.startsWith('/media/')) {
        const base = getApiBaseUrl();
        return base ? `${base}${pathname}` : pathname;
      }
    } catch {
      return url;
    }
  }
  return url;
}
