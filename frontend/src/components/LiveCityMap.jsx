import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

// Fix for default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const getMarkerIcon = (priority, status) => {
  let color = '#3b82f6'; // blue
  if (status === 'resolved') color = '#22c55e'; // green
  else if (priority === 'emergency' || priority === 'critical') color = '#ef4444'; // red
  else if (priority === 'high') color = '#f59e0b'; // orange/yellow

  const svgIcon = `
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.7C17.3 17 20 13 20 10C20 5.6 16.4 2 12 2C7.6 2 4 5.6 4 10C4 13 6.7 17 12 21.7Z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="10" r="3" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

export function LiveCityMap({ tickets = [], center = [40.7128, -74.0060], zoom = 13 }) {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {tickets.map((ticket) => {
          const loc = ticket.metadata?.location;
          if (!loc || !loc.lat || !loc.lng) return null;

          return (
            <Marker 
              key={ticket._id} 
              position={[loc.lat, loc.lng]} 
              icon={getMarkerIcon(ticket.priority, ticket.status)}
              eventHandlers={{
                click: () => {
                  // Optional: focus logic
                }
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      ticket.priority === 'emergency' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-primary/20 text-primary border-primary/30'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-gray-400">
                      {ticket.ticket_code}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{ticket.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">{ticket.description}</p>
                  
                  <button 
                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                    className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 px-1">Map Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-gray-300">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Emergency / Critical</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-300">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-300">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Medium / Low</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-300">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
