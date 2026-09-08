const Location = require('../models/locationModel');

const FALLBACK_LOCATIONS = [
  {
    label: 'Chennai',
    address: 'Chennai, Tamil Nadu, India',
    provider: 'seed',
    provider_place_id: 'seed-chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
  },
  {
    label: 'Chennai International Airport',
    address: 'Chennai International Airport, Meenambakkam, Chennai, Tamil Nadu, India',
    provider: 'seed',
    provider_place_id: 'seed-chennai-airport',
    latitude: 12.9941,
    longitude: 80.1709,
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
  },
  {
    label: 'Pondicherry',
    address: 'Puducherry, India',
    provider: 'seed',
    provider_place_id: 'seed-pondicherry',
    latitude: 11.9416,
    longitude: 79.8083,
    city: 'Puducherry',
    state: 'Puducherry',
    country: 'India',
  },
  {
    label: 'Coimbatore',
    address: 'Coimbatore, Tamil Nadu, India',
    provider: 'seed',
    provider_place_id: 'seed-coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
  },
  {
    label: 'Coimbatore International Airport',
    address: 'Coimbatore International Airport, Peelamedu, Coimbatore, Tamil Nadu, India',
    provider: 'seed',
    provider_place_id: 'seed-coimbatore-airport',
    latitude: 11.0300,
    longitude: 77.0434,
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
  },
  {
    label: 'Ooty',
    address: 'Udhagamandalam, Tamil Nadu, India',
    provider: 'seed',
    provider_place_id: 'seed-ooty',
    latitude: 11.4064,
    longitude: 76.6932,
    city: 'Ooty',
    state: 'Tamil Nadu',
    country: 'India',
  },
  {
    label: 'Madurai',
    address: 'Madurai, Tamil Nadu, India',
    provider: 'seed',
    provider_place_id: 'seed-madurai',
    latitude: 9.9252,
    longitude: 78.1198,
    city: 'Madurai',
    state: 'Tamil Nadu',
    country: 'India',
  },
  {
    label: 'Kodaikanal',
    address: 'Kodaikanal, Tamil Nadu, India',
    provider: 'seed',
    provider_place_id: 'seed-kodaikanal',
    latitude: 10.2381,
    longitude: 77.4892,
    city: 'Kodaikanal',
    state: 'Tamil Nadu',
    country: 'India',
  },
];

const getMapProvider = () => {
  const configured = String(process.env.MAP_PROVIDER || '').trim().toLowerCase();
  if (configured && !['auto', 'seed'].includes(configured)) return configured;
  if (process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY) return 'google';
  if (process.env.MAPBOX_ACCESS_TOKEN) return 'mapbox';
  if (process.env.NOMINATIM_BASE_URL || process.env.HOSTED_NOMINATIM_BASE_URL) return 'hosted-nominatim';
  return configured || 'seed';
};

const dedupeLocations = (locations = []) => {
  const seen = new Set();
  return locations.filter((location) => {
    const key = `${location.provider || ''}:${location.provider_place_id || ''}:${location.label || ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const searchMapbox = async (query) => {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return [];

  const endpoint = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
  endpoint.searchParams.set('access_token', token);
  endpoint.searchParams.set('country', process.env.MAP_COUNTRY_FILTER || 'in');
  endpoint.searchParams.set('limit', '6');

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Mapbox search failed with ${response.status}`);
  const data = await response.json();

  return (data.features || []).map((feature) => ({
    label: feature.text || feature.place_name,
    address: feature.place_name,
    provider: 'mapbox',
    provider_place_id: feature.id,
    latitude: feature.center?.[1],
    longitude: feature.center?.[0],
    city: feature.context?.find((item) => item.id?.startsWith('place'))?.text || feature.text,
    state: feature.context?.find((item) => item.id?.startsWith('region'))?.text || '',
    country: feature.context?.find((item) => item.id?.startsWith('country'))?.text || '',
    postal_code: feature.context?.find((item) => item.id?.startsWith('postcode'))?.text || '',
    raw_response_json: feature,
  }));
};

const searchNominatimCompatible = async (query) => {
  const baseUrl = process.env.NOMINATIM_BASE_URL || process.env.HOSTED_NOMINATIM_BASE_URL;
  if (!baseUrl) return [];

  const endpoint = new URL('/search', baseUrl);
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('format', 'jsonv2');
  endpoint.searchParams.set('addressdetails', '1');
  endpoint.searchParams.set('limit', '6');
  if (process.env.MAP_COUNTRY_FILTER) endpoint.searchParams.set('countrycodes', process.env.MAP_COUNTRY_FILTER);

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent': process.env.MAP_PROVIDER_USER_AGENT || 'VelvetPearl/1.0',
    },
  });
  if (!response.ok) throw new Error(`Hosted geocoder failed with ${response.status}`);
  const data = await response.json();

  return (Array.isArray(data) ? data : []).map((item) => ({
    label: item.name || item.display_name,
    address: item.display_name,
    provider: 'nominatim',
    provider_place_id: String(item.place_id || item.osm_id || ''),
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    city: item.address?.city || item.address?.town || item.address?.village || '',
    state: item.address?.state || '',
    country: item.address?.country || '',
    postal_code: item.address?.postcode || '',
    raw_response_json: item,
  }));
};

const searchGooglePlaces = async (query) => {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.addressComponents',
    },
    body: JSON.stringify({
      textQuery: query,
      regionCode: process.env.MAP_COUNTRY_FILTER || 'IN',
      maxResultCount: 6,
    }),
  });

  if (!response.ok) throw new Error(`Google Places search failed with ${response.status}`);
  const data = await response.json();

  return (data.places || []).map((place) => {
    const components = place.addressComponents || [];
    const findComponent = (type) => components.find((item) => item.types?.includes(type))?.longText || '';

    return {
      label: place.displayName?.text || place.formattedAddress,
      address: place.formattedAddress,
      provider: 'google',
      provider_place_id: place.id,
      latitude: place.location?.latitude,
      longitude: place.location?.longitude,
      city: findComponent('locality') || findComponent('administrative_area_level_3'),
      state: findComponent('administrative_area_level_1'),
      country: findComponent('country'),
      postal_code: findComponent('postal_code'),
      raw_response_json: place,
    };
  });
};

const searchFallbackLocations = (query) => {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) return [];

  return FALLBACK_LOCATIONS
    .filter((item) => [item.label, item.address, item.city, item.state]
      .some((value) => String(value || '').toLowerCase().includes(normalized)))
    .slice(0, 8);
};

const searchProvider = async (query) => {
  const mapProvider = getMapProvider();
  if (mapProvider === 'mapbox') return searchMapbox(query);
  if (mapProvider === 'google') return searchGooglePlaces(query);
  if (['nominatim', 'hosted-nominatim', 'nominatim-compatible'].includes(mapProvider)) {
    return searchNominatimCompatible(query);
  }

  return [];
};

const findAddressComponent = (components = [], type) => (
  components.find((item) => item.types?.includes(type))?.long_name
  || components.find((item) => item.types?.includes(type))?.longText
  || ''
);

const reverseMapbox = async (latitude, longitude) => {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  const endpoint = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`);
  endpoint.searchParams.set('access_token', token);
  endpoint.searchParams.set('country', process.env.MAP_COUNTRY_FILTER || 'in');
  endpoint.searchParams.set('limit', '1');
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Mapbox reverse geocoding failed with ${response.status}`);
  const feature = (await response.json()).features?.[0];
  if (!feature) return null;
  return {
    label: feature.text || feature.place_name,
    address: feature.place_name,
    provider: 'mapbox',
    provider_place_id: feature.id,
    latitude,
    longitude,
    city: feature.context?.find((item) => item.id?.startsWith('place'))?.text || '',
    state: feature.context?.find((item) => item.id?.startsWith('region'))?.text || '',
    country: feature.context?.find((item) => item.id?.startsWith('country'))?.text || '',
    postal_code: feature.context?.find((item) => item.id?.startsWith('postcode'))?.text || '',
    raw_response_json: feature,
  };
};

const reverseGoogle = async (latitude, longitude) => {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  const endpoint = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  endpoint.searchParams.set('latlng', `${latitude},${longitude}`);
  endpoint.searchParams.set('key', key);
  endpoint.searchParams.set('region', process.env.MAP_COUNTRY_FILTER || 'in');
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Google reverse geocoding failed with ${response.status}`);
  const result = (await response.json()).results?.[0];
  if (!result) return null;
  return {
    label: result.address_components?.[0]?.long_name || result.formatted_address,
    address: result.formatted_address,
    provider: 'google',
    provider_place_id: result.place_id,
    latitude,
    longitude,
    city: findAddressComponent(result.address_components, 'locality') || findAddressComponent(result.address_components, 'administrative_area_level_3'),
    state: findAddressComponent(result.address_components, 'administrative_area_level_1'),
    country: findAddressComponent(result.address_components, 'country'),
    postal_code: findAddressComponent(result.address_components, 'postal_code'),
    raw_response_json: result,
  };
};

const reverseNominatimCompatible = async (latitude, longitude) => {
  const baseUrl = process.env.NOMINATIM_BASE_URL || process.env.HOSTED_NOMINATIM_BASE_URL;
  if (!baseUrl) return null;
  const endpoint = new URL('/reverse', baseUrl);
  endpoint.searchParams.set('lat', String(latitude));
  endpoint.searchParams.set('lon', String(longitude));
  endpoint.searchParams.set('format', 'jsonv2');
  endpoint.searchParams.set('addressdetails', '1');
  const response = await fetch(endpoint, { headers: { 'User-Agent': process.env.MAP_PROVIDER_USER_AGENT || 'VelvetPearl/1.0' } });
  if (!response.ok) throw new Error(`Hosted reverse geocoder failed with ${response.status}`);
  const item = await response.json();
  if (!item?.display_name) return null;
  return {
    label: item.name || item.address?.road || item.address?.suburb || item.display_name,
    address: item.display_name,
    provider: 'nominatim',
    provider_place_id: String(item.place_id || item.osm_id || ''),
    latitude,
    longitude,
    city: item.address?.city || item.address?.town || item.address?.village || '',
    state: item.address?.state || '',
    country: item.address?.country || '',
    postal_code: item.address?.postcode || '',
    raw_response_json: item,
  };
};

const reverseGeocode = async ({ latitude, longitude }) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Invalid map coordinates.');
  }

  const provider = getMapProvider();
  let location = null;
  if (provider === 'google') location = await reverseGoogle(lat, lng);
  if (provider === 'mapbox') location = await reverseMapbox(lat, lng);
  if (['nominatim', 'hosted-nominatim', 'nominatim-compatible'].includes(provider)) location = await reverseNominatimCompatible(lat, lng);

  const fallback = {
    label: 'Pinned map location',
    address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    provider: 'map',
    provider_place_id: `map-${lat.toFixed(6)}-${lng.toFixed(6)}`,
    latitude: lat,
    longitude: lng,
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
  };
  return Location.upsert(location || fallback);
};

const searchLocations = async (query) => {
  const normalized = String(query || '').trim();
  if (normalized.length < 2) return [];

  const dbResults = await Location.search(normalized);
  let providerResults = [];

  try {
    providerResults = await searchProvider(normalized);
  } catch (error) {
    console.warn('Location provider search failed; falling back to stored locations:', error.message);
  }

  const fallbackResults = searchFallbackLocations(normalized);
  const candidates = dedupeLocations([...dbResults, ...providerResults, ...fallbackResults]).slice(0, 8);
  const stored = [];

  for (const candidate of candidates) {
    const saved = await Location.upsert(candidate);
    stored.push(saved || candidate);
  }

  return dedupeLocations(stored).slice(0, 8);
};

module.exports = {
  searchLocations,
  reverseGeocode,
  FALLBACK_LOCATIONS,
};
