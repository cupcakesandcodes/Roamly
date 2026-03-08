import { GoogleGenerativeAI } from "@google/generative-ai";

// For development, we'll look for the API key in import.meta.env
const API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

export const generateItinerary = async (destination, days, travelers, budget, persona = 'traveler') => {
  if (!model) {
    throw new Error("AI Model not initialized. Please check your VITE_GOOGLE_GEMINI_AI_API_KEY.");
  }

  const personaInstruction = persona === 'agent'
    ? `ACT AS A PROFESSIONAL GROUP TRAVEL DESIGNER creating a premium leisure travel package for a group of ${travelers} people. Focus on group logistics, cost estimation per person, and ensuring the total plan stays within the ${budget} budget. Include estimated costs in activity notes. Use professional travel-industry language. The title should be a premium package name (e.g., 'Amalfi Coast Signature Group Experience').`
    : `ACT AS A FUN PERSONAL TRAVEL GUIDE. Create an exciting, experiential, leisure-focused trip plan. Focus on Instagrammable spots, hidden local gems, fun activities, and relaxation. Use friendly, vibrant language. The title should be exciting (e.g., 'Epic Amalfi Coast Adventure').`;

  const prompt = `
    ${personaInstruction}

    Destination: ${destination}
    Duration: ${days} days
    Group Size: ${travelers} travelers
    Total Budget: ${budget}
    
    The response must be a valid JSON object with the following structure:
    {
      "tripName": "A premium package name fitting your persona",
      "days": [
        {
          "dayNumber": 1,
          "title": "A theme for the day",
          "activities": [
            {
              "name": "Activity Name",
              "time": "HH:MM (24h format)",
              "duration": "e.g., 1.5 hours",
              "location": "Specific place name",
              "notes": "${persona === 'agent' ? 'Include: estimated cost per person, group logistics details, and any booking requirements' : 'Fun, exciting description for the traveler'}"
            }
          ]
        }
      ]
    }

    ${persona === 'agent' ? `
    IMPORTANT AGENT RULES:
    1. This is NOT a business/corporate trip. It is a LEISURE travel package being designed by a travel agent for clients.
    2. Include estimated cost per person in the notes for each activity.
    3. Plan activities that work well for a group of ${travelers} people.
    4. Keep the total estimated cost within the ${budget} budget.
    5. Include practical logistics like transport between activities.
    ` : `
    TRAVELER RULES:
    1. Focus on fun, memorable experiences.
    2. Include local food recommendations and hidden gems.
    3. Keep it casual and exciting.
    `}
    Return ONLY the valid JSON object.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse JSON from the response text (handling potential markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};

export const updateItinerary = async (currentItinerary, chatMessage) => {
  if (!model) {
    throw new Error("AI Model not initialized.");
  }

  const prompt = `
    You are an expert travel assistant. Here is the current travel itinerary in JSON format:
    ${JSON.stringify(currentItinerary, null, 2)}

    The user has a request to update this itinerary: "${chatMessage}"

    Your task is to modify the existing JSON itinerary to reflect the user's request while maintaining the exact same JSON structure.
    
    Structure keys:
    {
      "tripName": "...",
      "days": [
        {
          "dayNumber": 1,
          "title": "...",
          "activities": [
            {
              "name": "...",
              "time": "...",
              "duration": "...",
              "location": "...",
              "notes": "..."
            }
          ]
        }
      ]
    }

    Rules:
    1. Return ONLY the updated JSON.
    2. Maintain logical flow and realistic timings.
    3. If the user asks for more days, add them. If they ask to remove something, remove it.
    4. Ensure the JSON remains valid.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Error updating itinerary:", error);
    throw error;
  }
};
