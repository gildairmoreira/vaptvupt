// Funções de geolocalização — VaptVupt
// Calcula distância e ETA sem dependência do geofire-common para evitar issues de tipagem



const EARTH_RADIUS_KM = 6371;

// Gera geohash simples a partir de coordenadas
export const encodeGeohash = (_lat: number, _lng: number): string => {
  return `${_lat.toFixed(4)},${_lng.toFixed(4)}`;
};

// Calcula distância em quilômetros entre dois pontos usando fórmula de Haversine
export const getDistanceKm = (
  from: [number, number],
  to: [number, number]
): number => {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const dLat = toRad(to[0] - from[0]);
  const dLng = toRad(to[1] - from[1]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from[0])) *
      Math.cos(toRad(to[0])) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

// Formata distância para exibição amigável em PT-BR
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

// Estima tempo de chegada baseado na distância (velocidade média urbana 20km/h)
export const estimateETA = (km: number): string => {
  const minutes = Math.round((km / 20) * 60);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
};

// Converte objeto de coordenadas para array [lat, lng]
export const geoPointToCoords = (point: {latitude: number, longitude: number}): [number, number] => {
  return [point.latitude, point.longitude];
};
