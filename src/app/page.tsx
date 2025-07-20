"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const trpc = useTRPC();

  // Function to poll for results
  const pollForResult = async (id: string) => {
    const maxAttempts = 30; // Max 30 attempts (2.5 minutes with 5s intervals)
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        console.log(`Polling attempt ${attempts + 1} for ID: ${id}`); // Debug log
        
        const res = await fetch(`/api/summary-result?runId=${id}`);
        const json = await res.json();

        console.log('Poll response:', json); // Debug log

        if (json.status === "completed") {
          console.log('Summary received:', json.summary); // Debug log
          setSummary(json.summary || "No summary found.");
          setIsLoading(false);
          toast.success("Summarization completed!");
          return;
        } else if (json.status === "failed") {
          console.error('Summarization failed:', json.error); // Debug log
          toast.error(`Summarization failed: ${json.error}`);
          setIsLoading(false);
          return;
        } else if (json.status === "running") {
          attempts++;
          console.log(`Still running... attempt ${attempts}/${maxAttempts}`); // Debug log
          
          if (attempts < maxAttempts) {
            // Wait 5 seconds before polling again
            setTimeout(poll, 5000);
          } else {
            toast.error("Summarization timed out.");
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        toast.error("Error checking summarization status.");
        setIsLoading(false);
      }
    };

    poll();
  };

  // Clear previous results
  const resetResults = () => {
    setSummary("");
    setSubmittedText("");
  };

  // 1. Trigger Inngest event
  const invokeSummarizer = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: async (data) => {
        console.log('tRPC response:', data); // Debug log
        
        // Your tRPC mutation returns { ok: "success", id }
        const id = data?.id;
        
        if (!id) {
          toast.error("Failed to get ID from summarization request.");
          return;
        }

        toast.success("Summarization started!");
        setSubmittedText(text);
        setText("");
        setSummary(""); // Clear previous summary
        setIsLoading(true);

        // 2. Start polling for the result
        await pollForResult(id);
      },
      onError: (error) => {
        console.error('tRPC error:', error); // Debug log
        toast.error("Failed to start summarization.");
        setIsLoading(false);
      },
    })
  );

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Text Summarizer</h1>
        <p className="text-muted-foreground">
          Paste your text below and get an AI-powered summary in seconds
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Paste your text here to summarize..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="resize-none"
        />

        <div className="flex gap-2">
          <Button
            disabled={invokeSummarizer.isPending || !text.trim() || isLoading}
            onClick={() => invokeSummarizer.mutate({ value: text })}
            className="flex-1"
          >
            {invokeSummarizer.isPending || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              "Summarize Text"
            )}
          </Button>

          {(submittedText || summary) && (
            <Button
              variant="outline"
              onClick={resetResults}
              disabled={isLoading}
            >
              Clear Results
            </Button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(submittedText || isLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Text */}
          {submittedText && (
            <div className="border border-muted rounded-lg p-4 bg-muted/20">
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                📄 Original Text
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  ({submittedText.length} characters)
                </span>
              </h2>
              <div className="max-h-64 overflow-y-auto">
                <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {submittedText}
                </p>
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="border border-muted rounded-lg p-4 bg-muted/20">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              ✨ AI Summary
              {summary && (
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  ({summary.length} characters)
                </span>
              )}
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    AI is analyzing your text...
                  </p>
                </div>
              </div>
            ) : summary ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-foreground">
                  {summary}
                </p>
                <div className="pt-2 border-t border-muted">
                  <p className="text-xs text-muted-foreground">
                    Summary generated successfully ✅
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-4">
                Your summary will appear here once processing is complete...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Text length: {text.length}</p>
          <p>Submitted text length: {submittedText.length}</p>
          <p>Summary length: {summary.length}</p>
          <p>Is loading: {isLoading.toString()}</p>
          <p>Summary content: {summary ? `"${summary.substring(0, 100)}..."` : "None"}</p>
        </div>
      )}
    </main>
  );
}