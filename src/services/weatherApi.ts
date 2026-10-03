import { 
  CurrentWeather, 
  HourlyForecastItem, 
  DailyForecastItem, 
  AirQualityData, 
  SevereAlert, 
  AlertThresholds, 
  LocationItem, 
  AIAnalysisResult 
} from '../types/weather';

export const DEFAULT_LOCATIONS: LocationItem[] = [
  { id: 'bkk', name: 'Bangkok', nameTh: 'กรุงเทพมหานคร', province: 'กรุงเทพมหานคร', country: 'ไทย', lat: 13.7563, lon: 100.5018 },
  { id: 'cnx', name: 'Chiang Mai', nameTh: 'เชียงใหม่', province: 'เชียงใหม่', country: 'ไทย', lat: 18.7883, lon: 98.9853 },
  { id: 'hkt', name: 'Phuket', nameTh: 'ภูเก็ต', province: 'ภูเก็ต', country: 'ไทย', lat: 7.8804, lon: 98.3923 },
  { id: 'kkn', name: 'Khon Kaen', nameTh: 'ขอนแก่น', province: 'ขอนแก่น', country: 'ไทย', lat: 16.4322, lon: 102.8236 },
  { id: 'chon', name: 'Chon Buri', nameTh: 'ชลบุรี (พัทยา)', province: 'ชลบุรี', country: 'ไทย', lat: 13.3611, lon: 100.9847 },
  { id: 'korat', name: 'Nakhon Ratchasima', nameTh: 'นครราชสีมา (โคราช)', province: 'นครราชสีมา', country: 'ไทย', lat: 14.9799, lon: 102.0978 },
  { id: 'hdy', name: 'Hat Yai / Songkhla', nameTh: 'สงขลา (หาดใหญ่)', province: 'สงขลา', country: 'ไทย', lat: 7.0084, lon: 100.4767 },
  { id: 'ubn', name: 'Ubon Ratchathani', nameTh: 'อุบลราชธานี', province: 'อุบลราชธานี', country: 'ไทย', lat: 15.2448, lon: 104.8473 },
  { id: 'phs', name: 'Phitsanulok', nameTh: 'พิษณุโลก', province: 'พิษณุโลก', country: 'ไทย', lat: 16.8211, lon: 100.2659 },
  { id: 'mhs', name: 'Mae Hong Son', nameTh: 'แม่ฮ่องสอน', province: 'แม่ฮ่องสอน', country: 'ไทย', lat: 19.3020, lon: 97.9654 }
];

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  rainRateMmPerHour: 20, // 20 mm/hr = ฝนตกหนักมาก เสี่ยงน้ำท่วมขัง
  windGustKmH: 50,       // 50 km/h = ลมกระโชกแรง เสี่ยงป้ายโฆษณา/กิ่งไม้หัก
  pm25Threshold: 37.5,   // 37.5 µg/m³ = เริ่มมีผลกระทบต่อสุขภาพ (มาตรฐาน ปภ. ไทย)
  heatIndexThreshold: 41 // 41°C = ระดับอันตราย (Extreme Caution / Danger)
};

/**
 * Weather description dictionary in Thai based on WMO Weather Codes
 */
export function getWeatherDescription(code: number): { text: string; icon: string; severity: 'normal' | 'caution' | 'danger' } {
  switch (code) {
    case 0:
      return { text: 'ท้องฟ้าแจ่มใส', icon: 'sun', severity: 'normal' };
    case 1:
      return { text: 'ท้องฟ้าโปร่งเกือบหมด', icon: 'sun', severity: 'normal' };
    case 2:
      return { text: 'มีเมฆเป็นบางส่วน', icon: 'cloud-sun', severity: 'normal' };
    case 3:
      return { text: 'มีเมฆมาก/มืดครึ้ม', icon: 'cloud', severity: 'normal' };
    case 45:
    case 48:
      return { text: 'มีหมอกลงจัด ทัศนวิสัยลดลง', icon: 'cloud-fog', severity: 'caution' };
    case 51:
    case 53:
      return { text: 'ฝนละอองเบาบาง', icon: 'cloud-drizzle', severity: 'normal' };
    case 55:
      return { text: 'ฝนละอองหนาแน่น', icon: 'cloud-drizzle', severity: 'caution' };
    case 61:
      return { text: 'ฝนตกเล็กน้อย', icon: 'cloud-rain', severity: 'normal' };
    case 63:
      return { text: 'ฝนตกปานกลาง', icon: 'cloud-rain', severity: 'caution' };
    case 65:
      return { text: 'ฝนตกหนักต่อเนื่อง', icon: 'cloud-heavy-rain', severity: 'danger' };
    case 80:
      return { text: 'ฝนซู่เล็กน้อยเป็นหย่อมๆ', icon: 'cloud-rain', severity: 'normal' };
    case 81:
      return { text: 'ฝนซู่ปานกลางกระจายตัว', icon: 'cloud-rain', severity: 'caution' };
    case 82:
      return { text: 'ฝนตกหนักรุนแรงเป็นบริเวณกว้าง', icon: 'cloud-lightning', severity: 'danger' };
    case 95:
      return { text: 'พายุฝนฟ้าคะนอง ลมกระโชกแรง', icon: 'zap', severity: 'danger' };
    case 96:
    case 99:
      return { text: 'พายุฤดูร้อนรุนแรง มีลูกเห็บตกและฟ้าผ่า', icon: 'zap', severity: 'danger' };
    default:
      return { text: 'สภาพอากาศแปรปรวน', icon: 'cloud', severity: 'caution' };
  }
}

/**
 * Calculates Heat Index (ดัชนีความร้อน) in Celsius using NOAA Rothfusz regression
 */
export function calculateHeatIndex(tempC: number, relativeHumidity: number): number {
  if (tempC < 27) return tempC; // Heat index only meaningful above 27°C

  // Convert to Fahrenheit for equation
  const T = (tempC * 9) / 5 + 32;
  const R = relativeHumidity;

  let HI = -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R;

  // Convert back to Celsius
  const hiC = ((HI - 32) * 5) / 9;
  return Math.round(hiC * 10) / 10;
}

/**
 * Evaluates Air Quality Index and PM2.5 levels according to Thai Pollution Control Dept.
 */
export function evaluateAirQualityLevel(pm25: number): { level: AirQualityData['level']; levelTh: string; color: string } {
  if (pm25 <= 15.0) {
    return { level: 'EXCELLENT', levelTh: 'อากาศดีมาก (ฟ้าใส)', color: 'text-cyan-400' };
  } else if (pm25 <= 25.0) {
    return { level: 'GOOD', levelTh: 'อากาศดี (ปานกลาง)', color: 'text-emerald-400' };
  } else if (pm25 <= 37.5) {
    return { level: 'MODERATE', levelTh: 'ปานกลาง (เริ่มเฝ้าระวัง)', color: 'text-yellow-400' };
  } else if (pm25 <= 75.0) {
    return { level: 'UNHEALTHY_SENSITIVE', levelTh: 'เริ่มมีผลต่อสุขภาพ (สีส้ม)', color: 'text-amber-500' };
  } else if (pm25 <= 150.0) {
    return { level: 'UNHEALTHY', levelTh: 'มีผลกระทบต่อสุขภาพ (สีแดง)', color: 'text-rose-500' };
  } else {
    return { level: 'HAZARDOUS', levelTh: 'อันตรายร้ายแรง (วิกฤต)', color: 'text-purple-500' };
  }
}

/**
 * Fetch Live Weather Data from Open-Meteo
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<{
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max&timezone=auto&forecast_days=7`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.statusText}`);
  }
  const data = await res.json();

  const c = data.current;
  const current: CurrentWeather = {
    temp: Math.round(c.temperature_2m * 10) / 10,
    apparentTemp: Math.round(c.apparent_temperature * 10) / 10,
    humidity: Math.round(c.relative_humidity_2m),
    dewPoint: Math.round((c.temperature_2m - ((100 - c.relative_humidity_2m) / 5)) * 10) / 10,
    pressure: Math.round(c.pressure_msl),
    windSpeed: Math.round(c.wind_speed_10m),
    windDirection: Math.round(c.wind_direction_10m),
    windGusts: Math.round(c.wind_gusts_10m),
    uvIndex: 0, // updated from hourly
    precipitation: Math.round(c.precipitation * 10) / 10,
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
    cloudCover: c.cloud_cover,
    visibility: 10,
    time: c.time,
  };

  // Process 24-48 hourly forecast
  const hourlyRaw = data.hourly;
  const hourly: HourlyForecastItem[] = [];
  const currentIsoHour = new Date().toISOString().slice(0, 13);
  let startIndex = hourlyRaw.time.findIndex((t: string) => t.startsWith(currentIsoHour));
  if (startIndex === -1) startIndex = 0;

  for (let i = startIndex; i < Math.min(startIndex + 24, hourlyRaw.time.length); i++) {
    const timeStr = hourlyRaw.time[i];
    const dateObj = new Date(timeStr);
    const formattedHour = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });

    hourly.push({
      time: timeStr,
      formattedHour: formattedHour + ' น.',
      temp: Math.round(hourlyRaw.temperature_2m[i]),
      apparentTemp: Math.round(hourlyRaw.apparent_temperature[i]),
      precipitationProbability: Math.round(hourlyRaw.precipitation_probability[i] || 0),
      precipitation: Math.round((hourlyRaw.precipitation[i] || 0) * 10) / 10,
      weatherCode: hourlyRaw.weather_code[i],
      windSpeed: Math.round(hourlyRaw.wind_speed_10m[i]),
      windGust: Math.round(hourlyRaw.wind_gusts_10m[i]),
      uvIndex: Math.round(hourlyRaw.uv_index[i] || 0),
      humidity: Math.round(hourlyRaw.relative_humidity_2m[i] || 0),
    });
  }

  // Set current UV index from the matching hour
  if (hourly.length > 0) {
    current.uvIndex = hourly[0].uvIndex;
  }

  // Process 7-day daily forecast
  const dailyRaw = data.daily;
  const daily: DailyForecastItem[] = [];
  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  for (let i = 0; i < dailyRaw.time.length; i++) {
    const dateStr = dailyRaw.time[i];
    const dateObj = new Date(dateStr);
    const dayName = i === 0 ? 'วันนี้' : i === 1 ? 'พรุ่งนี้' : daysOfWeek[dateObj.getDay()];

    daily.push({
      date: dateStr,
      formattedDay: dayName,
      tempMax: Math.round(dailyRaw.temperature_2m_max[i]),
      tempMin: Math.round(dailyRaw.temperature_2m_min[i]),
      weatherCode: dailyRaw.weather_code[i],
      precipitationProbabilityMax: Math.round(dailyRaw.precipitation_probability_max[i] || 0),
      precipitationSum: Math.round((dailyRaw.precipitation_sum[i] || 0) * 10) / 10,
      windGustMax: Math.round(dailyRaw.wind_gusts_10m_max[i] || 0),
      uvIndexMax: Math.round(dailyRaw.uv_index_max[i] || 0),
      sunrise: dailyRaw.sunrise[i] ? dailyRaw.sunrise[i].slice(11, 16) : '06:00',
      sunset: dailyRaw.sunset[i] ? dailyRaw.sunset[i].slice(11, 16) : '18:30',
    });
  }

  return { current, hourly, daily };
}

/**
 * Fetch Air Quality (PM2.5, PM10, AQI) from Open-Meteo Air Quality API
 */
export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch air quality');
    const data = await res.json();
    const c = data.current;

    const pm25 = Math.round((c.pm2_5 || 18) * 10) / 10;
    const pm10 = Math.round((c.pm10 || 32) * 10) / 10;
    const aqi = Math.round(c.us_aqi || pm25 * 2.5);
    const evalResult = evaluateAirQualityLevel(pm25);

    return {
      pm25,
      pm10,
      aqi,
      no2: c.nitrogen_dioxide,
      so2: c.sulphur_dioxide,
      o3: c.ozone,
      co: c.carbon_monoxide,
      level: evalResult.level,
      levelTh: evalResult.levelTh,
      color: evalResult.color,
    };
  } catch (e) {
    console.warn('Air quality API fallback', e);
    return {
      pm25: 22.4,
      pm10: 38.0,
      aqi: 72,
      level: 'GOOD',
      levelTh: 'อากาศดี (ปานกลาง)',
      color: 'text-emerald-400',
    };
  }
}

/**
 * Search Location using Open-Meteo Geocoding API
 */
export async function searchLocations(query: string): Promise<LocationItem[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=th&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((r: any) => ({
      id: `${r.id}`,
      name: r.name,
      nameTh: r.name,
      province: r.admin1 || r.country,
      country: r.country || 'ไทย',
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}

/**
 * Algorithmic Real-Time Alert Engine
 * Evaluates meteorological thresholds and active conditions
 */
export function evaluateRealtimeAlerts(
  current: CurrentWeather,
  hourly: HourlyForecastItem[],
  airQuality: AirQualityData,
  locationName: string,
  thresholds: AlertThresholds
): SevereAlert[] {
  const alerts: SevereAlert[] = [];
  const now = new Date();
  const nowStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
  const expireStr = new Date(now.getTime() + 4 * 3600 * 1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

  const heatIndex = calculateHeatIndex(current.temp, current.humidity);

  // 1. Extreme Thunderstorm & Hail Warning (WMO 95, 96, 99 or Wind Gusts > 50km/h)
  const isSevereThunderstormCode = [95, 96, 99].includes(current.weatherCode);
  const maxUpcomingGust = Math.max(...hourly.slice(0, 6).map(h => h.windGust), current.windGusts);
  
  if (isSevereThunderstormCode || current.windGusts >= thresholds.windGustKmH || maxUpcomingGust >= 60) {
    const isExtreme = current.windGusts >= 70 || current.weatherCode === 99;
    alerts.push({
      id: 'alert-thunderstorm-' + Date.now(),
      severity: isExtreme ? 'CRITICAL_EMERGENCY' : 'WARNING',
      severityTh: isExtreme ? 'เตือนภัยวิกฤตสูงสุด' : 'เตือนภัย',
      category: 'THUNDERSTORM',
      title: isExtreme ? 'ประกาศเตือนภัยพายุฤดูร้อนและลมกระโชกแรงขั้นรุนแรง' : 'เตือนภัยพายุฝนฟ้าคะนองและลมกระโชกแรง',
      headline: `ตรวจพบกลุ่มฝนฟ้าคะนอง ลมกระโชกแรงสูงถึง ${Math.max(current.windGusts, maxUpcomingGust)} กม./ชม.`,
      description: `บริเวณพื้นที่ ${locationName} ตรวจพบกระแสลมแปรปรวนรุนแรง และอาจมีลูกเห็บตกในบางพื้นที่ เสี่ยงต่ออาคารบ้านเรือน ป้ายโฆษณา และต้นไม้ใหญ่ล้มทับ`,
      issuedAt: nowStr,
      expiresAt: expireStr,
      affectedArea: locationName,
      recommendations: [
        'หลีกเลี่ยงการอยู่ในที่โล่งแจ้ง ใต้ต้นไม้ใหญ่ สิ่งปลูกสร้าง หรือป้ายโฆษณาที่ไม่แข็งแรง',
        'งดใช้อุปกรณ์สื่อสารอิเล็กทรอนิกส์กลางแจ้งขณะเกิดพายุฟ้าผ่า',
        'เกษตรกรควรตรวจตรารั้วคอกสัตว์เลี้ยงและโรงเรือนการเกษตรให้มั่นคง',
      ],
      metricsText: `ความเร็วลมกระโชกสูงสุด: ${Math.max(current.windGusts, maxUpcomingGust)} กม./ชม. | รหัสสภาพอากาศ: ${current.weatherCode}`
    });
  }

  // 2. Heavy Rain & Flash Flood Alert (Rain rate >= threshold OR sum over 6h > 45mm)
  const rainSum6h = hourly.slice(0, 6).reduce((acc, h) => acc + h.precipitation, 0);
  const maxRainRate = Math.max(...hourly.slice(0, 6).map(h => h.precipitation), current.precipitation);

  if (current.precipitation >= thresholds.rainRateMmPerHour || maxRainRate >= thresholds.rainRateMmPerHour || rainSum6h >= 45) {
    const isFloodEmergency = maxRainRate >= 40 || rainSum6h >= 75;
    alerts.push({
      id: 'alert-flood-' + Date.now(),
      severity: isFloodEmergency ? 'CRITICAL_EMERGENCY' : 'WARNING',
      severityTh: isFloodEmergency ? 'เตือนภัยวิกฤตสูงสุด' : 'เตือนภัย',
      category: 'FLASH_FLOOD',
      title: isFloodEmergency ? 'เตือนภัยฉุกเฉิน: เสี่ยงน้ำท่วมฉับพลันและน้ำป่าไหลหลาก' : 'เตือนภัย: ฝนตกหนักสะสม เสี่ยงน้ำท่วมขัง',
      headline: `ปริมาณฝนสะสมคาดการณ์ ${Math.round(rainSum6h)} มม. ใน 6 ชั่วโมงข้างหน้า`,
      description: `มีฝนตกหนักต่อเนื่อง อัตราการตกสูงสุด ${maxRainRate} มม./ชม. อาจทำให้เกิดน้ำท่วมขังบนผิวจราจร และพื้นที่ลุ่มต่ำริมตลิ่งหรือเชิงเขาเสี่ยงดินโคลนถล่ม`,
      issuedAt: nowStr,
      expiresAt: expireStr,
      affectedArea: locationName,
      recommendations: [
        'ขนย้ายสิ่งของ เครื่องใช้ไฟฟ้า และยานพาหนะขึ้นที่สูงหรือจุดปลอดภัย',
        'เฝ้าระวังระดับน้ำในลำห้วย ท่อระบายน้ำ และคูคลองใกล้ที่พักอาศัยอย่างใกล้ชิด',
        'ตรวจสอบระบบไฟ ตัดสะพานไฟในจุดที่น้ำเริ่มท่วมถึงเพื่อป้องกันไฟรั่ว',
      ],
      metricsText: `อัตราฝนสูงสุด: ${maxRainRate} มม./ชม. | ฝนสะสม 6 ชม.: ${Math.round(rainSum6h)} มม.`
    });
  }

  // 3. Extreme Heat Index Warning (ดัชนีความร้อน >= thresholds.heatIndexThreshold)
  if (heatIndex >= thresholds.heatIndexThreshold) {
    const isExtremeDanger = heatIndex >= 52;
    alerts.push({
      id: 'alert-heat-' + Date.now(),
      severity: isExtremeDanger ? 'CRITICAL_EMERGENCY' : 'WATCH',
      severityTh: isExtremeDanger ? 'เตือนภัยขั้นสูง' : 'เฝ้าระวัง',
      category: 'EXTREME_HEAT',
      title: isExtremeDanger ? 'เตือนภัยระดับวิกฤต: ดัชนีความร้อนสูงจัด เสี่ยงโรคลมแดด' : 'เฝ้าระวัง: อากาศร้อนจัด ดัชนีความร้อนสูง',
      headline: `ดัชนีความร้อน (Heat Index) พุ่งสูงแตะ ${heatIndex}°C`,
      description: `อุณหภูมิที่ร่างกายสัมผัสจริงสูงถึง ${heatIndex}°C จากอุณหภูมิอากาศ ${current.temp}°C ร่วมกับความชื้น ${current.humidity}% เสี่ยงเกิดภาวะฮีทสโตรก (Heatstroke) ตะคริวแดด และร่างกายขาดน้ำเฉียบพลัน`,
      issuedAt: nowStr,
      expiresAt: expireStr,
      affectedArea: locationName,
      recommendations: [
        'หลีกเลี่ยงการทำกิจกรรมหรือออกกำลังกายกลางแจ้งในระหว่างเวลา 11:00 - 16:00 น.',
        'ดื่มน้ำสะอาดอย่างสม่ำเสมอ ไม่ต้องรอให้กระหายน้ำ งดเครื่องดื่มแอลกอฮอล์',
        'สังเกตอาการผิดปกติ: ตัวร้อนจัด ไม่มีเหงื่อ มึนงง ชีพจรเต้นเร็ว ให้รีบเข้าที่ร่มและโทร 1669',
      ],
      metricsText: `ดัชนีความร้อน: ${heatIndex}°C | อุณหภูมิวัดจริง: ${current.temp}°C | ความชื้น: ${current.humidity}%`
    });
  }

  // 4. Hazardous Air Quality PM2.5 Alert
  if (airQuality.pm25 >= thresholds.pm25Threshold) {
    const isCriticalPM = airQuality.pm25 >= 75;
    alerts.push({
      id: 'alert-pm25-' + Date.now(),
      severity: isCriticalPM ? 'WARNING' : 'ADVISORY',
      severityTh: isCriticalPM ? 'เตือนภัย' : 'เฝ้าระวัง',
      category: 'PM25_HAZARD',
      title: isCriticalPM ? 'เตือนภัยมลพิษฝุ่น PM2.5 มีผลกระทบต่อสุขภาพ (สีแดง)' : 'เฝ้าระวังฝุ่นละอองขนาดเล็ก PM2.5 เกินเกณฑ์มาตรฐาน',
      headline: `ค่าฝุ่น PM2.5 อยู่ที่ ${airQuality.pm25} µg/m³ (AQI: ${airQuality.aqi})`,
      description: `คุณภาพอากาศในพื้นที่ ${locationName} อยู่ในเกณฑ์${airQuality.levelTh} อนุภาคฝุ่นละอองสะสมในอากาศสูง ส่งผลกระทบต่อระบบทางเดินหายใจ ดวงตา และหลอดเลือดหัวใจ`,
      issuedAt: nowStr,
      expiresAt: expireStr,
      affectedArea: locationName,
      recommendations: [
        'สวมใส่หน้ากากอนามัยชนิดป้องกันฝุ่น N95 หรือเทียบเท่าเมื่อจำเป็นต้องออกนอกอาคาร',
        'ปิดประตูหน้าต่างให้มิดชิด และเปิดเครื่องฟอกอากาศภายในบ้าน',
        'กลุ่มเสี่ยง ผู้สูงอายุ เด็กเล็ก และผู้ป่วยโรคระบบทางเดินหายใจควรงดกิจกรรมกลางแจ้งเด็ดขาด',
      ],
      metricsText: `PM2.5: ${airQuality.pm25} µg/m³ | PM10: ${airQuality.pm10} µg/m³ | US AQI: ${airQuality.aqi}`
    });
  }

  return alerts;
}

/**
 * Calls Backend Server Gemini API for In-Depth Meteorological AI Assessment
 */
export async function requestGeminiWeatherAnalysis(
  weatherData: {
    current: CurrentWeather;
    hourly: HourlyForecastItem[];
    daily: DailyForecastItem[];
    airQuality: AirQualityData;
  },
  locationName: string,
  thresholds: AlertThresholds
): Promise<AIAnalysisResult> {
  try {
    const res = await fetch('/api/gemini/analyze-weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weatherData: {
          current: weatherData.current,
          next6Hours: weatherData.hourly.slice(0, 6),
          airQuality: weatherData.airQuality,
        },
        locationName,
        alertThresholds: thresholds,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data && data.headline) {
      return data as AIAnalysisResult;
    }
    throw new Error('Invalid AI response structure');
  } catch (err) {
    console.warn('AI analysis fallback heuristic applied:', err);
    return generateLocalFallbackAIAnalysis(weatherData, locationName);
  }
}

/**
 * Intelligent Fallback Heuristic Analysis
 */
function generateLocalFallbackAIAnalysis(
  data: {
    current: CurrentWeather;
    hourly: HourlyForecastItem[];
    daily: DailyForecastItem[];
    airQuality: AirQualityData;
  },
  locationName: string
): AIAnalysisResult {
  const c = data.current;
  const hi = calculateHeatIndex(c.temp, c.humidity);
  const rainNext6h = data.hourly.slice(0, 6).reduce((sum, h) => sum + h.precipitation, 0);

  let alertLevel: AIAnalysisResult['alertLevel'] = 'NORMAL';
  let alertLevelTh = 'ปกติ';

  if (c.windGusts >= 60 || c.precipitation >= 30 || c.weatherCode === 99) {
    alertLevel = 'CRITICAL_EMERGENCY';
    alertLevelTh = 'เตือนภัยขั้นสูงสุด';
  } else if (c.windGusts >= 45 || c.precipitation >= 15 || [95, 96, 65, 82].includes(c.weatherCode)) {
    alertLevel = 'WARNING';
    alertLevelTh = 'เตือนภัย';
  } else if (hi >= 41 || data.airQuality.pm25 >= 37.5 || c.cloudCover > 80) {
    alertLevel = 'WATCH';
    alertLevelTh = 'เฝ้าระวัง';
  }

  const stormRisk = Math.min(100, Math.round(([95, 96, 99].includes(c.weatherCode) ? 80 : 15) + (c.windGusts * 0.7)));
  const floodRisk = Math.min(100, Math.round(rainNext6h * 2.2 + (c.precipitation * 3)));
  const heatRisk = Math.min(100, Math.max(0, Math.round((hi - 28) * 4.5)));
  const pmRisk = Math.min(100, Math.round(data.airQuality.pm25 * 1.3));

  return {
    alertLevel,
    alertLevelTh,
    headline: alertLevel === 'CRITICAL_EMERGENCY'
      ? `วิกฤตสภาพอากาศรุนแรงในพื้นที่ ${locationName}`
      : alertLevel === 'WARNING'
      ? `ประกาศเตือนภัยสภาวะอากาศแปรปรวนในพื้นที่ ${locationName}`
      : `รายงานประเมินความเสี่ยงสภาพอากาศประจำวัน ${locationName}`,
    situationSummary: `พื้นที่ ${locationName} มีอุณหภูมิปัจจุบัน ${c.temp}°C (รู้สึกจริง ${c.apparentTemp}°C) ความกดอากาศ ${c.pressure} hPa โดยกระแสลมมีความเร็ว ${c.windSpeed} กม./ชม. และลมกระโชกแตะ ${c.windGusts} กม./ชม. มีแนวโน้มการเปลี่ยนแปลงของกลุ่มเมฆฝนอย่างต่อเนื่องในระยะ 24 ชั่วโมงข้างหน้า`,
    riskFactors: [
      {
        type: 'ลมกระโชกแรง/พายุฤดูร้อน',
        riskPercentage: stormRisk,
        severity: stormRisk > 70 ? 'SEVERE' : stormRisk > 40 ? 'HIGH' : 'LOW',
        description: `ลมกระโชกสูงสุด ${c.windGusts} กม./ชม. อัตราเสี่ยงต่อโครงสร้างป้ายและหลังคาบ้านเรือน`,
      },
      {
        type: 'ฝนตกหนัก/น้ำท่วมฉับพลัน',
        riskPercentage: floodRisk,
        severity: floodRisk > 60 ? 'SEVERE' : floodRisk > 30 ? 'MODERATE' : 'LOW',
        description: `คาดการณ์ฝนตกสะสม 6 ชั่วโมงข้างหน้าประมาณ ${Math.round(rainNext6h)} มม.`,
      },
      {
        type: 'ดัชนีความร้อนวิกฤต',
        riskPercentage: heatRisk,
        severity: heatRisk > 70 ? 'HIGH' : heatRisk > 40 ? 'MODERATE' : 'LOW',
        description: `ดัชนีความร้อน ${hi}°C เฝ้าระวังการสูญเสียน้ำและภาวะเหนื่อยล้าจากความร้อน`,
      },
      {
        type: 'มลพิษฝุ่น PM2.5',
        riskPercentage: pmRisk,
        severity: pmRisk > 60 ? 'HIGH' : pmRisk > 30 ? 'MODERATE' : 'LOW',
        description: `ค่าฝุ่นละออง ${data.airQuality.pm25} µg/m³ ตามเกณฑ์กรมควบคุมมลพิษ`,
      },
    ],
    actionableAdvice: [
      'ตรวจเช็คการระบายน้ำรอบที่พักอาศัยและหลีกเลี่ยงการสัญจรผ่านเส้นทางน้ำท่วมขัง',
      'ติดตามการอัปเดตเรดาร์ตรวจอากาศแบบเรียลไทม์ทุก 15-30 นาที',
      'ชาร์จแบตเตอรี่โทรศัพท์มือถือและอุปกรณ์ส่องสว่างสำรองเผื่อกรณีไฟฟ้าขัดข้อง',
    ],
    vulnerableGroupsAdvice: 'เด็ก ผู้สูงอายุ และผู้ที่มีโรคประจำตัวเกี่ยวกับทางเดินหายใจหรือหัวใจ ควรพักผ่อนในอาคารที่มีการระบายอากาศที่ดี',
    evacuationPreparedness: alertLevel === 'CRITICAL_EMERGENCY' ? 'เตรียมกระเป๋าฉุกเฉิน 72 ชม. และตรวจสอบจุดรวมพลของชุมชน' : 'ยังไม่จำเป็นต้องอพยพ ให้คงความพร้อมและปฏิบัติตามคำเตือน',
    timelineForecast: 'ช่วงเวลาที่สภาพอากาศอาจเปลี่ยนแปลงรุนแรงที่สุดคือช่วง 15:00 - 20:00 น. หรือเมื่อมีความกดอากาศระลอกใหม่พัดผ่าน',
  };
}

/**
 * Generate simulated disaster scenario for training / testing
 */
export function generateDisasterSimulation(type: 'TYPHOON' | 'FLASH_FLOOD' | 'EXTREME_HEAT' | 'PM25_EMERGENCY'): {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQualityData;
} {
  const baseTime = new Date().toISOString();

  if (type === 'TYPHOON') {
    return {
      current: {
        temp: 26.5,
        apparentTemp: 32.0,
        humidity: 96,
        dewPoint: 25.8,
        pressure: 984, // deep low pressure system
        windSpeed: 58,
        windDirection: 240,
        windGusts: 92, // violent typhoon gusts
        uvIndex: 1,
        precipitation: 45.0, // torrential rain
        weatherCode: 99, // severe thunderstorm with hail
        isDay: true,
        cloudCover: 100,
        visibility: 1.2,
        time: baseTime,
      },
      hourly: Array.from({ length: 24 }).map((_, i) => ({
        time: new Date(Date.now() + i * 3600000).toISOString(),
        formattedHour: `${(new Date().getHours() + i) % 24}:00 น.`,
        temp: 25 + Math.sin(i) * 2,
        apparentTemp: 30,
        precipitationProbability: 95,
        precipitation: Math.max(10, Math.round((48 - i * 1.5) * 10) / 10),
        weatherCode: 99,
        windSpeed: Math.max(30, Math.round(65 - i * 1.2)),
        windGust: Math.max(45, Math.round(95 - i * 1.8)),
        uvIndex: 1,
        humidity: 98,
      })),
      daily: Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        formattedDay: i === 0 ? 'วันนี้ (พายุ)' : i === 1 ? 'พรุ่งนี้' : `วันที่ +${i}`,
        tempMax: 28,
        tempMin: 23,
        weatherCode: i < 2 ? 99 : 65,
        precipitationProbabilityMax: 95,
        precipitationSum: 145,
        windGustMax: 95,
        uvIndexMax: 2,
        sunrise: '06:05',
        sunset: '18:22',
      })),
      airQuality: {
        pm25: 6.2,
        pm10: 12.0,
        aqi: 25,
        level: 'EXCELLENT',
        levelTh: 'อากาศดีมาก (ฝนชะล้างฝุ่น)',
        color: 'text-cyan-400',
      },
    };
  } else if (type === 'FLASH_FLOOD') {
    return {
      current: {
        temp: 24.8,
        apparentTemp: 29.5,
        humidity: 98,
        dewPoint: 24.5,
        pressure: 1004,
        windSpeed: 28,
        windDirection: 180,
        windGusts: 48,
        uvIndex: 0,
        precipitation: 58.0, // extreme torrential deluge
        weatherCode: 65,
        isDay: false,
        cloudCover: 100,
        visibility: 0.8,
        time: baseTime,
      },
      hourly: Array.from({ length: 24 }).map((_, i) => ({
        time: new Date(Date.now() + i * 3600000).toISOString(),
        formattedHour: `${(new Date().getHours() + i) % 24}:00 น.`,
        temp: 24,
        apparentTemp: 28,
        precipitationProbability: 100,
        precipitation: Math.max(15, Math.round((60 - i * 2) * 10) / 10),
        weatherCode: 65,
        windSpeed: 25,
        windGust: 45,
        uvIndex: 1,
        humidity: 99,
      })),
      daily: Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        formattedDay: i === 0 ? 'วันนี้' : `วันที่ +${i}`,
        tempMax: 27,
        tempMin: 22,
        weatherCode: 65,
        precipitationProbabilityMax: 100,
        precipitationSum: 180,
        windGustMax: 50,
        uvIndexMax: 2,
        sunrise: '06:08',
        sunset: '18:20',
      })),
      airQuality: {
        pm25: 5.0,
        pm10: 10.0,
        aqi: 20,
        level: 'EXCELLENT',
        levelTh: 'อากาศดีมาก',
        color: 'text-cyan-400',
      },
    };
  } else if (type === 'EXTREME_HEAT') {
    return {
      current: {
        temp: 42.4, // extreme temperature
        apparentTemp: 54.2, // extreme heat index
        humidity: 68,
        dewPoint: 28.0,
        pressure: 1008,
        windSpeed: 12,
        windDirection: 120,
        windGusts: 22,
        uvIndex: 12, // extreme UV
        precipitation: 0.0,
        weatherCode: 0,
        isDay: true,
        cloudCover: 5,
        visibility: 15,
        time: baseTime,
      },
      hourly: Array.from({ length: 24 }).map((_, i) => ({
        time: new Date(Date.now() + i * 3600000).toISOString(),
        formattedHour: `${(new Date().getHours() + i) % 24}:00 น.`,
        temp: Math.min(43, 33 + Math.sin(i * 0.25) * 10),
        apparentTemp: Math.min(55, 38 + Math.sin(i * 0.25) * 16),
        precipitationProbability: 0,
        precipitation: 0,
        weatherCode: 0,
        windSpeed: 10,
        windGust: 18,
        uvIndex: i > 3 && i < 11 ? 12 : 1,
        humidity: 65,
      })),
      daily: Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        formattedDay: i === 0 ? 'วันนี้' : `วันที่ +${i}`,
        tempMax: 43,
        tempMin: 30,
        weatherCode: 0,
        precipitationProbabilityMax: 5,
        precipitationSum: 0,
        windGustMax: 25,
        uvIndexMax: 12,
        sunrise: '05:58',
        sunset: '18:35',
      })),
      airQuality: {
        pm25: 42.0,
        pm10: 68.0,
        aqi: 118,
        level: 'UNHEALTHY_SENSITIVE',
        levelTh: 'เริ่มมีผลต่อสุขภาพ (สีส้ม)',
        color: 'text-amber-500',
      },
    };
  } else {
    // PM25_EMERGENCY
    return {
      current: {
        temp: 31.0,
        apparentTemp: 34.0,
        humidity: 55,
        dewPoint: 20.0,
        pressure: 1012,
        windSpeed: 4, // stagnant air trap
        windDirection: 0,
        windGusts: 8,
        uvIndex: 6,
        precipitation: 0.0,
        weatherCode: 45, // dense smog / fog
        isDay: true,
        cloudCover: 70,
        visibility: 2.1,
        time: baseTime,
      },
      hourly: Array.from({ length: 24 }).map((_, i) => ({
        time: new Date(Date.now() + i * 3600000).toISOString(),
        formattedHour: `${(new Date().getHours() + i) % 24}:00 น.`,
        temp: 30,
        apparentTemp: 33,
        precipitationProbability: 0,
        precipitation: 0,
        weatherCode: 45,
        windSpeed: 5,
        windGust: 10,
        uvIndex: 5,
        humidity: 55,
      })),
      daily: Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString().slice(0, 10),
        formattedDay: i === 0 ? 'วันนี้' : `วันที่ +${i}`,
        tempMax: 33,
        tempMin: 22,
        weatherCode: 45,
        precipitationProbabilityMax: 0,
        precipitationSum: 0,
        windGustMax: 12,
        uvIndexMax: 7,
        sunrise: '06:12',
        sunset: '18:18',
      })),
      airQuality: {
        pm25: 184.5, // hazardous purple/crimson
        pm10: 240.0,
        aqi: 235,
        level: 'HAZARDOUS',
        levelTh: 'อันตรายร้ายแรง (วิกฤตสีม่วงเข้ม)',
        color: 'text-purple-500',
      },
    };
  }
}
