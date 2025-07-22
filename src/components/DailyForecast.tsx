import { Card } from "@/components/ui/card";
import { Cloud, Droplets, Sun, Moon, CloudMoon } from "lucide-react";

interface DailyForecastProps {
  dailyData: Array<{
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
  convertTemperature: (temp: number) => number;
  temperatureUnit: "C" | "F";
}

export function DailyForecast({ dailyData, convertTemperature, temperatureUnit }: DailyForecastProps) {
  const getWeatherIcon = (iconCode: string) => {
    // Check if it's a night icon (ends with 'n')
    const isNightIcon = iconCode.endsWith('n');
    
    if (iconCode.includes("01")) {
      return isNightIcon ? 
        <Moon className="h-6 w-6 text-blue-200" /> : 
        <Sun className="h-6 w-6 text-yellow-400" />;
    }
    if (iconCode.includes("02") || iconCode.includes("03")) {
      return isNightIcon ? 
        <CloudMoon className="h-6 w-6 text-blue-200" /> : 
        <Cloud className="h-6 w-6 text-gray-400" />;
    }
    if (iconCode.includes("04")) {
      return <Cloud className="h-6 w-6 text-gray-400" />;
    }
    if (iconCode.includes("09") || iconCode.includes("10")) {
      return <Droplets className="h-6 w-6 text-blue-400" />;
    }
    
    return <Sun className="h-6 w-6 text-yellow-400" />;
  };

  const formatDay = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const next7Days = dailyData.slice(0, 7);

  return (
    <Card className="glass p-6 border-white/20">
      <h3 className="text-lg font-semibold text-foreground mb-4">7-Day Forecast</h3>
      
      <div className="space-y-3">
        {next7Days.map((day, index) => (
          <div
            key={day.dt}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center space-x-4 flex-1">
              <span className="text-sm font-medium text-foreground min-w-[80px]">
                {formatDay(day.dt)}
              </span>
              
              <div className="animate-float" style={{ animationDelay: `${index * 0.1}s` }}>
                {getWeatherIcon(day.weather[0]?.icon || "01d")}
              </div>
              
              <span className="text-sm text-muted-foreground capitalize">
                {day.weather[0]?.description || "Clear sky"}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {day.pop > 0.1 && (
                <div className="flex items-center space-x-1">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-400">
                    {Math.round(day.pop * 100)}%
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">
                  {convertTemperature(day.temp.min)}°
                </span>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-red-400 rounded-full"></div>
                <span className="font-semibold text-foreground">
                  {convertTemperature(day.temp.max)}°{temperatureUnit}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}