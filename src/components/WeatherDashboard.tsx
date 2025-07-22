import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WeatherDisplay } from "./WeatherDisplay";
import { HourlyForecast } from "./HourlyForecast";
import { DailyForecast } from "./DailyForecast";
import { WeatherChatbot } from "./WeatherChatbot";
import { LocationSearch } from "./LocationSearch";
import { Search, MapPin, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface WeatherData {
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
  hourly: Array<{
    dt: number;
    temp: number;
    pop: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
  daily: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    pop: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

interface LocationData {
  lat: number;
  lon: number;
  name: string;
  country: string;
  address?: string;
}

export function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<"C" | "F">("C");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get user's current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({
            lat: latitude,
            lon: longitude,
            name: "Current Location",
            country: ""
          });
          fetchWeatherData(latitude, longitude);
          fetchLocationAddress(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your current location. Please search for a city.",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please search for a city.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      
      const API_KEY = "43b15cdbc8d8351284f46a4ff722034f";
      
      // Use the free Current Weather API (2.5) and 5-day forecast
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        )
      ]);

      // Transform the data to match our interface
      const currentWeather = currentResponse.data;
      const forecastData = forecastResponse.data;

      // Create hourly data from 5-day forecast (3-hour intervals)
      const hourlyData = forecastData.list.slice(0, 24).map((item: any) => ({
        dt: item.dt,
        temp: item.main.temp,
        pop: item.pop || 0,
        weather: item.weather
      }));

      // Create daily data from forecast
      const dailyData = [];
      const processedDays = new Set();
      
      for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000).toDateString();
        if (!processedDays.has(date) && dailyData.length < 7) {
          processedDays.add(date);
          dailyData.push({
            dt: item.dt,
            temp: {
              day: item.main.temp,
              min: item.main.temp_min,
              max: item.main.temp_max,
            },
            pop: item.pop || 0,
            weather: item.weather
          });
        }
      }

      const transformedData = {
        current: {
          temp: currentWeather.main.temp,
          feels_like: currentWeather.main.feels_like,
          humidity: currentWeather.main.humidity,
          pressure: currentWeather.main.pressure,
          uvi: 0, // Not available in free API
          visibility: currentWeather.visibility / 1000, // Convert to km
          wind_speed: currentWeather.wind.speed,
          weather: currentWeather.weather
        },
        hourly: hourlyData,
        daily: dailyData
      };

      setWeatherData(transformedData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast({
        title: "Weather Data Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationAddress = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=43b15cdbc8d8351284f46a4ff722034f`
      );
      
      if (response.data && response.data.length > 0) {
        const locationData = response.data[0];
        setCurrentLocation(prev => prev ? {
          ...prev,
          name: locationData.name || "Current Location",
          country: locationData.country || "",
          address: `${locationData.name}${locationData.state ? `, ${locationData.state}` : ''}${locationData.country ? `, ${locationData.country}` : ''}`
        } : null);
      }
    } catch (error) {
      console.error("Error fetching location address:", error);
      // Fallback to a simple address format
      setCurrentLocation(prev => prev ? {
        ...prev,
        address: `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
      } : null);
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    setCurrentLocation(location);
    fetchWeatherData(location.lat, location.lon);
  };

  const convertTemperature = (temp: number) => {
    if (temperatureUnit === "F") {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => prev === "C" ? "F" : "C");
  };

  const getWeatherBackground = () => {
    if (!weatherData || !currentLocation) return "gradient-cloudy";
    
    const weatherMain = weatherData.current.weather[0]?.main.toLowerCase();
    
    // Calculate local time at the weather location using timezone offset
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    // Get timezone offset for the location (approximate based on longitude)
    const locationTimezoneOffset = Math.round(currentLocation.lon / 15); // 15 degrees per hour
    const localTime = new Date(utc + (locationTimezoneOffset * 3600000));
    const hour = localTime.getHours();
    
    // Determine if it's day or night at the location
    const isDaytime = hour >= 6 && hour <= 18;
    const isDawn = hour >= 5 && hour <= 7;
    const isSunset = hour >= 17 && hour <= 19;
    const isNight = hour >= 20 || hour <= 5;
    
    // Time-based backgrounds take priority
    if (isDawn) return "gradient-dawn";
    if (isSunset) return "gradient-sunset";
    if (isNight) return "gradient-night";
    
    // Weather-based backgrounds for daytime only
    if (isDaytime) {
      switch (weatherMain) {
        case "clear": return "gradient-sunny";
        case "clouds": return "gradient-cloudy";
        case "rain": 
        case "drizzle": 
        case "thunderstorm": return "gradient-rainy";
        case "snow": return "gradient-snowy";
        default: return "gradient-cloudy";
      }
    }
    
    // For nighttime, always show night background regardless of weather
    return "gradient-night";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
        <Card className="glass p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg text-foreground">Loading weather data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen weather-bg ${getWeatherBackground()} transition-all duration-1000`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleTemperatureUnit}
              className="glass border-white/20 text-foreground hover:bg-white/20"
            >
              <Thermometer className="h-4 w-4 mr-1" />
              °{temperatureUnit}
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <LocationSearch onLocationSelect={handleLocationSelect} />
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              className="glass border-white/20 text-foreground hover:bg-white/20"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Weather Display */}
        {weatherData && currentLocation && (
          <WeatherDisplay
            weatherData={weatherData}
            location={currentLocation}
            temperatureUnit={temperatureUnit}
            convertTemperature={convertTemperature}
          />
        )}

        {/* Hourly Forecast */}
        {weatherData && (
          <HourlyForecast
            hourlyData={weatherData.hourly}
            convertTemperature={convertTemperature}
            temperatureUnit={temperatureUnit}
          />
        )}

        {/* Daily Forecast */}
        {weatherData && (
          <DailyForecast
            dailyData={weatherData.daily}
            convertTemperature={convertTemperature}
            temperatureUnit={temperatureUnit}
          />
        )}
      </div>

      {/* Weather Chatbot */}
      <WeatherChatbot weatherData={weatherData} location={currentLocation} />
    </div>
  );
}