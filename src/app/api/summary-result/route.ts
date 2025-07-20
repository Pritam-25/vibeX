// app/api/summary-result/route.ts
import { NextRequest, NextResponse } from "next/server";
import { summaryStore } from "@/inngest/functions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const runId = searchParams.get("runId");
    
    if (!runId) {
      return NextResponse.json({ error: "Missing runId parameter" }, { status: 400 });
    }

    // Get the result from your Inngest function's store
    const summary = summaryStore.get(runId);
    
    if (!summary) {
      // Still running - no result yet
      return NextResponse.json({ 
        status: "running"
      });
    }

    // Check if it's an error result
    if (summary.startsWith("❌")) {
      return NextResponse.json({ 
        error: summary,
        status: "failed" 
      }, { status: 500 });
    }

    // Success - return the summary
    return NextResponse.json({ 
      summary: summary,
      status: "completed" 
    });

  } catch (error) {
    console.error("Error fetching summary result:", error);
    return NextResponse.json({ 
      error: "Failed to fetch summary result" 
    }, { status: 500 });
  }
}