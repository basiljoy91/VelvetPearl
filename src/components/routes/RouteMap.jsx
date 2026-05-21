import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { routes } from '../../data/routes';

function Routing({ start, end }) {
    const map = useMap();

    React.useEffect(() => {
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            lineOptions: {
                styles: [
                    {
                        color: '#EFBF04',
                        weight: 5
                    }
                ]
            },
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
            createMarker: () => null
        }).addTo(map);

        return () => map.removeControl(routingControl);
    }, [map, start, end]);

    return null;
}

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
                        Explore Your Journey Before You Book
                    </h2>

                    <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto">
                        View pickup and destination routes with estimated travel details
                        for a smoother booking experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Real Map */}
                    <div className="rounded-3xl overflow-hidden border border-white/10 h-[320px] md:h-[550px] w-full min-w-0">
                        <MapContainer
                            center={[12.5, 80.0]}
                            zoom={7}
                            scrollWheelZoom={false}
                            className="h-full w-full max-w-full"
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Markers */}
                            <Marker position={routeCoordinates[selectedRoute].start}>
                                <Popup>Chennai Pickup Point</Popup>
                            </Marker>

                            <Marker position={routeCoordinates[selectedRoute].end}>
                                <Popup>Pondicherry Destination</Popup>
                            </Marker>

                            {/* Route Line */}
                            <Routing
                                start={routeCoordinates[selectedRoute].start}
                                end={routeCoordinates[selectedRoute].end}
                            />
                        </MapContainer>
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
                                            {route.price}
                                        </h4>

                                        <button
                                            onClick={() => handleBookRoute(route)}
                                            className="bg-primary-container text-white px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                                        >
                                            Book Route
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