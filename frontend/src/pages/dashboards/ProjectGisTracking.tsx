import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api/client';
import { Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Custom icons based on status
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const iconLive = createIcon('#3b82f6'); // blue
const iconCompleted = createIcon('#22c55e'); // green
const iconDelayed = createIcon('#ef4444'); // red
const iconPending = createIcon('#eab308'); // yellow

const ProjectGisTracking: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGis = async () => {
      try {
        const res = await api.get('/gis/projects');
        setProjects(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGis();
  }, []);

  const getIcon = (proj: any) => {
    if (proj.status === 'COMPLETED') return iconCompleted;
    if (proj.status === 'PROPOSED' || proj.status === 'UNDER_APPROVAL') return iconPending;
    
    // Simple delay logic: if end date has passed and not completed
    if (proj.endDate && new Date(proj.endDate) < new Date() && proj.status !== 'COMPLETED') {
      return iconDelayed;
    }
    
    return iconLive; // IN_PROGRESS, AWARDED, etc.
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading GIS data...</div>;
  }

  // Center around Haryana
  const center = [29.0588, 76.0856] as [number, number];

  return (
    <div className="h-[calc(100vh-64px)] w-full relative">
      {/* Overlay Stats Card */}
      <div className="absolute top-4 left-14 z-[400] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-64">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">GIS Tracking</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Live Projects</span>
            <span className="ml-auto font-bold text-gray-800 dark:text-white">
              {projects.filter(p => ['AWARDED', 'IN_PROGRESS', 'TENDER_PUBLISHED'].includes(p.status)).length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Delayed</span>
            <span className="ml-auto font-bold text-gray-800 dark:text-white">
              {projects.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.status !== 'COMPLETED').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-300">Completed</span>
            <span className="ml-auto font-bold text-gray-800 dark:text-white">
              {projects.filter(p => p.status === 'COMPLETED').length}
            </span>
          </div>
        </div>
      </div>

      <MapContainer center={center} zoom={7} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {projects.map((proj) => {
          if (!proj.coordinates || !proj.coordinates.lat || !proj.coordinates.lng) return null;
          
          return (
            <Marker 
              key={proj._id} 
              position={[proj.coordinates.lat, proj.coordinates.lng]}
              icon={getIcon(proj)}
            >
              <Popup>
                <div className="w-64 p-1">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{proj.name}</h3>
                      <p className="text-xs text-gray-500">{proj.projectId}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Status</span>
                      <span className="font-semibold text-gray-800">{proj.status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Est. Cost</span>
                      <span className="font-semibold text-gray-800">₹{proj.estimatedCost?.toLocaleString()}</span>
                    </div>
                    
                    {proj.overallProgress !== undefined && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-800">{proj.overallProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${proj.overallProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ProjectGisTracking;
