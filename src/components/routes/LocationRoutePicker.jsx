import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowUpDown, Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { estimateRoute, searchLocations } from '../../services/dataService';

const defaultCenter = [11.8, 78.2];

const markerIcon = (color) => L.divIcon({
  className: '',
  html: `<span style="display:block;width:18px;height:18px;border-radius:999px;background:${color};border:3px solid white;box-shadow:0 6px 18px rgba(0,0,0,.35)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const pickupIcon = markerIcon('#22C55E');
const dropIcon = markerIcon('#EF4444');

const toLatLng = (location) => {
  const lat = Number(location?.latitude);
  const lng = Number(location?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

const geometryToPolyline = (estimate, pickup, drop) => {
  const coordinates = estimate?.geometry?.coordinates;

  if (Array.isArray(coordinates) && coordinates.length > 1) {
    return coordinates.map(([lng, lat]) => [lat, lng]).filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
  }

  return [toLatLng(pickup), toLatLng(drop)].filter(Boolean);
};

function FitRouteBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 11, { animate: true });
      return;
    }
    map.fitBounds(points, { padding: [34, 34], animate: true });
  }, [map, points]);

  return null;
}

function LocationSearchField({
  label,
  value,
  query,
  onQueryChange,
  suggestions,
  onSelect,
  onClear,
  isLoading,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value?.label) {
      onQueryChange(value.label);
    }
  }, [onQueryChange, value]);

  return (
    <div className="relative min-w-0">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{label}</label>
      <div className={`flex min-h-11 items-center gap-2 rounded-lg border bg-black/35 px-3 transition ${error ? 'border-rose-400/70' : 'border-white/10 focus-within:border-[#EFBF04]/70'}`}>
        <Search className="h-4 w-4 shrink-0 text-[#EFBF04]" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={label === 'Pickup' ? 'Search pickup point' : 'Search destination'}
          className="h-11 w-full min-w-0 border-0 bg-transparent p-0 text-sm text-white outline-none placeholder:text-gray-600 focus:ring-0"
        />
        {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" aria-hidden="true" />}
        {(query || value) && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="rounded-md p-1 text-gray-500 transition hover:bg-white/10 hover:text-white"
            aria-label={`Clear ${label.toLowerCase()} location`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
      {isOpen && query.trim().length >= 2 && !value?.label && (
        <div className="absolute z-[80] mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#111111] p-2 shadow-2xl">
          {isLoading ? (
            <p className="px-3 py-3 text-sm text-gray-400">Searching locations...</p>
          ) : suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button
                key={`${item.provider}-${item.provider_place_id}-${item.label}`}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onQueryChange(item.label);
                  setIsOpen(false);
                }}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-white/8"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#EFBF04]" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500">{item.address}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-gray-400">No matching locations found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function LocationRoutePicker({
  initialPickup = null,
  initialDrop = null,
  initialEstimate = null,
  onRouteChange,
  onEnquire,
  enquireLabel = 'Enquire',
  className = '',
}) {
  const [pickup, setPickup] = useState(initialPickup);
  const [drop, setDrop] = useState(initialDrop);
  const [pickupQuery, setPickupQuery] = useState(initialPickup?.label || '');
  const [dropQuery, setDropQuery] = useState(initialDrop?.label || '');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [loadingField, setLoadingField] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [estimate, setEstimate] = useState(initialEstimate);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [geoStatus, setGeoStatus] = useState('');

  useEffect(() => {
    onRouteChange?.({ pickup, drop, estimate });
  }, [drop, estimate, onRouteChange, pickup]);

  useEffect(() => {
    let ignore = false;
    const query = pickupQuery.trim();

    if (pickup?.label === query || query.length < 2) {
      setPickupSuggestions([]);
      return undefined;
    }

    setLoadingField('pickup');
    const timeout = window.setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        if (!ignore) setPickupSuggestions(results);
      } catch (error) {
        if (!ignore) setFieldErrors((current) => ({ ...current, pickup: error.message || 'Pickup search failed.' }));
      } finally {
        if (!ignore) setLoadingField('');
      }
    }, 260);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [pickup, pickupQuery]);

  useEffect(() => {
    let ignore = false;
    const query = dropQuery.trim();

    if (drop?.label === query || query.length < 2) {
      setDropSuggestions([]);
      return undefined;
    }

    setLoadingField('drop');
    const timeout = window.setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        if (!ignore) setDropSuggestions(results);
      } catch (error) {
        if (!ignore) setFieldErrors((current) => ({ ...current, drop: error.message || 'Drop search failed.' }));
      } finally {
        if (!ignore) setLoadingField('');
      }
    }, 260);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [drop, dropQuery]);

  const points = useMemo(() => geometryToPolyline(estimate, pickup, drop), [drop, estimate, pickup]);
  const pickupPoint = toLatLng(pickup);
  const dropPoint = toLatLng(drop);
  const hasSameRoute = pickupPoint && dropPoint && Math.abs(pickupPoint[0] - dropPoint[0]) < 0.0001 && Math.abs(pickupPoint[1] - dropPoint[1]) < 0.0001;
  const canEstimate = pickupPoint && dropPoint && !hasSameRoute;

  const handleEstimate = async () => {
    const nextErrors = {};
    if (!pickupPoint) nextErrors.pickup = 'Choose a pickup from search or current location.';
    if (!dropPoint) nextErrors.drop = 'Choose a drop location from search.';
    if (hasSameRoute) nextErrors.drop = 'Pickup and drop cannot be the same point.';
    setFieldErrors(nextErrors);
    setEstimateError('');

    if (Object.keys(nextErrors).length) return;

    setIsEstimating(true);
    try {
      const result = await estimateRoute({ pickup, drop });
      setEstimate(result);
    } catch (error) {
      setEstimateError(error.message || 'Unable to estimate this route.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleCurrentLocation = () => {
    setGeoStatus('');

    if (!navigator.geolocation) {
      setGeoStatus('Current location is not available in this browser.');
      return;
    }

    setGeoStatus('Detecting current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLocation = {
          label: 'Current location',
          address: 'Detected from this browser',
          provider: 'browser',
          provider_place_id: `browser-${position.coords.latitude.toFixed(6)}-${position.coords.longitude.toFixed(6)}`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: '',
          state: '',
          country: '',
          postal_code: '',
        };
        setPickup(detectedLocation);
        setPickupQuery(detectedLocation.label);
        setEstimate(null);
        setGeoStatus('Current location added as pickup.');
      },
      () => setGeoStatus('Location permission was not granted. You can still search manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSwap = () => {
    setPickup(drop);
    setDrop(pickup);
    setPickupQuery(drop?.label || '');
    setDropQuery(pickup?.label || '');
    setEstimate(null);
    setFieldErrors({});
  };

  const estimateLabel = estimate
    ? `${Number(estimate.distance_km || 0).toFixed(1)} km | ${Math.round(Number(estimate.duration_minutes || 0))} min`
    : 'Estimate pending';

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.25)] md:p-5 ${className}`}>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <LocationSearchField
          label="Pickup"
          value={pickup}
          query={pickupQuery}
          onQueryChange={(value) => {
            setPickupQuery(value);
            if (pickup?.label !== value) {
              setPickup(null);
              setEstimate(null);
            }
          }}
          suggestions={pickupSuggestions}
          onSelect={(location) => {
            setPickup(location);
            setFieldErrors((current) => ({ ...current, pickup: '' }));
            setEstimate(null);
          }}
          onClear={() => {
            setPickup(null);
            setPickupQuery('');
            setEstimate(null);
          }}
          isLoading={loadingField === 'pickup'}
          error={fieldErrors.pickup}
        />

        <div className="flex items-end justify-start gap-2 pt-0 lg:justify-center lg:pt-7">
          <button
            type="button"
            onClick={handleSwap}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-black/35 text-[#EFBF04] transition hover:border-[#EFBF04]/60 hover:bg-[#EFBF04]/10"
            aria-label="Swap pickup and drop"
          >
            <ArrowUpDown className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-black/35 text-sky-300 transition hover:border-sky-300/60 hover:bg-sky-300/10"
            aria-label="Use current location"
          >
            <LocateFixed className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <LocationSearchField
          label="Drop"
          value={drop}
          query={dropQuery}
          onQueryChange={(value) => {
            setDropQuery(value);
            if (drop?.label !== value) {
              setDrop(null);
              setEstimate(null);
            }
          }}
          suggestions={dropSuggestions}
          onSelect={(location) => {
            setDrop(location);
            setFieldErrors((current) => ({ ...current, drop: '' }));
            setEstimate(null);
          }}
          onClear={() => {
            setDrop(null);
            setDropQuery('');
            setEstimate(null);
          }}
          isLoading={loadingField === 'drop'}
          error={fieldErrors.drop}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-h-[280px] overflow-hidden rounded-xl border border-white/10 bg-[#111111]">
          <MapContainer center={pickupPoint || dropPoint || defaultCenter} zoom={pickupPoint || dropPoint ? 10 : 6} className="h-[280px] w-full md:h-[340px]" scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitRouteBounds points={points.length ? points : [pickupPoint, dropPoint].filter(Boolean)} />
            {pickupPoint && <Marker position={pickupPoint} icon={pickupIcon} />}
            {dropPoint && <Marker position={dropPoint} icon={dropIcon} />}
            {points.length > 1 && <Polyline positions={points} pathOptions={{ color: '#EFBF04', weight: 5, opacity: 0.85 }} />}
          </MapContainer>
        </div>

        <aside className="rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">Route check</p>
          <p className="mt-3 text-xl font-bold text-white">{estimateLabel}</p>
          <p className="mt-2 text-xs leading-5 text-gray-400">
            {estimate?.provider === 'fallback'
              ? 'Approximate local estimate. Configure a map provider for road-network routing.'
              : estimate
                ? `Estimated by ${estimate.provider}.`
                : 'Choose pickup and drop, then estimate the route.'}
          </p>

          {geoStatus && <p className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">{geoStatus}</p>}
          {estimateError && <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{estimateError}</p>}

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleEstimate}
              disabled={!canEstimate || isEstimating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#EFBF04] px-4 py-3 text-sm font-bold text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEstimating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Estimate Route
            </button>
            {onEnquire && (
              <button
                type="button"
                onClick={() => onEnquire({ pickup, drop, estimate })}
                disabled={!pickup || !drop}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2249DB]/70 bg-[#2249DB] px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enquireLabel}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
