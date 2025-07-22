import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import axios from "axios";

interface LocationData {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
}

export function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const API_KEY = "43b15cdbc8d8351284f46a4ff722034f";
      
      {
        const response = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=5&appid=${API_KEY}`
        );
        
        const locations: LocationData[] = response.data.map((item: any) => ({
          lat: item.lat,
          lon: item.lon,
          name: item.name,
          country: item.country,
          state: item.state
        }));
        
        setSuggestions(locations);
      }
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching locations:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchLocations(value);
  };

  const handleLocationSelect = (location: LocationData) => {
    setQuery(`${location.name}, ${location.country}`);
    setShowSuggestions(false);
    setSuggestions([]);
    onLocationSelect(location);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleLocationSelect(suggestions[0]);
    }
  };

  return (
    <div className="relative flex-1 max-w-md">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for a city..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 glass border-white/20 text-foreground placeholder:text-muted-foreground bg-white/10"
          />
        </div>
        <Button 
          type="submit" 
          variant="outline" 
          size="icon"
          disabled={isSearching || suggestions.length === 0}
          className="glass border-white/20 text-foreground hover:bg-white/20"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 glass border-white/20 z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            {suggestions.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">
                    {location.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {location.state ? `${location.state}, ` : ""}{location.country}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}