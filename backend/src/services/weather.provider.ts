import { env } from '@/config/env.js';
import { AppError } from '@/utils/app-error.js';

export interface WeatherProviderForecast {
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility?: number;
  cloudCoverage: number;
  uvIndex?: number;
  rainProbability: number;
  rainfall: number;
  sunrise?: Date;
  sunset?: Date;
  weatherCondition: string;
  forecastDate: Date;
  provider: string;
}

export interface WeatherProvider {
  readonly name: string;
  getForecast(input: { latitude: number; longitude: number }): Promise<WeatherProviderForecast[]>;
}

class LocalWeatherProvider implements WeatherProvider {
  readonly name = 'local';

  async getForecast(input: { latitude: number; longitude: number }): Promise<WeatherProviderForecast[]> {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + index);
      const seasonalShift = Math.sin((forecastDate.getMonth() + 1) / 12);
      const rainfall = Math.max(0, Math.round((index % 3 === 0 ? 18 : index % 2 === 0 ? 6 : 0) + seasonalShift * 4));
      const humidity = Math.min(96, Math.max(35, 58 + rainfall * 1.4 + index));
      const temperature = Math.round(27 + seasonalShift * 5 + (index % 2 ? 2 : -1));
      return {
        latitude: input.latitude,
        longitude: input.longitude,
        temperature,
        feelsLike: temperature + (humidity > 75 ? 2 : 0),
        humidity,
        pressure: 1010 - index,
        windSpeed: 8 + index * 2,
        windDirection: (90 + index * 24) % 360,
        visibility: 8000,
        cloudCoverage: rainfall > 0 ? 76 : 32,
        uvIndex: rainfall > 0 ? 4 : 8,
        rainProbability: rainfall > 0 ? Math.min(95, 45 + rainfall * 2) : 15,
        rainfall,
        sunrise: withHour(forecastDate, 6),
        sunset: withHour(forecastDate, 18),
        weatherCondition: rainfall > 15 ? 'Heavy rain' : rainfall > 0 ? 'Light rain' : temperature > 34 ? 'Hot' : 'Partly cloudy',
        forecastDate,
        provider: this.name,
      };
    });
  }
}

class OpenWeatherProvider implements WeatherProvider {
  readonly name = 'openweathermap';

  async getForecast(input: { latitude: number; longitude: number }): Promise<WeatherProviderForecast[]> {
    if (!env.openWeatherApiKey) throw new AppError('OpenWeather provider is not configured. Set OPENWEATHER_API_KEY.', 503);
    const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
    url.searchParams.set('lat', String(input.latitude));
    url.searchParams.set('lon', String(input.longitude));
    url.searchParams.set('appid', env.openWeatherApiKey);
    url.searchParams.set('units', 'metric');
    const response = await fetch(url);
    if (!response.ok) throw new AppError('Weather provider request failed.', response.status >= 500 ? 503 : 502);
    const payload = (await response.json()) as { list?: OpenWeatherItem[]; city?: { sunrise?: number; sunset?: number } };
    const byDate = new Map<string, OpenWeatherItem>();
    for (const item of payload.list ?? []) {
      const key = new Date(item.dt * 1000).toISOString().slice(0, 10);
      if (!byDate.has(key)) byDate.set(key, item);
    }
    return [...byDate.values()].slice(0, 7).map((item) => ({
      latitude: input.latitude,
      longitude: input.longitude,
      temperature: item.main.temp,
      feelsLike: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: item.wind.speed * 3.6,
      windDirection: item.wind.deg,
      visibility: item.visibility,
      cloudCoverage: item.clouds.all,
      uvIndex: undefined,
      rainProbability: Math.round((item.pop ?? 0) * 100),
      rainfall: item.rain?.['3h'] ?? 0,
      sunrise: payload.city?.sunrise ? new Date(payload.city.sunrise * 1000) : undefined,
      sunset: payload.city?.sunset ? new Date(payload.city.sunset * 1000) : undefined,
      weatherCondition: item.weather[0]?.description ?? 'Unknown',
      forecastDate: new Date(item.dt * 1000),
      provider: this.name,
    }));
  }
}

interface OpenWeatherItem {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number; deg: number };
  visibility?: number;
  clouds: { all: number };
  pop?: number;
  rain?: { '3h'?: number };
  weather: { description: string }[];
}

export function getWeatherProvider(): WeatherProvider {
  if (env.weatherProvider === 'openweathermap') return new OpenWeatherProvider();
  return new LocalWeatherProvider();
}

function withHour(date: Date, hour: number) {
  const copy = new Date(date);
  copy.setHours(hour, 0, 0, 0);
  return copy;
}

