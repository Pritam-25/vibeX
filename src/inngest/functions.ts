// inngest/functions.ts
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

// ✅ Temp in-memory store (not for production)
const summaryStore = new Map<string, string>();

export const textSummarizer = inngest.createFunction(
  { id: "text-summarizer" },
  { event: "test/summarizer" },
  async ({ event, step }) => {
    const inputText = event.data.text;
    const requestId = event.data.id;

    if (!inputText || typeof inputText !== "string") {
      summaryStore.set(requestId, "❌ Invalid input text");
      return { message: "❌ Error", summary: null };
    }

    const result = await step.run("summarize-text", async () => {
      try {
        const response = await a4fClient.chat.completions.create({
          model: "provider-2/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes text. Provide a concise summary of no more than 2–3 sentences.",
            },
            {
              role: "user",
              content: `Please summarize the following text:\n\n${inputText}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 150,
        });

        const summary = response.choices[0].message?.content?.trim();
        return summary || "❌ No summary generated.";
      } catch (error: any) {
        return `❌ Error: ${error.message}`;
      }
    });

    // ✅ Store result for retrieval
    summaryStore.set(requestId, result);

    return {
      message: "✅ Summary complete",
      summary: result,
    };
  }
);

// Export store for use in polling route
export { summaryStore };
