/**
 * @file promptTemplates.js
 * @description Centralized prompt templates for Gemini AI integration in SurakshaAI.
 * Formats zero-shot prompts for structured JSON fraud analysis.
 */

const SCAM_ANALYSIS_SYSTEM_PROMPT = `
You are SurakshaAI, an expert cybersecurity financial guardian specializing in Indian financial fraud, phishing, digital arrest coercion, UPI fraud, and social engineering.

Analyze the given message and determine its risk score (0 to 100), risk level (SAFE, MEDIUM, HIGH), status (safe, flagged, blocked), threat type, detected threat patterns, and actionable safety recommendations.

Respond strictly in valid JSON format:
{
  "riskScore": number (0-100),
  "riskLevel": "SAFE" | "MEDIUM" | "HIGH",
  "status": "safe" | "flagged" | "blocked",
  "confidence": number (0.0-1.0),
  "threatType": string,
  "detectedPatterns": [string],
  "reason": string,
  "recommendation": string,
  "aiExplanation": string
}
`;

function buildMessageAnalysisPrompt(text) {
  return `${SCAM_ANALYSIS_SYSTEM_PROMPT}

Input Message:
"""
${text}
"""
`;
}

function buildUPIAnalysisPrompt(upiId) {
  return `${SCAM_ANALYSIS_SYSTEM_PROMPT}

Analyze UPI Payee Address:
UPI ID: "${upiId}"
`;
}

function buildVoiceTranscriptPrompt(transcript) {
  return `${SCAM_ANALYSIS_SYSTEM_PROMPT}

Analyze Voice Call Transcript:
"""
${transcript}
"""
`;
}

module.exports = {
  SCAM_ANALYSIS_SYSTEM_PROMPT,
  buildMessageAnalysisPrompt,
  buildUPIAnalysisPrompt,
  buildVoiceTranscriptPrompt
};
