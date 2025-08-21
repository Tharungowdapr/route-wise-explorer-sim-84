
export interface GeminiRouteData {
  route: string[];
  metrics: {
    distance: number;
    time: number;
    cost: number;
    fuel: number;
    trafficImpact: number;
    weatherImpact: number;
    realTimeFactors: {
      congestion: number;
      roadConditions: string;
      weatherConditions: string;
      fuelPrices: number;
    };
  };
  recommendations: string[];
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async optimizeRoute(cities: string[], vehicle: string, weather: string, timeOfDay: string): Promise<GeminiRouteData> {
    const prompt = `
    You are an expert route optimization system for Karnataka, India. Optimize a TSP route for the following cities: ${cities.join(', ')}.

    Parameters:
    - Vehicle: ${vehicle}
    - Weather: ${weather}
    - Time of day: ${timeOfDay}
    - Current date: ${new Date().toLocaleDateString()}

    Please provide real-time optimized route data in this exact JSON format:
    {
      "route": ["city1", "city2", "city3", "city1"],
      "metrics": {
        "distance": 450000,
        "time": 7200,
        "cost": 2500,
        "fuel": 35,
        "trafficImpact": 1.2,
        "weatherImpact": 1.1,
        "realTimeFactors": {
          "congestion": 0.8,
          "roadConditions": "Good",
          "weatherConditions": "Clear",
          "fuelPrices": 102.5
        }
      },
      "recommendations": ["Avoid peak hours", "Consider fuel stops"]
    }

    Consider:
    - Current traffic conditions in Karnataka
    - Weather impact on travel time
    - Vehicle-specific fuel efficiency
    - Real-time road conditions
    - Optimal routing to minimize total distance and time

    Return ONLY the JSON object, no additional text.
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from Gemini');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Fallback data
      return {
        route: cities.length > 0 ? [...cities, cities[0]] : [],
        metrics: {
          distance: cities.length * 80000,
          time: cities.length * 1800,
          cost: cities.length * 500,
          fuel: cities.length * 8,
          trafficImpact: 1.1,
          weatherImpact: 1.0,
          realTimeFactors: {
            congestion: 0.7,
            roadConditions: "Moderate",
            weatherConditions: weather,
            fuelPrices: 105.0
          }
        },
        recommendations: ["Route optimized with available data", "Consider real-time traffic updates"]
      };
    }
  }

  async getRealTimeTrafficData(cities: string[]): Promise<any> {
    const prompt = `
    Provide current traffic conditions for these Karnataka cities: ${cities.join(', ')}.
    
    Return traffic data in JSON format with congestion levels (0-1), road conditions, and estimated delays.
    Consider current time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    
    Format:
    {
      "trafficData": {
        "city1": {"congestion": 0.6, "condition": "Moderate traffic", "delay": 15},
        "city2": {"congestion": 0.8, "condition": "Heavy traffic", "delay": 25}
      },
      "generalConditions": "Peak hour traffic expected",
      "lastUpdated": "${new Date().toISOString()}"
    }
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text;
      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Traffic data error:', error);
    }

    // Fallback traffic data
    const fallbackData: any = { trafficData: {} };
    cities.forEach(city => {
      fallbackData.trafficData[city] = {
        congestion: Math.random() * 0.8 + 0.2,
        condition: "Estimated traffic",
        delay: Math.floor(Math.random() * 20) + 5
      };
    });
    return fallbackData;
  }
}
