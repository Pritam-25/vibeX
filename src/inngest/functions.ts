import { inngest } from "./client";
import OpenAI from "openai";


// ✅ Setup A4F credentials
const A4F_API_KEY = process.env.A4F_API_KEY!;
const A4F_BASE_URL = "https://api.a4f.co/v1";

// ✅ OpenAI client via A4F proxy
const a4fClient = new OpenAI({
  apiKey: A4F_API_KEY,
  baseURL: A4F_BASE_URL,
});


export const websiteBuilder = inngest.createFunction(
  { id: "website-builder" },
  { event: "test/website.builder" },
  async ({ event, step }) => {

    const inputText = event.data.text;

    if (!inputText || typeof inputText !== "string") {
      console.log("Invalid input text:", inputText);
    }

    const result = await step.run("generate-code", async () => {
      try {
        const response = await a4fClient.chat.completions.create({
          model: "provider-3/gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a masterful web developer and designer. Your task is to create a simple, elegant website or components based on the provided text input. The website should be visually appealing and user-friendly.",
            },
            {
              role: "user",
              content: `Please create a website based on the following description:\n\n${inputText}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 150,
        });

        const code = response.choices[0].message?.content?.trim();
        return code;
      } catch (error: any) {
        return `❌ Error: ${error.message}`;
      }
    });
    return { status: "success", code: result ? result : "No code generated." };
  },
);