import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';

interface ReadOnlyMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number | string;
}

export const ReadOnlyMap: React.FC<ReadOnlyMapProps> = ({ lat, lng, zoom = 15, height = 320 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setTarget(undefined);
      mapInstanceRef.current = null;
    }

    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({ source: markerSource });

    // Marker style
    const markerFeature = new Feature({ geometry: new Point(fromLonLat([lng, lat])) });
    markerFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: '#0c4cb3' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        }),
        text: new Text({
          text: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          offsetY: -15,
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          font: '14px Arial'
        })
      })
    );
    markerSource.addFeature(markerFeature);

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        markerLayer
      ],
      view: new View({
        center: fromLonLat([lng, lat]),
        zoom,
        maxZoom: 19
      }),
      controls: []
    });
    mapInstanceRef.current = map;
    map.updateSize();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height, borderRadius: 10, boxShadow: '0 1px 4px #bae6fd33', margin: '0 auto' }}
    />
  );
}; 