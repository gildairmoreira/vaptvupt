// Geocoding e Autocomplete via Geoapify — VaptVupt
// Free tier: 3.000 req/dia no plano gratuito — sem cartão de crédito
// Docs: https://apidocs.geoapify.com/

const API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY!;

// ============================================================
// INTERFACES
// ============================================================

export interface GeoapifyPlace {
  place_id: string;
  formatted: string;
  lat: number;
  lon: number;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  formatted: string;
}

// ============================================================
// AUTOCOMPLETE — sugestões conforme o usuário digita
// ============================================================

// Busca sugestões de endereço por texto (autocomplete)
// Prioriza resultados no Brasil (filter[countrycode]=br)
export const searchAddresses = async (
  text: string,
  limit = 5
): Promise<GeoapifyPlace[]> => {
  if (!text || text.length < 3) return [];

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", text);
  url.searchParams.set("filter[countrycode]", "br");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("lang", "pt");
  url.searchParams.set("apiKey", API_KEY);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data = await response.json();
    return (data.results || []) as GeoapifyPlace[];
  } catch {
    return [];
  }
};

// ============================================================
// GEOCODING REVERSO — coordenadas → endereço
// ============================================================

// Converte coordenadas em endereço legível
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "pt");
  url.searchParams.set("apiKey", API_KEY);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    const result = data.results?.[0];
    return result?.formatted as string ?? null;
  } catch {
    return null;
  }
};

// ============================================================
// GEOCODING DIRETO — texto → coordenadas
// ============================================================

// Converte endereço em coordenadas
export const geocode = async (
  address: string
): Promise<GeocodingResult | null> => {
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", address);
  url.searchParams.set("filter[countrycode]", "br");
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "pt");
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", API_KEY);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    const result = data.results?.[0];
    if (!result) return null;

    return {
      lat: result.lat,
      lng: result.lon,
      formatted: result.formatted,
    };
  } catch {
    return null;
  }
};

// ============================================================
// BUSCA DE PRESTADORES POR ENDEREÇO
// ============================================================

// Formata o endereço resumido para exibição nos cards
export const formatAddressShort = (place: GeoapifyPlace): string => {
  if (place.address_line1 && place.city) {
    return `${place.address_line1}, ${place.city}`;
  }
  return place.formatted || "Endereço desconhecido";
};
