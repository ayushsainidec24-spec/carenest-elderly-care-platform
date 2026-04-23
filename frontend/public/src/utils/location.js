export async function getCityFromCoordinates(latitude, longitude) {
  if (latitude == null || longitude == null) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data?.address;
    const city = address?.city || address?.town || address?.village || address?.county || address?.state;
    const state = address?.state;

    if (!city) return null;
    return state && city !== state ? `${city}, ${state}` : city;
  } catch {
    return null;
  }
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
