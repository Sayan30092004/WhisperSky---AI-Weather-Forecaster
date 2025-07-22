import { Card } from "@/components/ui/card";
import { Cloud, Droplets, Eye, Gauge, Sun, Wind, Moon, CloudMoon } from "lucide-react";

interface WeatherDisplayProps {
  weatherData: {
    current: {
      temp: number;
      feels_like: number;
      humidity: number;
      pressure: number;
      uvi: number;
      visibility: number;
      wind_speed: number;
      weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
      }>;
    };
    daily: Array<{
      temp: {
        min: number;
        max: number;
      };
    }>;
  };
  location: {
    name: string;
    country: string;
    address?: string;
    lat: number;
    lon: number;
  };
  temperatureUnit: "C" | "F";
  convertTemperature: (temp: number) => number;
}

export function WeatherDisplay({ 
  weatherData, 
  location, 
  temperatureUnit, 
  convertTemperature 
}: WeatherDisplayProps) {
  const currentWeather = weatherData.current;
  const todayMinMax = weatherData.daily[0];

  const getWeatherIcon = (iconCode: string) => {
    // Calculate local time at the weather location
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const locationTimezoneOffset = Math.round(location.lon / 15);
    const localTime = new Date(utc + (locationTimezoneOffset * 3600000));
    const hour = localTime.getHours();
    const isNight = hour >= 20 || hour <= 5;
    
    const iconMap: { [key: string]: JSX.Element } = {
      // Clear sky
      "01d": <Sun className="h-16 w-16 text-yellow-400" />,
      "01n": isNight ? <Moon className="h-16 w-16 text-blue-200" /> : <Sun className="h-16 w-16 text-yellow-300" />,
      
      // Few clouds
      "02d": <Cloud className="h-16 w-16 text-gray-300" />,
      "02n": isNight ? <CloudMoon className="h-16 w-16 text-blue-200" /> : <Cloud className="h-16 w-16 text-gray-400" />,
      
      // Scattered clouds
      "03d": <Cloud className="h-16 w-16 text-gray-400" />,
      "03n": isNight ? <CloudMoon className="h-16 w-16 text-blue-300" /> : <Cloud className="h-16 w-16 text-gray-500" />,
      
      // Broken clouds
      "04d": <Cloud className="h-16 w-16 text-gray-500" />,
      "04n": <Cloud className="h-16 w-16 text-gray-600" />,
      
      // Shower rain
      "09d": <Droplets className="h-16 w-16 text-blue-400" />,
      "09n": <Droplets className="h-16 w-16 text-blue-500" />,
      
      // Rain
      "10d": <Droplets className="h-16 w-16 text-blue-300" />,
      "10n": <Droplets className="h-16 w-16 text-blue-400" />,
    };
    
    // For clear sky during calculated night time, show moon
    if (isNight && (iconCode === "01d" || currentWeather.weather[0]?.main.toLowerCase() === "clear")) {
      return <Moon className="h-16 w-16 text-blue-200" />;
    }
    
    // For partly cloudy during calculated night time, show moon with cloud
    if (isNight && (iconCode === "02d" || currentWeather.weather[0]?.main.toLowerCase() === "clouds")) {
      return <CloudMoon className="h-16 w-16 text-blue-200" />;
    }
    
    return iconMap[iconCode] || <Sun className="h-16 w-16 text-yellow-400" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Main Temperature Display */}
      <Card className="lg:col-span-2 glass p-8 border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {location.name}
              {location.country && `, ${location.country}`}
            </h1>
            {location.address && (
              <p className="text-sm text-muted-foreground mb-1">
                {location.address}
              </p>
            )}
            <p className="text-lg text-muted-foreground capitalize">
              {currentWeather.weather[0]?.description || "Clear sky"}
            </p>
          </div>
          <div className="animate-float">
            {getWeatherIcon(currentWeather.weather[0]?.icon || "01d")}
          </div>
        </div>

        <div className="flex items-baseline space-x-4 mb-6">
          <span className="text-6xl md:text-8xl font-bold text-foreground">
            {convertTemperature(currentWeather.temp)}°
          </span>
          <span className="text-2xl text-muted-foreground">
            {temperatureUnit}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Feels like</span>
            <span className="font-semibold text-foreground">
              {convertTemperature(currentWeather.feels_like)}°{temperatureUnit}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Today</span>
            <span className="font-semibold text-foreground">
              {convertTemperature(todayMinMax.temp.min)}° / {convertTemperature(todayMinMax.temp.max)}°{temperatureUnit}
            </span>
          </div>
        </div>
      </Card>

      {/* Weather Stats */}
      <Card className="glass p-6 border-white/20">
        <h3 className="text-lg font-semibold text-foreground mb-4">Weather Details</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Wind</span>
            </div>
            <span className="font-medium text-foreground">
              {Math.round(currentWeather.wind_speed * 3.6)} km/h
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Humidity</span>
            </div>
            <span className="font-medium text-foreground">
              {currentWeather.humidity}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pressure</span>
            </div>
            <span className="font-medium text-foreground">
              {currentWeather.pressure} hPa
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Visibility</span>
            </div>
            <span className="font-medium text-foreground">
              {Math.round(currentWeather.visibility / 1000)} km
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">UV Index</span>
            </div>
            <span className="font-medium text-foreground">
              {Math.round(currentWeather.uvi)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}