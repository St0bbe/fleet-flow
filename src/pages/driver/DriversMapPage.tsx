import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Users } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DriverLocation {
  id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  last_updated: string;
  driver_name?: string;
}

export default function DriversMapPage() {
  const { user, driverRecord } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.CircleMarker>>({});
  const [locations, setLocations] = useState<DriverLocation[]>([]);

  // Share own location
  useEffect(() => {
    if (!user || !driverRecord) return;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase.from('driver_locations').upsert({
          driver_id: driverRecord.id,
          user_id: user.id,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          last_updated: new Date().toISOString(),
        }, { onConflict: 'driver_id' });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, driverRecord]);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from('driver_locations')
        .select('*, driver:drivers(name)');
      if (data) {
        setLocations(data.map(d => ({
          ...d,
          driver_name: (d.driver as any)?.name || 'Motorista',
        })));
      }
    };
    fetchLocations();

    const channel = supabase
      .channel('driver-locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' }, () => {
        fetchLocations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Init map
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    const map = L.map(mapRef.current).setView([-15.7801, -47.9292], 4);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    locations.forEach(loc => {
      const isMe = driverRecord?.id === loc.driver_id;
      const marker = L.circleMarker([loc.latitude, loc.longitude], {
        radius: 10,
        fillColor: isMe ? '#22c55e' : 'hsl(215, 80%, 28%)',
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
      marker.bindPopup(`<strong>${loc.driver_name}</strong>${isMe ? ' (Você)' : ''}`);
      markersRef.current[loc.driver_id] = marker;
    });

    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.latitude, l.longitude] as L.LatLngTuple));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [locations, driverRecord]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-heading font-bold">Localização dos Motoristas</h1>
          <p className="text-muted-foreground text-sm">{locations.length} motorista(s) online</p>
        </div>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <div ref={mapRef} className="h-[500px] md:h-[600px] w-full" />
      </div>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-success inline-block" /> Você
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-primary inline-block" /> Outros motoristas
        </span>
      </div>
    </div>
  );
}
