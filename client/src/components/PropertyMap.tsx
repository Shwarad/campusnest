import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Property } from '../types';

// Fix Leaflet default marker icons
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const verifiedIcon = L.divIcon({
  className: '',
  html: `<div class="relative">
    <div class="w-8 h-8 bg-teal-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">✓</div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const normalIcon = L.divIcon({
  className: '',
  html: `<div class="w-7 h-7 bg-primary-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">₹</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -32],
});

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map((p) => [p.coordinates.lat, p.coordinates.lng]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  }, [properties, map]);
  return null;
}

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
}

export default function PropertyMap({ properties, center = [26.1445, 91.7360], zoom = 13 }: PropertyMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} className="w-full h-full" aria-label="Property locations map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.length > 1 && <FitBounds properties={properties} />}
      {properties.map((p) => (
        <Marker
          key={p._id}
          position={[p.coordinates.lat, p.coordinates.lng]}
          icon={p.verificationStatus === 'verified' ? verifiedIcon : normalIcon}
        >
          <Popup className="property-popup">
            <div className="p-1 min-w-[200px]">
              {p.images?.[0] && (
                <img src={p.images[0]} alt={p.title} className="w-full h-24 object-cover rounded-lg mb-2" />
              )}
              <p className="font-semibold text-gray-900 text-sm leading-snug">{p.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.address.locality}</p>
              <p className="font-bold text-primary-600 text-sm mt-1">₹{p.rent.toLocaleString('en-IN')}/mo</p>
              <a
                href={`/property/${p._id}`}
                className="mt-2 block text-center text-xs text-primary-600 font-medium hover:underline"
              >
                View Details →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
