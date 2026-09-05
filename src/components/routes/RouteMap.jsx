import React from 'react';
import { useNavigate } from 'react-router-dom';
import LocationRoutePicker from './LocationRoutePicker';

export default function RouteMap() {
  const navigate = useNavigate();

  return (
    <section className="bg-background px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Route Explorer</p>
          <h2 className="mt-3 font-headline text-3xl font-bold text-white md:text-5xl">Search a Live Route</h2>
          <p className="mt-4 text-sm leading-6 text-on-surface-variant md:text-base">
            Pick real pickup and drop points, estimate the route, and send it into a cab enquiry.
          </p>
        </div>
        <LocationRoutePicker
          enquireLabel="Submit Route Enquiry"
          onEnquire={({ pickup, drop, estimate }) => navigate('/book/cab', {
            state: {
              route: `${pickup?.label || ''} → ${drop?.label || ''}`,
              routeData: {
                pickup_location: pickup,
                drop_location: drop,
                route_estimate: estimate,
              },
            },
          })}
        />
      </div>
    </section>
  );
}
