import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cloud, Droplets, Sun, Moon, CloudMoon } from "lucide-react";

interface HourlyForecastProps {
  hourlyData: Array<{
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
  convertTemperature: (temp: number) => number;
  temperatureUnit: "C" | "F";
}

export function HourlyForecast({ hourlyData, convertTemperature, temperatureUnit }: HourlyForecastProps) {
  const getWeatherIcon = (iconCode: string, size = 6) => {
    const iconClass = `h-${size} w-${size}`;
    
    // Check if it's a night icon (ends with 'n')
    const isNightIcon = iconCode.endsWith('n');
    
    if (iconCode.includes("01")) {
      return isNightIcon ? 
        <Moon className={`${iconClass} text-blue-200`} /> : 
        <Sun className={`${iconClass} text-yellow-400`} />;
    }
    if (iconCode.includes("02") || iconCode.includes("03")) {
      return isNightIcon ? 
        <CloudMoon className={`${iconClass} text-blue-200`} /> : 
        <Cloud className={`${iconClass} text-gray-400`} />;
    }
    if (iconCode.includes("04")) {
      return <Cloud className={`${iconClass} text-gray-400`} />;
    }
    if (iconCode.includes("09") || iconCode.includes("10")) {
      return <Droplets className={`${iconClass} text-blue-400`} />;
    }
    
    return <Sun className={`${iconClass} text-yellow-400`} />;
  };

  const formatHour = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    
    if (date.getHours() === now.getHours() && date.getDate() === now.getDate()) {
      return "Now";
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      hour12: true 
    }).replace(/^0/, '');
  };

  const next24Hours = hourlyData.slice(0, 24);

  return (
    <Card className="glass p-6 border-white/20 mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">24-Hour Forecast</h3>
      
      <ScrollArea className="w-full">
        <div className="flex space-x-4 pb-4">
          {next24Hours.map((hour, index) => (
            <div
              key={hour.dt}
              className="flex flex-col items-center space-y-2 min-w-[80px] p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <span className="text-xs text-muted-foreground font-medium">
                {formatHour(hour.dt)}
              </span>
              
              <div className="animate-float" style={{ animationDelay: `${index * 0.1}s` }}>
                {getWeatherIcon(hour.weather[0]?.icon || "01d")}
              </div>
              
              <span className="text-sm font-semibold text-foreground">
                {convertTemperature(hour.temp)}°
              </span>
              
              {hour.pop > 0.1 && (
                <div className="flex items-center space-x-1">
                  <Droplets className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-blue-400">
                    {Math.round(hour.pop * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}