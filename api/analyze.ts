import { analyzeTransactions } from "../server/analyze.js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await analyzeTransactions(
      body,
      process.env.OPENAI_API_KEY,
    );

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[api/analyze]", error);

    return new Response(
      JSON.stringify({
        error: "We couldn't analyze this data. Try again.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}