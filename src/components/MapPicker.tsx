import React, { useState, useRef, useEffect, useCallback } from 'react';
import 'ol/ol.css';
import styles from './MapPicker.module.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import { Feature } from 'ol';
import { Point, Circle } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';

interface MapPickerProps {
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

const defaultCenter = {
  lat: 13.7563, // กรุงเทพมหานคร
  lng: 100.5018
};

// ฟังก์ชันสำหรับจัดการ daily quota
const getDailyQuota = () => {
  // แปลงเวลาเป็นประเทศไทย (UTC+7)
  const now = new Date();
  const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const today = thaiTime.toISOString().split('T')[0];
  const quotaKey = `google_maps_quota_${today}`;
  const quota = localStorage.getItem(quotaKey);
  return quota ? parseInt(quota) : 0;
};

const incrementDailyQuota = () => {
  // แปลงเวลาเป็นประเทศไทย (UTC+7)
  const now = new Date();
  const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const today = thaiTime.toISOString().split('T')[0];
  const quotaKey = `google_maps_quota_${today}`;
  const currentQuota = getDailyQuota();
  localStorage.setItem(quotaKey, (currentQuota + 1).toString());
};

const isQuotaExceeded = () => {
  const dailyLimit = parseInt(import.meta.env.VITE_GOOGLE_MAPS_DAILY_LIMIT || '1000');
  return getDailyQuota() >= dailyLimit;
};

export const MapPicker: React.FC<MapPickerProps> = ({
  address,
  province,
  district,
  subdistrict,
  onLocationSelect,
  initialLat,
  initialLng
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [pendingCoordinate, setPendingCoordinate] = useState<number[] | null>(null);
  const [isQuotaReached, setIsQuotaReached] = useState(isQuotaExceeded());
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const circleLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const popupContentRef = useRef<HTMLDivElement>(null);

  // สร้าง marker style พร้อมแสดงพิกัด
  const createMarkerStyle = (coordinate: number[]) => {
    const [lon, lat] = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    return new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: '#0c4cb3' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      text: new Text({
        text: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        offsetY: -15,
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 3 }),
        font: '14px Arial'
      })
    });
  };

  // สร้าง circle style
  const createCircleStyle = () => {
    return new Style({
      stroke: new Stroke({
        color: '#0c4cb3',
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(59, 130, 246, 0.3)'
      })
    });
  };

  // อัพเดท marker และ circle
  const updateMarkerAndCircle = useCallback((coordinate: number[]) => {
    if (!markerLayerRef.current || !circleLayerRef.current) return;

    const markerSource = markerLayerRef.current.getSource();
    const circleSource = circleLayerRef.current.getSource();

    if (!markerSource || !circleSource) return;

    // อัพเดท marker พร้อมพิกัด
    const markerFeature = new Feature({
      geometry: new Point(coordinate)
    });
    markerFeature.setStyle(createMarkerStyle(coordinate));
    markerSource.clear();
    markerSource.addFeature(markerFeature);

    // อัพเดท circle (รัศมี 800 เมตร)
    const circleFeature = new Feature({
      geometry: new Circle(coordinate, 800)
    });
    circleSource.clear();
    circleSource.addFeature(circleFeature);

    // อัพเดท current location
    const [lon, lat] = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    setCurrentLocation({ lat, lng: lon });
  }, []);

  // ค้นหาตำแหน่งจากที่อยู่ด้วย Google Geocoding API
  const geocodeAddress = useCallback(async () => {
    if (isQuotaReached) {
      alert('ขออภัย ระบบไม่สามารถค้นหาตำแหน่งได้ในขณะนี้ เนื่องจากเกินโควต้าที่กำหนดไว้ กรุณาลองใหม่ในวันถัดไป');
      return;
    }

    console.log('Calling Google Geocoding API...');
    const fullAddress = `${address} ${subdistrict} ${district} ${province}`;
    const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${googleApiKey}&language=th`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log('Google Geocoding API response:', data);

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const coordinate = fromLonLat([lng, lat]);
        
        // เพิ่มจำนวนการใช้งาน
        incrementDailyQuota();
        setIsQuotaReached(isQuotaExceeded());
        
        // เปิด popup และตั้งค่าแผนที่
        setIsPopupOpen(true);
        setPendingCoordinate(coordinate);
      } else {
        alert('ไม่พบตำแหน่งที่ระบุ กรุณาตรวจสอบที่อยู่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('เกิดข้อผิดพลาดในการค้นหาตำแหน่ง กรุณาลองใหม่อีกครั้ง');
    }
  }, [address, subdistrict, district, province, isQuotaReached]);

  // สร้าง map
  useEffect(() => {
    if (!isPopupOpen || !mapRef.current || mapInstanceRef.current) return;

    // สร้าง marker layer
    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({
      source: markerSource
    });
    markerLayerRef.current = markerLayer;

    // สร้าง circle layer
    const circleSource = new VectorSource();
    const circleLayer = new VectorLayer({
      source: circleSource,
      style: createCircleStyle()
    });
    circleLayerRef.current = circleLayer;

    // กำหนดจุดศูนย์กลางเริ่มต้นและ zoom
    let initialMapCenter = fromLonLat([defaultCenter.lng, defaultCenter.lat]);
    let initialMapZoom = 13;

    if (initialLat !== undefined && initialLng !== undefined) {
      initialMapCenter = fromLonLat([initialLng, initialLat]);
      initialMapZoom = 15;
    }

    // สร้าง map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        markerLayer,
        circleLayer
      ],
      view: new View({
        center: initialMapCenter,
        zoom: initialMapZoom,
        maxZoom: 19
      })
    });

    mapInstanceRef.current = map;
    map.updateSize();

    // เพิ่ม click event
    map.on('click', (event) => {
      const coordinate = event.coordinate;
      updateMarkerAndCircle(coordinate);
    });

    // หากมีพิกัดเริ่มต้น ให้ตั้ง marker และ circle
    if (initialLat !== undefined && initialLng !== undefined) {
      const coordinate = fromLonLat([initialLng, initialLat]);
      updateMarkerAndCircle(coordinate);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [isPopupOpen, initialLat, initialLng, updateMarkerAndCircle]);

  // จัดการ pending coordinate เมื่อ map พร้อม
  useEffect(() => {
    if (pendingCoordinate && mapInstanceRef.current && markerLayerRef.current && circleLayerRef.current) {
      updateMarkerAndCircle(pendingCoordinate);
      mapInstanceRef.current.getView().setCenter(pendingCoordinate);
      mapInstanceRef.current.getView().setZoom(15);
      setPendingCoordinate(null);
    }
  }, [pendingCoordinate, updateMarkerAndCircle]);

  // เปิด Google Maps ในแท็บใหม่
  const openInGoogleMaps = useCallback(() => {
    if (currentLocation) {
      const { lat, lng } = currentLocation;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  }, [currentLocation]);

  // ยืนยันตำแหน่ง
  const handleConfirm = useCallback(() => {
    if (currentLocation) {
      onLocationSelect(currentLocation.lat, currentLocation.lng);
      setIsPopupOpen(false);
    }
  }, [currentLocation, onLocationSelect]);

  // Scroll to popup when it opens
  useEffect(() => {
    if (isPopupOpen && popupContentRef.current) {
      popupContentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isPopupOpen]);

  return (
    <div>
      <button
        className={`${styles.searchButton} ${isQuotaReached ? styles.disabledButton : ''}`}
        onClick={geocodeAddress}
        disabled={!address || !province || !district || !subdistrict || isQuotaReached}
      >
        {isQuotaReached ? 'ไม่พร้อมใช้งาน' : 'เลือกตำแหน่งบนแผนที่'}
      </button>

      {isPopupOpen && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent} ref={popupContentRef}>
            <div className={styles.popupHeader}>
              <h3>เลือกตำแหน่งบนแผนที่</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsPopupOpen(false)}
                aria-label="ปิด"
              >
                ×
              </button>
            </div>

            <div className={styles.mapContainer} ref={mapRef}>
              {!mapInstanceRef.current && (
                <div className={styles.loading}>
                  กำลังโหลดแผนที่...
                </div>
              )}
            </div>

            <div className={styles.instructions}>
              <p>• คลิกบนแผนที่เพื่อเลือกตำแหน่ง</p>
              <p>• รัศมีวงกลมแสดงระยะทาง 800 เมตร</p>
              {currentLocation && (
                <p>• พิกัดปัจจุบัน: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
              )}
              <p>• จำนวนการใช้งานวันนี้: {getDailyQuota()}/{import.meta.env.VITE_GOOGLE_MAPS_DAILY_LIMIT}</p>
            </div>

            <div className={styles.popupActions}>
              <button
                className={styles.confirmButton}
                onClick={handleConfirm}
                disabled={!currentLocation}
              >
                ยืนยันตำแหน่ง
              </button>
              {currentLocation && (
                <button
                  className={styles.confirmButton}
                  onClick={openInGoogleMaps}
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  เปิดใน Google Maps
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 