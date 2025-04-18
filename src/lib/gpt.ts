import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "console";

// Initialize the API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gemini-2.0-flash", // Default to gemini-pro instead of gpt-3.5-turbo
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
) {
  // if the user input is in a list, we also process the output as a list of json
  const list_input: boolean = Array.isArray(user_prompt);
  // check for dynamic elements and list output as before
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));

  // start off with no error message
  let error_msg: string = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `\nYou are to output ${
      list_output && "an array of objects in"
    } the following in json format: ${JSON.stringify(
      output_format
    )}. \nDo not put quotation marks or escape character \\ in the output fields.`;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate an array of json, one json for each input element.`;
    }

    try {
      // Get the generative model
      const generativeModel = genAI.getGenerativeModel({ model });

      // Construct the prompt
      const fullSystemPrompt = system_prompt + output_format_prompt + error_msg;
      const fullPrompt = `${fullSystemPrompt}\n\n${user_prompt.toString()}`;
      
      // For Gemini, we need to use a different approach as it doesn't have the same system/user roles
      // Instead we'll include the system prompt as part of the content
      const result = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: temperature,
        }
      });

      const response = result.response;
      let res: string = response.text().replace(/'/g, '"') || "";
      
      // ensure that we don't replace away apostrophes in text
      res = res.replace(/(\w)"(\w)/g, "$1'$2");

      if (verbose) {
        console.log("System prompt:", fullSystemPrompt);
        console.log("\nUser prompt:", user_prompt);
        console.log("\nGemini response:", res);
      }

      // Extract JSON from the response
      // Sometimes the model might wrap the JSON in code blocks, so we need to handle that
      const jsonMatch = res.match(/```json\n([\s\S]*?)\n```/) || res.match(/```\n([\s\S]*?)\n```/);
      const cleanedRes = jsonMatch ? jsonMatch[1] : res;

      let output: any = JSON.parse(cleanedRes);

      if (list_input) {
        if (!Array.isArray(output)) {
          throw new Error("Output format not in an array of json");
        }
      } else {
        output = [output];
      }

      // Check output format as before
      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          if (/<.*?>/.test(key)) {
            continue;
          }

          if (!(key in output[index])) {
            throw new Error(`${key} not in json output`);
          }

          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category;
            }
            if (output[index][key].includes(":")) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        if (output_value_only) {
          output[index] = Object.values(output[index]);
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }
      console.log('====================================');
      console.log("Gemini response mil gaya ig: ",list_input ? output : output[0]);
      console.log('====================================');
      return list_input ? output : output[0];
    } catch (e) {
      if (e instanceof Error && e.message.includes("rate limit")) {
        // Wait longer before the next try
        await delay(2000 * (i + 1)); // exponential backoff
      }
      error_msg = `\n\nResult: ${e}\n\nError message: ${e instanceof Error ? e.message : String(e)}`;
      console.log("An exception occurred:", e);
    }
    
  }

  return [];
}