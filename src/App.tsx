/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  RotateCw, 
  Search, 
  MapPin, 
  Sliders, 
  ShieldAlert, 
  LifeBuoy, 
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

import { 
  LocationItem, 
  CurrentWeather, 
  HourlyForecastItem, 
  DailyForecastItem, 
  AirQualityData, 
  SevereAlert, 
  AlertThresholds, 
  AIAnalysisResult 
} from './types/weather';

import { 
  DEFAULT_LOCATIONS, 
  DEFAULT_THRESHOLDS, 
  fetchWeatherData, 
  fetchAirQuality, 
  searchLocations, 
  evaluateRealtimeAlerts, 
  requestGeminiWeatherAnalysis,
  generateDisasterSimulation 
} from './services/weatherApi';

import { soundAlert } from './utils/soundAlert';
import { TopNavigation } from './components/TopNavigation';
import { AlertBanner } from './components/AlertBanner';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { DopplerRadarView } from './components/DopplerRadarView';
import { AIWeatherAdvisor } from './components/AIWeatherAdvisor';
import { HourlyNowcast } from './components/HourlyNowcast';
import { DailyForecastView } from './components/DailyForecastView';
import { AirQualityCard } from './components/AirQualityCard';
import { EmergencyHotlinesModal } from './components/EmergencyHotlinesModal';
import { DisasterSimulationModal } from './components/DisasterSimulationModal';
import { AlertSettingsModal } from './components/AlertSettingsModal';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'overview' | 'radar' | 'forecast' | 'airquality' | 'alerts'>('overview');

  // Location State
  const [currentLocation, setCurrentLocation] = useState<LocationItem>(DEFAULT_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Weather Data State
  const [weatherData, setWeatherData] = useState<{
    current: CurrentWeather;
    hourly: HourlyForecastItem[];
    daily: DailyForecastItem[];
  } | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Alerts & Thresholds State
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const [activeAlerts, setActiveAlerts] = useState<SevereAlert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Simulation State
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [currentSimType, setCurrentSimType] = useState<string | null>(null);

  // Modals
  const [showHotlinesModal, setShowHotlinesModal] = useState<boolean>(false);
  const [showSimulationModal, setShowSimulationModal] = useState<boolean>(false);
  const [showAlertSettingsModal, setShowAlertSettingsModal] = useState<boolean>(false);

  const prevAlertCountRef = useRef<number>(0);

  // Load Real-Time Weather for current location
  const loadWeatherData = useCallback(async (loc: LocationItem) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [wData, aqData] = await Promise.all([
        fetchWeatherData(loc.lat, loc.lon),
        fetchAirQuality(loc.lat, loc.lon),
      ]);

      setWeatherData(wData);
      setAirQuality(aqData);
      setIsSimulated(false);
      setCurrentSimType(null);

      // Evaluate algorithmic real-time alerts
      const evaluated = evaluateRealtimeAlerts(wData.current, wData.hourly, aqData, loc.nameTh, thresholds);
      setActiveAlerts(evaluated);

      // Play alert chime if a new critical warning appeared and sound is enabled
      if (soundEnabled && evaluated.length > 0 && evaluated.length > prevAlertCountRef.current) {
        if (evaluated.some(a => a.severity === 'CRITICAL_EMERGENCY')) {
          soundAlert.playEmergencyAlert(3);
        } else {
          soundAlert.playChimeAlert();
        }
      }
      prevAlertCountRef.current = evaluated.length;

      setLastUpdated(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.');

      // Trigger Gemini AI Meteorological Analysis
      setIsAiLoading(true);
      requestGeminiWeatherAnalysis(
        {
          current: wData.current,
          hourly: wData.hourly,
          daily: wData.daily,
          airQuality: aqData,
        },
        loc.nameTh,
        thresholds
      )
        .then((analysis) => {
          setAiAnalysis(analysis);
        })
        .finally(() => {
          setIsAiLoading(false);
        });
    } catch (err: any) {
      console.error('Error fetching weather data:', err);
      setErrorMsg('ไม่สามารถเชื่อมต่อสถานีตรวจวัดสภาพอากาศได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, [thresholds, soundEnabled]);

  // Initial load & when location changes
  useEffect(() => {
    loadWeatherData(currentLocation);
  }, [currentLocation, loadWeatherData]);

  // Search input handler with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Location GPS Auto-Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการระบุพิกัด Geolocation');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const customLoc: LocationItem = {
          id: `gps-${latitude.toFixed(2)}-${longitude.toFixed(2)}`,
          name: 'Current GPS Location',
          nameTh: 'ตำแหน่งพิกัด GPS ปัจจุบัน',
          province: 'พื้นที่ของคุณ',
          country: 'ไทย',
          lat: latitude,
          lon: longitude,
        };
        setCurrentLocation(customLoc);
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        alert('ไม่สามารถระบุพิกัดได้ กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้งในเบราว์เซอร์');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Disaster Simulation Scenario Launcher
  const handleRunSimulation = (type: 'TYPHOON' | 'FLASH_FLOOD' | 'EXTREME_HEAT' | 'PM25_EMERGENCY') => {
    const simData = generateDisasterSimulation(type);
    setWeatherData({
      current: simData.current,
      hourly: simData.hourly,
      daily: simData.daily,
    });
    setAirQuality(simData.airQuality);
    setIsSimulated(true);
    setCurrentSimType(type);

    const evaluated = evaluateRealtimeAlerts(
      simData.current,
      simData.hourly,
      simData.airQuality,
      currentLocation.nameTh + ' (ซ้อมเตือนภัย)',
      thresholds
    );
    setActiveAlerts(evaluated);

    if (soundEnabled) {
      soundAlert.playEmergencyAlert(4);
    }

    // AI Analysis for simulation
    setIsAiLoading(true);
    requestGeminiWeatherAnalysis(
      {
        current: simData.current,
        hourly: simData.hourly,
        daily: simData.daily,
        airQuality: simData.airQuality,
      },
      currentLocation.nameTh + ' [การซ้อมรบภัยพิบัติ]',
      thresholds
    )
      .then((analysis) => {
        setAiAnalysis(analysis);
      })
      .finally(() => {
        setIsAiLoading(false);
      });
  };

  const handleResetRealData = () => {
    loadWeatherData(currentLocation);
  };

  const hasCriticalAlert = activeAlerts.some(
    (a) => a.severity === 'CRITICAL_EMERGENCY' || a.severity === 'WARNING'
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract Navigation */}
      <TopNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasCriticalAlert={hasCriticalAlert}
        onOpenSimulation={() => setShowSimulationModal(true)}
        onOpenHotlines={() => setShowHotlinesModal(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Simulation Alert Banner if in Drill Mode */}
        {isSimulated && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                <strong>โหมดจำลองสถานการณ์ภัยพิบัติ (Drill Mode Active):</strong> ข้อมูลขณะนี้เป็นการซ้อมรับมือเหตุฉุกเฉิน
              </span>
            </div>
            <button
              onClick={handleResetRealData}
              className="px-2.5 py-1 bg-slate-950 text-white rounded font-semibold text-xs hover:bg-slate-900 transition-colors shrink-0"
            >
              กลับสู่ข้อมูลจริง
            </button>
          </div>
        )}

        {/* Search Bar & Quick Location Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input with Autocomplete */}
          <div className="relative flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อจังหวัด อำเภอ หรือเมืองทั่วโลก (เช่น เชียงใหม่, ภูเก็ต, Tokyo)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
              {isSearching && (
                <RotateCw className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-800">
                {searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setCurrentLocation(loc);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-slate-800/80 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <strong className="text-white">{loc.nameTh}</strong>
                        {loc.province && <span className="text-slate-400 text-xs ml-1">({loc.province}, {loc.country})</span>}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls: Refresh, Alert Thresholds, Last Updated */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <span className="text-slate-400 hidden sm:inline font-mono-numbers">
              อัปเดตล่าสุด: {lastUpdated || 'กำลังเชื่อมต่อ...'}
            </span>

            <button
              onClick={() => loadWeatherData(currentLocation)}
              disabled={isLoading}
              title="รีเฟรชข้อมูลสภาพอากาศ"
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowAlertSettingsModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors font-medium"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>ตั้งค่าเกณฑ์เตือนภัย</span>
            </button>
          </div>
        </div>

        {/* Quick Province Shortcut Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-500 shrink-0 text-[11px] font-medium">พื้นที่หลัก:</span>
          {DEFAULT_LOCATIONS.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setCurrentLocation(loc)}
              className={`px-3 py-1 rounded-lg border transition-colors whitespace-nowrap text-xs ${
                currentLocation.id === loc.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {loc.nameTh}
            </button>
          ))}
        </div>

        {/* Error notification if failed to fetch */}
        {errorMsg && (
          <div className="p-4 bg-rose-950/40 border border-rose-600/60 rounded-xl text-xs text-rose-200 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => loadWeatherData(currentLocation)}
              className="underline font-bold"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {/* Severe Weather Alert Banner (Prominent Urgent Alert System) */}
        <AlertBanner
          alerts={activeAlerts}
          onOpenHotlines={() => setShowHotlinesModal(true)}
          soundEnabled={soundEnabled}
        />

        {/* Loading Skeleton */}
        {isLoading && !weatherData && (
          <div className="space-y-6 animate-pulse">
            <div className="h-64 bg-slate-900/80 rounded-xl border border-slate-800"></div>
            <div className="h-96 bg-slate-900/80 rounded-xl border border-slate-800"></div>
          </div>
        )}

        {/* Populated Views based on activeTab */}
        {weatherData && airQuality && (
          <>
            {/* VIEW: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Current Weather Telemetry Card */}
                <CurrentWeatherCard
                  location={currentLocation}
                  weather={weatherData.current}
                  onSelectLocation={setCurrentLocation}
                  onDetectLocation={handleDetectLocation}
                  isDetectingLocation={isDetectingLocation}
                  allLocations={DEFAULT_LOCATIONS}
                />

                {/* Live Doppler Radar View (Prominent Viewport Presence) */}
                <DopplerRadarView
                  location={currentLocation}
                  currentWeather={weatherData.current}
                  isSimulatedStorm={isSimulated && currentSimType === 'TYPHOON'}
                />

                {/* Gemini AI Weather Risk Assessment & Emergency Safety Protocol */}
                <AIWeatherAdvisor
                  analysis={aiAnalysis}
                  isLoading={isAiLoading}
                  onRefresh={() => {
                    setIsAiLoading(true);
                    requestGeminiWeatherAnalysis(
                      {
                        current: weatherData.current,
                        hourly: weatherData.hourly,
                        daily: weatherData.daily,
                        airQuality: airQuality,
                      },
                      currentLocation.nameTh,
                      thresholds
                    )
                      .then((a) => setAiAnalysis(a))
                      .finally(() => setIsAiLoading(false));
                  }}
                  locationName={currentLocation.nameTh}
                />

                {/* Hourly Nowcast 24h & Air Quality */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <HourlyNowcast hourly={weatherData.hourly} />
                  </div>
                  <div>
                    <AirQualityCard
                      airQuality={airQuality}
                      locationName={currentLocation.nameTh}
                    />
                  </div>
                </div>

                {/* 7-Day Precision Extended Outlook */}
                <DailyForecastView daily={weatherData.daily} />
              </div>
            )}

            {/* VIEW: RADAR ONLY */}
            {activeTab === 'radar' && (
              <div className="space-y-6">
                <DopplerRadarView
                  location={currentLocation}
                  currentWeather={weatherData.current}
                  isSimulatedStorm={isSimulated && currentSimType === 'TYPHOON'}
                />

                {/* Radar Telemetry Information & Interpretation Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <span>เกณฑ์การแปลผลภาพสะท้อนเรดาร์ตรวจอากาศ (Doppler dBZ Reflectivity Scale)</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-sm bg-cyan-400"></span>
                        <strong className="text-white">10 - 25 dBZ: เมฆฝนละออง</strong>
                      </div>
                      <p className="text-slate-400 leading-normal">
                        ฝนปรอยๆ หรือละอองน้ำในอากาศ อัตราฝนตก &lt; 2 มม./ชม. ไม่เป็นอุปสรรคต่อการเดินทาง
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                        <strong className="text-white">25 - 40 dBZ: ฝนปานกลาง</strong>
                      </div>
                      <p className="text-slate-400 leading-normal">
                        ฝนตกต่อเนื่อง อัตราการตก 2-10 มม./ชม. ผิวถนนเปียกลื่น ควรลดความเร็วขณะขับขี่ยานพาหนะ
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
                        <strong className="text-white">40 - 52 dBZ: ฝนตกหนัก</strong>
                      </div>
                      <p className="text-slate-400 leading-normal">
                        ฝนตกหนักสะสม 10-35 มม./ชม. ทัศนวิสัยลดต่ำ เสี่ยงน้ำท่วมขังบนถนนและพื้นที่ลุ่มต่ำ
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-sm bg-rose-600"></span>
                        <strong className="text-white">52 - 65+ dBZ: พายุรุนแรง/ลูกเห็บ</strong>
                      </div>
                      <p className="text-slate-400 leading-normal">
                        พายุฝนฟ้าคะนองรุนแรง ลมกระโชกแรงเกิน 70 กม./ชม. มีฟ้าผ่าและอาจมีลูกเห็บตก ควรหลบในอาคาร
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: ALERTS */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <AlertBanner
                  alerts={activeAlerts}
                  onOpenHotlines={() => setShowHotlinesModal(true)}
                  soundEnabled={soundEnabled}
                />

                <AIWeatherAdvisor
                  analysis={aiAnalysis}
                  isLoading={isAiLoading}
                  onRefresh={() => {
                    setIsAiLoading(true);
                    requestGeminiWeatherAnalysis(
                      {
                        current: weatherData.current,
                        hourly: weatherData.hourly,
                        daily: weatherData.daily,
                        airQuality: airQuality,
                      },
                      currentLocation.nameTh,
                      thresholds
                    )
                      .then((a) => setAiAnalysis(a))
                      .finally(() => setIsAiLoading(false));
                  }}
                  locationName={currentLocation.nameTh}
                />

                {/* Hotlines Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">
                      ต้องการความช่วยเหลือฉุกเฉิน หรือแจ้งเหตุภัยพิบัติ?
                    </h3>
                    <p className="text-xs text-slate-400">
                      ศูนย์เตือนภัยพิบัติแห่งชาติ (ปภ.) และหน่วยกู้ชีพสถาบันการแพทย์ฉุกเฉินแห่งชาติพร้อมให้บริการ 24 ชม.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowHotlinesModal(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors whitespace-nowrap flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <LifeBuoy className="w-4 h-4" />
                    <span>ดูเบอร์สายด่วน ปภ. 1784</span>
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: FORECAST */}
            {activeTab === 'forecast' && (
              <div className="space-y-6">
                <HourlyNowcast hourly={weatherData.hourly} />
                <DailyForecastView daily={weatherData.daily} />
              </div>
            )}

            {/* VIEW: AIR QUALITY */}
            {activeTab === 'airquality' && (
              <div className="space-y-6">
                <AirQualityCard
                  airQuality={airQuality}
                  locationName={currentLocation.nameTh}
                />

                {/* PM2.5 Standards Information */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white">
                    เกณฑ์มาตรฐานคุณภาพอากาศในบรรยากาศของประเทศไทย (กรมควบคุมมลพิษ)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-cyan-500/30">
                      <div className="font-bold text-cyan-400 mb-1">0 - 15.0 µg/m³</div>
                      <div className="text-slate-200 font-medium">ฟ้าใส (ดีมาก)</div>
                      <div className="text-[11px] text-slate-400 mt-1">เหมาะสำหรับกิจกรรมกลางแจ้งทุกประเภท</div>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-emerald-500/30">
                      <div className="font-bold text-emerald-400 mb-1">15.1 - 25.0 µg/m³</div>
                      <div className="text-slate-200 font-medium">เขียว (ดี)</div>
                      <div className="text-[11px] text-slate-400 mt-1">สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ</div>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-yellow-500/30">
                      <div className="font-bold text-yellow-400 mb-1">25.1 - 37.5 µg/m³</div>
                      <div className="text-slate-200 font-medium">เหลือง (ปานกลาง)</div>
                      <div className="text-[11px] text-slate-400 mt-1">ประชาชนทั่วไปทำกิจกรรมได้ กลุ่มเสี่ยงควรลดเวลา</div>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-amber-500/30">
                      <div className="font-bold text-amber-500 mb-1">37.6 - 75.0 µg/m³</div>
                      <div className="text-slate-200 font-medium">ส้ม (เริ่มมีผลกระทบ)</div>
                      <div className="text-[11px] text-slate-400 mt-1">ควรสวมหน้ากากป้องกันฝุ่น N95 เมื่อออกนอกอาคาร</div>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-lg border border-rose-500/30">
                      <div className="font-bold text-rose-500 mb-1">&gt; 75.0 µg/m³</div>
                      <div className="text-slate-200 font-medium">แดง/ม่วง (มีผลกระทบ)</div>
                      <div className="text-[11px] text-slate-400 mt-1">ทุกคนควรงดกิจกรรมกลางแจ้งเด็ดขาด</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer (No telemetry tickers, quiet and clean attribution) */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <strong className="text-slate-400 font-semibold">VAYU Alert</strong> · ระบบเตือนภัยและพยากรณ์อากาศความละเอียดสูงแบบเรียลไทม์
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>ข้อมูลจาก Open-Meteo WMO Model</span>
            <span>·</span>
            <span>เกณฑ์มาตรฐาน ปภ. กระทรวงมหาดไทย</span>
            <span>·</span>
            <span>Gemini AI Meteorological Engine</span>
          </div>
        </div>
      </footer>

      {/* Emergency Hotlines Modal */}
      <EmergencyHotlinesModal
        isOpen={showHotlinesModal}
        onClose={() => setShowHotlinesModal(false)}
      />

      {/* Disaster Drill Simulation Modal */}
      <DisasterSimulationModal
        isOpen={showSimulationModal}
        onClose={() => setShowSimulationModal(false)}
        onSelectSimulation={handleRunSimulation}
        onResetRealData={handleResetRealData}
        isSimulated={isSimulated}
        currentSimType={currentSimType}
      />

      {/* Alert Thresholds Settings Modal */}
      <AlertSettingsModal
        isOpen={showAlertSettingsModal}
        onClose={() => setShowAlertSettingsModal(false)}
        thresholds={thresholds}
        onSaveThresholds={(newThresholds) => {
          setThresholds(newThresholds);
          if (weatherData && airQuality) {
            const reEvaluated = evaluateRealtimeAlerts(
              weatherData.current,
              weatherData.hourly,
              airQuality,
              currentLocation.nameTh,
              newThresholds
            );
            setActiveAlerts(reEvaluated);
          }
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    </div>
  );
}
