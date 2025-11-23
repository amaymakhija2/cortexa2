
import { GoogleGenAI } from "@google/genai";
import { PracticeMetrics, LiveNote } from "../types";

const processEnvApiKey = process.env.API_KEY;

export const generateLiveNotes = async (metrics: PracticeMetrics): Promise<LiveNote[]> => {
  if (!processEnvApiKey) {
    console.warn("API Key not found. Returning mock data.");
    return [
      { id: '1', text: "Revenue is slightly under goal; consider strategies to reduce cancellations." },
      { id: '2', text: "Compliance risk detected: Urgent attention needed for unsigned notes." }
    ];
  }

  const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

  const prompt = `
    Analyze the following practice performance metrics for January:
    
    1. ${metrics.revenue.label}: ${metrics.revenue.value} (${metrics.revenue.subtext}) - Status: ${metrics.revenue.status}
    2. ${metrics.sessions.label}: ${metrics.sessions.value} (${metrics.sessions.subtext}) - Status: ${metrics.sessions.status}
    3. ${metrics.clientGrowth.label}: ${metrics.clientGrowth.value} (${metrics.clientGrowth.subtext}) - Status: ${metrics.clientGrowth.status}
    4. ${metrics.attendance.label}: ${metrics.attendance.value} (${metrics.attendance.subtext}) - Status: ${metrics.attendance.status}
    5. ${metrics.compliance.label}: ${metrics.compliance.value} (${metrics.compliance.subtext}) - Status: ${metrics.compliance.status}

    Generate 2 concise, professional executive insights for the practice manager.
    Focus on critical areas first (Compliance, Attendance, Revenue) and offer actionable next steps.
    Keep them under 25 words each.
    Return the response as a valid JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const notesArray: string[] = JSON.parse(text);
    
    return notesArray.map((note, index) => ({
      id: `gen-${index}-${Date.now()}`,
      text: note
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [
      { id: 'err1', text: "Compliance alert: Immediate action required for unsigned clinician notes." },
      { id: 'err2', text: "Revenue gap identified; focus on rebooking to improve attendance rates." }
    ];
  }
};
