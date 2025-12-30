
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Answer, GradingResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async gradeShortAnswer(question: Question, answer: Answer): Promise<GradingResult> {
    try {
      const prompt = `
        You are an expert academic examiner for the Ladtem Commission. 
        Your task is to grade a student's short answer response fairly and accurately.

        Question: "${question.text}"
        Rubric/Ideal Answer Guidelines: "${question.rubric || 'Accuracy, clarity, and relevance.'}"
        Student's Answer: "${answer.value}"
        Maximum Points for this Question: ${question.points}

        Please provide:
        1. A numeric score (0 to ${question.points}).
        2. Detailed pedagogical feedback to help the student improve.
        3. Flag any potential anomalies (e.g., if the answer seems nonsensical or copied verbatim from a known source).
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "The numeric score awarded." },
              feedback: { type: Type.STRING, description: "Detailed narrative feedback." },
              anomaliesDetected: { type: Type.BOOLEAN, description: "True if plagiarism or strange patterns detected." }
            },
            required: ["score", "feedback"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return {
        score: result.score || 0,
        feedback: result.feedback || "Graded by AI.",
        anomaliesDetected: !!result.anomaliesDetected
      };
    } catch (error) {
      console.error("Gemini Grading Error:", error);
      return { score: 0, feedback: "Error during AI evaluation." };
    }
  }

  async generateOverallFeedback(examTitle: string, score: number, totalPoints: number): Promise<string> {
    try {
      const prompt = `
        Generate a motivating and professional feedback summary for a student who completed the exam "${examTitle}".
        Score: ${score} out of ${totalPoints}.
        Provide encouragement and areas for potential future study.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      return response.text || "Good effort on your examination.";
    } catch (error) {
      return "Evaluation complete.";
    }
  }
}

export const geminiService = new GeminiService();
