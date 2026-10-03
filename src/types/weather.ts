export interface LocationItem {
  id: string;
  name: string;
  nameTh: string;
  province?: string;
  country: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temp: number;
  apparentTemp: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  cloudCover: number;
  visibility: number;
  time: string;
}

export interface AirQualityData {
  pm25: number;
  pm10: number;
  aqi: number;
  no2?: number;
  so2?: number;
  o3?: number;
  co?: number;
  level: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'UNHEALTHY_SENSITIVE' | 'UNHEALTHY' | 'HAZARDOUS';
  levelTh: string;
  color: string;
}

export interface HourlyForecastItem {
  time: string;
  formattedHour: string;
  temp: number;
  apparentTemp: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  windGust: number;
  uvIndex: number;
  humidity: number;
}

export interface DailyForecastItem {
  date: string;
  formattedDay: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  windGustMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export type AlertSeverity = 'ADVISORY' | 'WATCH' | 'WARNING' | 'CRITICAL_EMERGENCY';

export interface SevereAlert {
  id: string;
  severity: AlertSeverity;
  severityTh: 'เฝ้าระวัง' | 'เตือนภัย' | 'เตือนภัยขั้นสูง' | 'เตือนภัยวิกฤตสูงสุด';
  category: 'THUNDERSTORM' | 'FLASH_FLOOD' | 'EXTREME_HEAT' | 'PM25_HAZARD' | 'HIGH_WIND' | 'HAIL_LIGHTNING';
  title: string;
  headline: string;
  description: string;
  issuedAt: string;
  expiresAt: string;
  affectedArea: string;
  recommendations: string[];
  metricsText: string;
}

export interface AlertThresholds {
  rainRateMmPerHour: number;
  windGustKmH: number;
  pm25Threshold: number;
  heatIndexThreshold: number;
}

export interface AIAnalysisResult {
  alertLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL_EMERGENCY';
  alertLevelTh: string;
  headline: string;
  situationSummary: string;
  riskFactors: {
    type: string;
    riskPercentage: number;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    description: string;
  }[];
  actionableAdvice: string[];
  vulnerableGroupsAdvice: string;
  evacuationPreparedness: string;
  timelineForecast: string;
}

export interface StormCell {
  id: string;
  lat: number;
  lon: number;
  intensityDbz: number;
  headingDeg: number;
  speedKmH: number;
  type: string;
}
