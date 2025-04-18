import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { strict_output } from "./gpt";

// Custom error class for YouTube API errors
class YouTubeAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YouTubeAPIError";
  }
}

// Custom error class for transcript errors
class TranscriptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranscriptError";
  }
}

/**
 * Search YouTube for a video matching the query
 * @param searchQuery The search term to look for
 * @param videoDuration Optional video duration filter (default: 'medium')
 * @param maxResults Optional maximum number of results (default: 5)
 * @returns The videoId of the first matching result, or null if none found
 */
/**
 * Search YouTube for a video matching the query
 * @param searchQuery The search term to look for
 * @param videoDuration Optional video duration filter (default: 'medium')
 * @param maxResults Optional maximum number of results (default: 5)
 * @returns The videoId of the first matching result, or null if none found
 */
export async function searchYoutube(
  searchQuery: string,
  videoDuration: "short" | "medium" | "long" = "medium",
  maxResults: number = 5
): Promise<string | null> {
  if (!searchQuery || searchQuery.trim() === "") {
    console.error("Search query cannot be empty");
    return null;
  }

  if (!process.env.YOUTUBE_API_KEY) {
    console.error("YouTube API key is not defined in environment variables");
    return null;
  }

  try {
    // Log the API key prefix for debugging (first 3 chars only)
    console.log(`Using YouTube API key: ${process.env.YOUTUBE_API_KEY.substring(0, 3)}...`);
    
    // Simplify the search query to improve results
    const simplifiedQuery = searchQuery
      .split(" ")
      .slice(0, 4)  // Take only first 4 words max
      .join(" ");
      
    // Add "Khan Academy" if not already present
    const finalQuery = simplifiedQuery.toLowerCase().includes("khan academy") 
      ? simplifiedQuery 
      : `${simplifiedQuery} Khan Academy`;
    
    console.log(`Searching YouTube with query: "${finalQuery}"`);
    
    // Encode the search query for URL
    const encodedQuery = encodeURIComponent(finalQuery);
    
    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          q: encodedQuery,
          videoDuration: videoDuration,
          videoEmbeddable: true,
          type: "video",
          maxResults: maxResults,
          part: "id",
          relevanceLanguage: "en"
        },
        timeout: 8000 // 8 second timeout
      }
    );

    if (!data || !data.items || data.items.length === 0) {
      console.log("No results found for query:", finalQuery);
      
      // Try one more time with an even simpler query if the first one failed
      if (simplifiedQuery.split(" ").length > 2) {
        const fallbackQuery = simplifiedQuery.split(" ").slice(0, 2).join(" ") + " Khan Academy";
        console.log(`Trying fallback search with: "${fallbackQuery}"`);
        
        const fallbackResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/search`,
          {
            params: {
              key: process.env.YOUTUBE_API_KEY,
              q: encodeURIComponent(fallbackQuery),
              videoDuration: videoDuration,
              videoEmbeddable: true,
              type: "video",
              maxResults: maxResults,
              part: "id",
              relevanceLanguage: "en"
            },
            timeout: 8000
          }
        );
        
        if (fallbackResponse.data && 
            fallbackResponse.data.items && 
            fallbackResponse.data.items.length > 0) {
          console.log(`Found video with fallback search: ${fallbackResponse.data.items[0].id.videoId}`);
          return fallbackResponse.data.items[0].id.videoId;
        }
      }
      
      return null;
    }

    console.log(`Found video: ${data.items[0].id.videoId}`);
    return data.items[0].id.videoId;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`YouTube API error: ${error.message}`);
      console.error(`Response data:`, error.response?.data);
      console.error(`Status code:`, error.response?.status);
    } else {
      console.error("Unknown error:", error);
    }
    return null;
  }
}

/**
 * Get the transcript for a YouTube video
 * @param videoId The YouTube video ID
 * @param maxRetries Optional number of retry attempts (default: 2)
 * @returns The transcript text or empty string if not available
 */
export async function getTranscript(
  videoId: string,
  maxRetries: number = 2
): Promise<string> {
  if (!videoId || videoId.trim() === "") {
    console.error("Video ID cannot be empty");
    return "";
  }

  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      const transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: "en",
        country: "EN",
      });
      
      if (!transcript_arr || transcript_arr.length === 0) {
        console.log(`No transcript available for video: ${videoId}`);
        return "";
      }
      
      let transcript = "";
      for (let t of transcript_arr) {
        transcript += t.text + " ";
      }
      
      return transcript.replaceAll("\n", "");
    } catch (error) {
      retries++;
      if (retries > maxRetries) {
        console.error(`Failed to get transcript after ${maxRetries} attempts for video: ${videoId}`);
        console.error(error);
        return "";
      }
      console.log(`Retry ${retries}/${maxRetries} for transcript of video: ${videoId}`);
      // Wait for a short time before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
  
  return "";
}

/**
 * Generate multiple-choice questions from a transcript
 * @param transcript The video transcript text
 * @param course_title The title of the course or subject
 * @param numQuestions Optional number of questions to generate (default: 5)
 * @returns An array of questions with options and answers
 */
export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string,
  numQuestions: number = 5
): Promise<Question[]> {
  if (!transcript || transcript.trim() === "") {
    console.error("Transcript cannot be empty");
    return [];
  }

  if (!course_title || course_title.trim() === "") {
    console.error("Course title cannot be empty");
    return [];
  }

  // Limit transcript size if it's too large to avoid API issues
  const maxTranscriptLength = 5000;
  const trimmedTranscript = transcript.length > maxTranscriptLength 
    ? transcript.substring(0, maxTranscriptLength) + "..." 
    : transcript;

  try {
    const questions: Question[] = await strict_output(
      "You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words",
      new Array(numQuestions).fill(
        `You are to generate a random hard mcq question about ${course_title} with context of the following transcript: ${trimmedTranscript}`
      ),
      {
        question: "question",
        answer: "answer with max length of 15 words",
        option1: "option1 with max length of 15 words",
        option2: "option2 with max length of 15 words",
        option3: "option3 with max length of 15 words",
      }
    );

    return questions;
  } catch (error) {
    console.error("Failed to generate questions:", error);
    return [];
  }
}

// Type definition for Question object
export type Question = {
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
};