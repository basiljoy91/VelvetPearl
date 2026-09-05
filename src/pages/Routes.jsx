import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPinned, Route as RouteIcon } from 'lucide-react';
import LocationRoutePicker from '../components/routes/LocationRoutePicker';
import { getPopularRoutes } from '../services/dataService';

const formatDuration = (minutes) => {
  const total = Number(minutes || 0);
  if (!total) return 'Timing on review';
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return [hours ? `${hours}h` : '', mins ? `${mins}m` : ''].filter(Boolean).join(' ');
};

const buildCabRouteState = ({ pickup, drop, estimate }) => ({
  route: `${pickup?.label || ''} → ${drop?.label || ''}`,
  routeData: {
    pickup_location: pickup,
    drop_location: drop,
    route_estimate: estimate,
  },
});

export default function Routes() {
  const navigate = useNavigate();
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [routeState, setRouteState] = useState({ pickup: null, drop: null, estimate: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadRoutes = async () => {
      setIsLoading(true);
      setError('');

      try {
        const routes = await getPopularRoutes();
        if (!ignore) setPopularRoutes(routes);
      } catch (loadError) {
        if (!ignore) setError(loadError.message || 'Unable to load popular routes.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadRoutes();

    return () => {
      ignore = true;
    };
  }, []);

  const handleEnquire = ({ pickup, drop, estimate }) => {
    if (!pickup || !drop) return;
    navigate('/book/cab', { state: buildCabRouteState({ pickup, drop, estimate }) });
  };

  const handlePopularEnquire = (route) => {
    navigate('/book/cab', {
      state: buildCabRouteState({
        pickup: route.pickup_location,
        drop: route.drop_location,
        estimate: {
          id: route.route_estimate_id || null,
          distance_km: route.distance_km,
          duration_minutes: route.duration_minutes,
          provider: 'popular_route',
        },
      }),
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 md:pt-32">
      <header className="mb-8 max-w-4xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#EFBF04]">Routes</p>
        <h1 className="mt-3 font-headline text-4xl font-black leading-none text-white sm:text-5xl md:text-6xl">
          Plan a Route Before You Enquire
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant">
          Search pickup and drop locations, review an estimated distance, then send the selected route into a cab enquiry.
        </p>
      </header>

      <LocationRoutePicker
        onRouteChange={setRouteState}
        onEnquire={handleEnquire}
        enquireLabel="Use Route in Enquiry"
      />

      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">Popular routes</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Editable from Admin</h2>
          </div>
          {routeState.estimate && (
            <p className="rounded-full border border-[#EFBF04]/30 bg-[#EFBF04]/10 px-4 py-2 text-xs font-semibold text-[#EFBF04]">
              Current estimate: {Number(routeState.estimate.distance_km || 0).toFixed(1)} km
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-black/30 text-[10px] uppercase tracking-[0.22em] text-gray-500">
                <tr>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-4 py-4">Distance</th>
                  <th className="px-4 py-4">Duration</th>
                  <th className="px-4 py-4">Vehicle</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-7 text-gray-400" colSpan="5">Loading route options...</td>
                    </tr>
                  ))
                ) : popularRoutes.length > 0 ? popularRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-white/5">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2249DB]/20 text-primary-fixed-dim">
                          <RouteIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-semibold text-white">{route.title}</p>
                          <p className="mt-1 text-xs text-gray-500">{route.pickup_location?.label} to {route.drop_location?.label}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-gray-200">{route.distance_km ? `${Number(route.distance_km).toFixed(0)} km` : 'On review'}</td>
                    <td className="px-4 py-5 text-gray-200">{formatDuration(route.duration_minutes)}</td>
                    <td className="px-4 py-5 text-gray-200">{route.vehicle_type || 'Based on group'}</td>
                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => handlePopularEnquire(route)}
                        className="rounded-lg bg-[#2249DB] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:brightness-110"
                      >
                        Enquire
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-6 py-10 text-center text-gray-300" colSpan="5">No popular routes are active yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {isLoading ? (
              <div className="rounded-xl bg-black/20 p-5 text-sm text-gray-400">Loading route options...</div>
            ) : popularRoutes.length > 0 ? popularRoutes.map((route) => (
              <article key={route.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2249DB]/20 text-primary-fixed-dim">
                    <MapPinned className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white">{route.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-400">{route.pickup_location?.label} to {route.drop_location?.label}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-300">
                      <span className="rounded-full bg-white/8 px-3 py-1">{route.distance_km ? `${Number(route.distance_km).toFixed(0)} km` : 'Distance on review'}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-3 py-1"><Clock className="h-3 w-3" /> {formatDuration(route.duration_minutes)}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePopularEnquire(route)}
                  className="mt-4 w-full rounded-lg bg-[#2249DB] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
                >
                  Enquire
                </button>
              </article>
            )) : (
              <div className="rounded-xl bg-black/20 p-5 text-sm text-gray-400">No popular routes are active yet.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
