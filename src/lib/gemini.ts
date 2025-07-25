// import { GoogleGenerativeAI } from '@google/generative-ai';
// import { env } from './env';

// const genAI = new GoogleGenerativeAI(env.VITE_GEMINI_API_KEY);

// export const generateFeedback = async (transcript: string, role: string, candidateName: string) => {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   // Clean and validate transcript
//   const cleanTranscript = transcript?.trim() || 'Interview completed successfully';
  
//   console.log('Generating feedback with:', { 
//     transcriptLength: cleanTranscript.length, 
//     role, 
//     candidateName 
//   });
  
//   // Enhanced prompt: include candidate background and personal details for richer feedback
//   const prompt = `
//     You are an expert interviewer and hiring analyst. 

//     Interview Details:
//     - Position: ${role}
//     - Candidate Name: ${candidateName}
//     - (Below you will find the live interview transcript, which includes the candidate's answers about their name, work experience, education, and all other details you asked for in the beginning, as well as all technical and behavioral interview questions and answers.)

//     Interview Transcript:
//     ${cleanTranscript}

//     TASK: 
//     1. Summarize the candidate's background (education, years of experience, and any relevant details stated in the beginning).
//     2. Evaluate and comment on their communication skills and how they described themselves.
//     3. Provide a detailed, personalized interview evaluation based on both personal background and technical answers.

//     Please return feedback as pure JSON with the following fields:

//     {
//       "overallRating": "Score between 1 and 10",
//       "summary": "A comprehensive summary that incorporates both the technical and personal details provided, including your impression of the candidate.",
//       "strengths": [ "Biggest strengths/best parts you noticed" ],
//       "weaknesses": [ "Areas to improve based on BOTH background and answers" ],
//       "improvements": [ "Concrete, personalized suggestions" ],
//       "technicalSkills": "Technical skills evaluation, including relevant background info",
//       "communicationSkills": "Assessment of their communication and how they described themselves",
//       "recommendations": "Clear development plan and next steps, based on ALL info provided",
//       "backgroundSummary": "Short summary of their education, experience, and background you collected in the interview",
//       "interviewInsights": "Notable impressions or personality traits revealed",
//       "nextSteps": "What the candidate should do next for best results"
//     }

//     Return valid JSON only, no text outside JSON.
//   `;

//   try {
//     console.log('Sending request to Gemini API...');

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.log('Raw Gemini response received:', text);

//     // Extract and parse JSON
//     let jsonText = text.trim();

//     // Remove markdown formatting if present
//     if (jsonText.includes('```json')) {
//       const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
//       if (match) {
//         jsonText = match[1].trim();
//       }
//     } else if (jsonText.includes('```')) {
//       const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
//       if (match) {
//         jsonText = match[1].trim();
//       }
//     }

//     // Find JSON boundaries
//     const startIndex = jsonText.indexOf('{');
//     const endIndex = jsonText.lastIndexOf('}');

//     if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
//       jsonText = jsonText.substring(startIndex, endIndex + 1);
//     }

//     let feedbackData;
//     try {
//       feedbackData = JSON.parse(jsonText);
//       console.log('Successfully parsed feedback:', feedbackData);
//     } catch (parseError) {
//       console.error('JSON parsing failed. Raw response:', jsonText);
      
//       // Fallback: return default feedback structure
//       feedbackData = {
//         overallRating: "7",
//         summary: "The interview was completed successfully. The candidate demonstrated engagement and responded to questions appropriately.",
//         strengths: [
//           "Showed up prepared for the interview",
//           "Engaged actively in the conversation",
//           "Demonstrated willingness to learn"
//         ],
//         weaknesses: [
//           "Could improve technical depth in responses",
//           "May benefit from more structured answers"
//         ],
//         improvements: [
//           "Practice technical interview questions",
//           "Work on providing more detailed examples"
//         ],
//         technicalSkills: "The candidate showed basic technical understanding with room for growth in specific areas.",
//         communicationSkills: "Good communication skills with clear articulation of thoughts and ideas.",
//         recommendations: "Continue practicing interview skills and focus on technical preparation for future opportunities.",
//         interviewInsights: "The candidate demonstrated good interview presence and professionalism.",
//         nextSteps: "Focus on technical skill development and practice more interview scenarios."
//       };
//     }

//     // Validate and ensure all required fields
//     const requiredFields = [
//       "overallRating", "summary", "strengths", "weaknesses", 
//       "improvements", "technicalSkills", "communicationSkills", "recommendations"
//     ];

//     const missingFields = requiredFields.filter(field => !feedbackData[field]);
    
//     if (missingFields.length > 0) {
//       console.warn('Some fields missing, using defaults for:', missingFields);
      
//       // Fill in missing fields with defaults
//       if (!feedbackData.overallRating) feedbackData.overallRating = "7";
//       if (!feedbackData.summary) feedbackData.summary = "Interview completed with satisfactory performance.";
//       if (!feedbackData.strengths) feedbackData.strengths = ["Demonstrated engagement", "Showed professionalism"];
//       if (!feedbackData.weaknesses) feedbackData.weaknesses = ["Room for improvement in technical depth"];
//       if (!feedbackData.improvements) feedbackData.improvements = ["Continue practicing interview skills"];
//       if (!feedbackData.technicalSkills) feedbackData.technicalSkills = "Basic technical understanding demonstrated.";
//       if (!feedbackData.communicationSkills) feedbackData.communicationSkills = "Clear communication throughout the interview.";
//       if (!feedbackData.recommendations) feedbackData.recommendations = "Focus on continued learning and skill development.";
//     }

//     // Ensure arrays are properly formatted
//     if (!Array.isArray(feedbackData.strengths)) {
//       feedbackData.strengths = [feedbackData.strengths || "Professional demeanor"];
//     }
//     if (!Array.isArray(feedbackData.weaknesses)) {
//       feedbackData.weaknesses = [feedbackData.weaknesses || "Areas for growth identified"];
//     }
//     if (!Array.isArray(feedbackData.improvements)) {
//       feedbackData.improvements = [feedbackData.improvements || "Continue skill development"];
//     }

//     // Add optional fields if missing
//     if (!feedbackData.interviewInsights) {
//       feedbackData.interviewInsights = "The candidate showed good interview preparation and engagement.";
//     }
//     if (!feedbackData.nextSteps) {
//       feedbackData.nextSteps = "Focus on areas identified for improvement and continue professional development.";
//     }

//     console.log('Feedback validation completed successfully');
//     return feedbackData;

//   } catch (error: any) {
//     console.error('Error generating feedback:', error);
    
//     // Return a fallback response instead of throwing
//     return {
//       overallRating: "6",
//       summary: "Interview session completed. Due to technical limitations, this is a standard feedback response. The candidate participated in the interview process.",
//       strengths: [
//         "Participated actively in the interview",
//         "Demonstrated professionalism",
//         "Engaged with the interview process"
//       ],
//       weaknesses: [
//         "Unable to assess specific areas due to technical issues",
//         "Recommend scheduling a follow-up for detailed feedback"
//       ],
//       improvements: [
//         "Continue practicing interview skills",
//         "Prepare for technical questions in your field"
//       ],
//       technicalSkills: "Technical assessment was not fully completed due to system limitations.",
//       communicationSkills: "Basic communication assessment completed during the interview session.",
//       recommendations: "Continue developing both technical and soft skills. Consider scheduling additional practice sessions.",
//       interviewInsights: "Interview process completed with standard engagement level.",
//       nextSteps: "Review common interview questions and practice responses for future opportunities."
//     };
//   }
// };

// export const generateInterviewerQuestion = async (conversation: string, role: string, language: 'en' | 'hi' = 'en') => {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   const prompt = `
// You are an AI interviewer for a ${role} position. 
// Your job is to conduct a realistic mock interview.
// ${language === 'hi'
//   ? 'Conduct the interview entirely in Hindi. All questions and instructions should be in Hindi.'
//   : 'Conduct the interview in English.'}
// - Start by asking the candidate for their full name.
// - Then ask about their years of experience and background.
// - After that, proceed to technical and behavioral questions relevant to the ${role} role.
// - Only ask one question at a time, based on the candidate's previous answer.
// - Do NOT provide feedback or evaluation until the interview is over.
// - Stay friendly, concise, and professional.

// Conversation so far:
// ${conversation}

// Based on the above, what is the next question you should ask? Respond ONLY with the next question.
// `;

//   const result = await model.generateContent(prompt);
//   return result.response.text().trim();
// };









import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env';

// Helper to try multiple Gemini API keys for a given call
async function tryGeminiKeys(keys: string[], fn: (apiKey: string) => Promise<any>) {
  let lastError;
  for (const key of keys) {
    if (!key) continue;
    try {
      return await fn(key);
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';
      // Try next key if error is API key/authorization/quota related
      if (/API key|quota|exhaust|rate|limit|429|insufficient|invalid/i.test(msg)) {
        console.warn('Gemini API key failed or exhausted, trying next key...');
        continue;
      }
      // For other errors, do not fallback
      throw err;
    }
  }
  throw lastError || new Error('All Gemini API keys failed');
}

// ---------------------- Feedback Generator ----------------------

export const generateFeedback = async (transcript: string, role: string, candidateName: string) => {
  const cleanTranscript = transcript?.trim() || 'Interview completed successfully';
  const prompt = `
    You are an expert interviewer and hiring analyst.

    Interview Details:
    - Position: ${role}
    - Candidate Name: ${candidateName}
    - (Below you will find the live interview transcript, which includes the candidate's answers about their name, work experience, education, and all other details you asked for in the beginning, as well as all technical and behavioral interview questions and answers.)

    Interview Transcript:
    ${cleanTranscript}

    TASK: 
    1. Summarize the candidate's background (education, years of experience, and any relevant details stated in the beginning).
    2. Evaluate and comment on their communication skills and how they described themselves.
    3. Provide a detailed, personalized interview evaluation based on both personal background and technical answers.

    Please return feedback as pure JSON with the following fields:

    {
      "overallRating": "Score between 1 and 10",
      "summary": "A comprehensive summary that incorporates both the technical and personal details provided, including your impression of the candidate.",
      "strengths": [ "Biggest strengths/best parts you noticed" ],
      "weaknesses": [ "Areas to improve based on BOTH background and answers" ],
      "improvements": [ "Concrete, personalized suggestions" ],
      "technicalSkills": "Technical skills evaluation, including relevant background info",
      "communicationSkills": "Assessment of their communication and how they described themselves",
      "recommendations": "Clear development plan and next steps, based on ALL info provided",
      "backgroundSummary": "Short summary of their education, experience, and background you collected in the interview",
      "interviewInsights": "Notable impressions or personality traits revealed",
      "nextSteps": "What the candidate should do next for best results"
    }

    Return valid JSON only, no text outside JSON.
  `;

  return tryGeminiKeys(env.VITE_GEMINI_FEEDBACK_API_KEYS, async (apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Sending request to Gemini API (feedback key)...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Raw Gemini response received:', text);
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) jsonText = match[1].trim();
    } else if (jsonText.includes('```')) {
      const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (match) jsonText = match[1].trim();
    }
    const startIndex = jsonText.indexOf('{');
    const endIndex = jsonText.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      jsonText = jsonText.substring(startIndex, endIndex + 1);
    }
    let feedbackData;
    try {
      feedbackData = JSON.parse(jsonText);
      console.log('Successfully parsed feedback:', feedbackData);
    } catch (parseError) {
      console.error('JSON parsing failed. Raw response:', jsonText);
      feedbackData = {
        overallRating: "7",
        summary: "The interview was completed successfully. The candidate demonstrated engagement and responded to questions appropriately.",
        strengths: ["Showed up prepared for the interview", "Engaged actively in the conversation", "Demonstrated willingness to learn"],
        weaknesses: ["Could improve technical depth in responses", "May benefit from more structured answers"],
        improvements: ["Practice technical interview questions", "Work on providing more detailed examples"],
        technicalSkills: "The candidate showed basic technical understanding with room for growth in specific areas.",
        communicationSkills: "Good communication skills with clear articulation of thoughts and ideas.",
        recommendations: "Continue practicing interview skills and focus on technical preparation for future opportunities.",
        interviewInsights: "The candidate demonstrated good interview presence and professionalism.",
        nextSteps: "Focus on technical skill development and practice more interview scenarios.",
      };
    }
    const requiredFields = [
      "overallRating", "summary", "strengths", "weaknesses", 
      "improvements", "technicalSkills", "communicationSkills", "recommendations"
    ];
    const missingFields = requiredFields.filter(field => !feedbackData[field]);
    if (missingFields.length > 0) {
      console.warn('Some fields missing, using defaults for:', missingFields);
      if (!feedbackData.overallRating) feedbackData.overallRating = "7";
      if (!feedbackData.summary) feedbackData.summary = "Interview completed with satisfactory performance.";
      if (!feedbackData.strengths) feedbackData.strengths = ["Demonstrated engagement", "Showed professionalism"];
      if (!feedbackData.weaknesses) feedbackData.weaknesses = ["Room for improvement in technical depth"];
      if (!feedbackData.improvements) feedbackData.improvements = ["Continue practicing interview skills"];
      if (!feedbackData.technicalSkills) feedbackData.technicalSkills = "Basic technical understanding demonstrated.";
      if (!feedbackData.communicationSkills) feedbackData.communicationSkills = "Clear communication throughout the interview.";
      if (!feedbackData.recommendations) feedbackData.recommendations = "Focus on continued learning and skill development.";
    }
    if (!Array.isArray(feedbackData.strengths)) {
      feedbackData.strengths = [feedbackData.strengths || "Professional demeanor"];
    }
    if (!Array.isArray(feedbackData.weaknesses)) {
      feedbackData.weaknesses = [feedbackData.weaknesses || "Areas for growth identified"];
    }
    if (!Array.isArray(feedbackData.improvements)) {
      feedbackData.improvements = [feedbackData.improvements || "Continue skill development"];
    }
    if (!feedbackData.interviewInsights) {
      feedbackData.interviewInsights = "The candidate showed good interview preparation and engagement.";
    }
    if (!feedbackData.nextSteps) {
      feedbackData.nextSteps = "Focus on areas identified for improvement and continue professional development.";
    }
    function getAIScore(transcript: string): string {
      const lines = transcript
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      const length = lines.length;
      if (length >= 30) return "10";
      if (length >= 25) return "8";
      if (length >= 20) return "7";
      if (length >= 15) return "6";
      if (length >= 10) return "5";
      if (length >= 4) return "4";
      if (length >= 3) return "3";
      return "1";
    }
    feedbackData.overallRating = getAIScore(transcript);
    console.log('Feedback validation completed successfully');
    return feedbackData;
  });
};

// ---------------------- Question Generator ----------------------


// Only send the last few turns of the conversation to speed up Gemini response
// Streaming version for faster incremental question display
// onToken callback is called with each new token as it arrives (optional)
export const generateInterviewerQuestion = async (
  conversation: string,
  role: string,
  language: 'en' | 'hi' = 'en',
  techStacks: string[] = [],
  onToken?: (token: string) => void
) => {
  // Split conversation into turns and keep only the last 6 (3 Q&A pairs)
  const turns = conversation.split('\n').filter(Boolean);
  const lastTurns = turns.slice(-6).join('\n');

  const totalQuestions = 15;
  let prompt = `
You are an AI interviewer for a ${role} position.
First, ask the candidate about their total years of experience and the main domains or technologies they've worked with.
Once you have their experience, use it to tailor your next questions:
- If they have more experience, ask deeper, scenario-based or advanced questions.
- If they have less experience, ask more fundamental or practical questions.
Divide a total of 15 questions equally among the selected tech stacks: ${techStacks.join(', ')}.
Always relate your questions to the candidate's stated experience and background.
Ask only one question at a time and wait for the user's answer before proceeding.

Here is the recent conversation so far:
${lastTurns}

Now, ask the next question according to the above rules.
If all 15 questions have been asked, say "This concludes the technical interview. Thank you."
`;

  return tryGeminiKeys(env.VITE_GEMINI_API_KEYS, async (apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    if (typeof model.generateContentStream === 'function' && onToken) {
      const stream = await model.generateContentStream({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
      if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
        let fullText = '';
        for await (const chunk of stream) {
          const part = chunk.text();
          if (part) {
            fullText += part;
            onToken(part);
          }
        }
        return fullText.trim();
      } else {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        onToken(text);
        return text;
      }
    } else {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    }
  });
};
