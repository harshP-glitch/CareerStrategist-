
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ResumeReport, SkillScore, CareerPathNode, JobMarketTrend, ApplicationBundle } from "../types";

/**
 * Highly accurate LinkedIn Sync using Search Grounding with source extraction.
 */
export const syncLinkedInProfile = async (profileUrl: string, identityContext?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    ACT AS: Professional Data Auditor.
    OBJECTIVE: Extract profile data for the individual associated with this EXACT URL: ${profileUrl}.
    IDENTITY ANCHOR (MUST MATCH): ${identityContext || 'None provided'}.
    
    STRICT RULES:
    1. ONLY extract information visible in search snippets for this specific URL.
    2. DO NOT GUESS roles or names if not explicitly found.
    3. CHECK: Does the person match the identity anchor "${identityContext}"?
    4. If there is ANY doubt, set "matchConfirmed" to false.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            headline: { type: Type.STRING },
            bio: { type: Type.STRING },
            skills: { type: Type.STRING },
            matchConfirmed: { type: Type.BOOLEAN, description: "True only if the AI is 95% certain the data belongs to the provided URL." }
          },
          required: ["name", "headline", "bio", "skills", "matchConfirmed"]
        }
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Search Result",
      uri: chunk.web?.uri || ""
    })).filter((s: any) => s.uri) || [];

    const data = JSON.parse(response.text || "{}");
    return { ...data, sources };
  } catch (error) {
    console.error("LinkedIn Sync Error:", error);
    throw error;
  }
};

/**
 * Parses resume text into profile fields using EVIDENCE-ONLY extraction.
 */
export const parseResumeToProfile = async (resumeText: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    STRICT EXTRACTION TASK: 
    Extract data from the provided resume text. 
    
    CRITICAL INSTRUCTIONS:
    - DO NOT HALLUCINATE. 
    - DO NOT guess a role like 'Software Engineer' if it is not explicitly written.
    - If the name is missing, return "Unknown".
    - If no target role is clear, return "Role Not Identified".
    - ONLY use words found in the text below.
    - Treat the text as potentially noisy or fragmented.

    RESUME TEXT:
    """
    ${resumeText}
    """
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            targetRole: { type: Type.STRING },
            bio: { type: Type.STRING },
            skills: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER, description: "Scale 0-100 on how readable the resume text was." }
          },
          required: ["name", "targetRole", "bio", "skills", "confidenceScore"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Resume Parse Error:", error);
    throw error;
  }
};

export const scoutJobs = async (userSkills: string[], targetRole: string): Promise<ApplicationBundle[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const searchResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find 5 current, active job openings for ${targetRole} that require skills like ${userSkills.join(', ')}. Provide company names and URLs.`,
    config: { tools: [{ googleSearch: {} }] },
  });
  const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const prompt = `
    Based on these job search results: ${JSON.stringify(groundingChunks)}
    And the user's target role: ${targetRole}
    Generate a list of 5 job application "Backtrack Bundles" in JSON format.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            url: { type: Type.STRING },
            tailoredPitch: { type: Type.STRING },
            matchReason: { type: Type.STRING },
            suggestedAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              }
            }
          },
          required: ["company", "role", "url", "tailoredPitch", "matchReason"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]").map((item: any) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    status: 'prepared',
    timestamp: new Date()
  }));
};

export const getCareerAdvice = async (message: string, history: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: "You are a world-class Career Strategist. Provide actionable, data-driven advice." },
  });
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const searchJobMarket = async (query: string): Promise<JobMarketTrend> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Job market trends and openings for: ${query}.`,
    config: { tools: [{ googleSearch: {} }] },
  });
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => ({ title: chunk.web?.title || "Source", uri: chunk.web?.uri || "" }))
    .filter((s: any) => s.uri) || [];
  return { title: query, summary: response.text || "No summary available.", sources };
};

export const analyzeResume = async (resumeText: string, targetRole?: string): Promise<ResumeReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    EVALUATION TASK: Analyze this resume against the target role: ${targetRole || 'General'}.
    
    STRICT RULES:
    - Base findings ONLY on the provided resume text.
    - If the resume text is corrupted or unreadable, give a low score and state why.
    - Do not assume skills that are not written.

    RESUME:
    ${resumeText}
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          skillsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedRoles: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["overallScore", "strengths", "improvements", "skillsFound", "suggestedRoles"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getCareerRoadmap = async (current: string, goal: string): Promise<CareerPathNode[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate a 4-step professional roadmap from ${current} to ${goal}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            salaryRange: { type: Type.STRING },
            difficulty: { type: Type.NUMBER },
            description: { type: Type.STRING },
            keySkills: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["role", "salaryRange", "difficulty", "description", "keySkills"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getSkillGapAnalysis = async (skills: string[], targetRole: string): Promise<SkillScore[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Compare skills: [${skills.join(', ')}] for role: ${targetRole}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            current: { type: Type.NUMBER },
            market: { type: Type.NUMBER }
          },
          required: ["name", "current", "market"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};
