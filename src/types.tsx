export type weather = "солнечно" | "облачно" | "дождь"

export type CurrentUnits = {
  time: string;
  interval: string;
  temperature_2m: string;
  wind_speed_10m: string;
}

export type Current = {
  time: string;
  interval: number;
  temperature_2m: number;
  wind_speed_10m: number;
}

export type HourlyUnits = {
  time: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  wind_speed_10m: string;
  weather_code: string;
}

export type Hourly = {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  wind_speed_10m: number[];
  weather_code: number[];
}

export type DailyUnits = {
  time: string;
  temperature_2m_max: string;
  temperature_2m_min: string;
  weather_code: string;
  precipitation_probability_max: string;
}

export type Daily = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
}

export type WeatherResponse = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: CurrentUnits;
  current: Current;
  hourly_units: HourlyUnits;
  hourly: Hourly;
  daily_units: DailyUnits;
  daily: Daily;
}