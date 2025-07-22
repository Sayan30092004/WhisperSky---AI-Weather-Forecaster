import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Shirt, MapPin, Umbrella, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface WeatherChatbotProps {
  weatherData: any;
  location: any;
}

export function WeatherChatbot({ weatherData, location }: WeatherChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi! I'm your weather assistant. I can help you with outfit suggestions and places to visit based on the current weather in ${location?.name || "your area"}. How can I help you today?`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Initialize Google Generative AI
  const genAI = new GoogleGenerativeAI("AIzaSyCWuacdRTNbzQ2Dr9ttOAHGB1SLSxd0dFc");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 200
    }
  });

  const quickActions = [
    { label: "Outfit Suggestion", icon: Shirt, action: "What should I wear in this weather?" },
    { label: "Places to Visit", icon: MapPin, action: "What are good places to visit in this weather?" },
    { label: "Weather Tips", icon: Umbrella, action: "Give me some weather tips for today" },
    { label: "UV Protection", icon: Sun, action: "What UV protection do I need today?" }
  ];

  const generateBotResponse = async (userMessage: string) => {
    setIsTyping(true);

    try {
      const currentTemp = weatherData?.current?.temp || 20;
      const weatherCondition = weatherData?.current?.weather[0]?.main || "Clear";
      const humidity = weatherData?.current?.humidity || 50;
      const windSpeed = weatherData?.current?.wind_speed || 5;
      const uvIndex = weatherData?.current?.uvi || 3;
      
      const prompt = `You are a helpful weather assistant for ${location?.name || "the user's location"}. 
      Current weather: ${Math.round(currentTemp)}°C, ${weatherCondition.toLowerCase()}, humidity ${humidity}%, wind speed ${windSpeed} km/h, UV index ${uvIndex}.
      The user asked: "${userMessage}".
      Provide a helpful, concise response focusing on weather-related advice, outfit suggestions, or activity recommendations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "API Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      });
      return "I'm having trouble generating a response right now. Please try again later.";
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    try {
      const botResponse = await generateBotResponse(message);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in conversation flow:", error);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg glass border-white/20 text-foreground hover:bg-white/20 transition-all duration-300 animate-float ${isOpen ? "scale-0" : "scale-100"}`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <Card className="w-full max-w-md h-[600px] glass border-white/20 flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Weather Assistant</h3>
                  <p className="text-xs text-muted-foreground">Always here to help!</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.isBot
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="p-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.action}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.action)}
                    className="glass border-white/20 text-foreground hover:bg-white/20 text-xs"
                  >
                    <action.icon className="h-3 w-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about weather..."
                  className="flex-1 glass border-white/20 text-foreground placeholder:text-muted-foreground bg-white/10"
                  disabled={isTyping}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!inputMessage.trim() || isTyping}
                  className="glass border-white/20 text-foreground hover:bg-white/20"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}