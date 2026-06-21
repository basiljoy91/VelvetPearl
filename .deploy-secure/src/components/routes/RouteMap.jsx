import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../data/routes';

export default function RouteMap() {
    const navigate = useNavigate();

    const routeCoordinates = {
        'Chennai-Pondicherry': {
            start: [13.0827, 80.2707],
            end: [11.9416, 79.8083]
        },
        'Coimbatore-Ooty': {
            start: [11.0168, 76.9558],
            end: [11.4064, 76.6932]
        }
    };

    const [selectedRoute, setSelectedRoute] = useState('Chennai-Pondicherry');
    const selectedCoordinates = routeCoordinates[selectedRoute];

    const handleBookRoute = (route) => {
        navigate('/book/cab', {
            state: {
                route: `${route.from} → ${route.to}`
            }
        });
    };

    return (
        <section className="py-24 px-4 md:px-8 bg-background">
            <div className="max-w-7xl mx-auto">

                {/* Heading */}
                <div className="text-center mb-12">
                    <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs">
                        Route Explorer
                    </span>

                    <h2 className="font-headline text-4xl md:text-5xl font-light text-white mt-4">
                        Explore Example Route Requests
                    </h2>

                    <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto">
                        View sample route requests with editable travel details. Final pricing and confirmation are shared only after review.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Route preview */}
                    <div className="rounded-3xl overflow-hidden border border-white/10 h-[320px] md:h-[550px] w-full min-w-0 bg-surface-container-high">
                        <div className="h-full p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                            <div className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                                <div>
                                    <p className="text-secondary uppercase tracking-[0.3em] text-xs mb-4">
                                        Route preview
                                    </p>
                                    <h3 className="text-3xl text-white font-bold mb-4">
                                        {selectedRoute.replace('-', ' → ')}
                                    </h3>
                                    <p className="text-on-surface-variant max-w-xl leading-7">
                                        This preview highlights example waypoints, pickup and destination coordinates, and editable travel details.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 mt-8">
                                    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                                        <p className="text-on-surface-variant uppercase tracking-[0.2em] text-xs mb-2">
                                            Pickup point
                                        </p>
                                        <p className="text-white font-semibold">
                                            {selectedCoordinates.start[0]}, {selectedCoordinates.start[1]}
                                        </p>
                                    </div>
                                    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                                        <p className="text-on-surface-variant uppercase tracking-[0.2em] text-xs mb-2">
                                            Destination
                                        </p>
                                        <p className="text-white font-semibold">
                                            {selectedCoordinates.end[0]}, {selectedCoordinates.end[1]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Route Cards */}
                    <div className="space-y-6">
                        {routes.map((route) => (
                            <div
                                key={route.id}
                                onClick={() =>
                                    setSelectedRoute(`${route.from}-${route.to}`)
                                }
                                className={`rounded-2xl border p-6 transition-all cursor-pointer hover:border-secondary/40 ${selectedRoute === `${route.from}-${route.to}`
                                        ? 'border-secondary bg-secondary/10'
                                        : 'border-white/10 bg-surface-container-low'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                                    <div>
                                        <h3 className="text-white text-xl font-bold">
                                            {route.from}
                                            <span className="text-secondary mx-2">→</span>
                                            {route.to}
                                        </h3>

                                        <div className="mt-3 space-y-1 text-sm text-on-surface-variant">
                                            <p>📍 {route.distance}</p>
                                            <p>⏱ {route.duration}</p>
                                            <p>🚖 {route.vehicle}</p>
                                        </div>
                                    </div>

                                    <div className="text-left md:text-right">
                                        <h4 className="text-2xl font-bold text-white mb-3">
                                            <span className="text-lg leading-snug">{route.price}</span>
                                        </h4>
                                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Price depends on date, vehicle, route, and availability</p>

                                        <button
                                            onClick={() => handleBookRoute(route)}
                                            className="bg-primary-container text-white px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                                        >
                                            Submit Route Enquiry
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
