import { NextRequest } from "next/server";

// Simple endpoint that returns connection status
// We'll disable WebSocket for now and use polling instead
export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      status: "connected",
      message: "WebSocket endpoint available",
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
