import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from "./schema.js";
import type { ApiAnalyzeResponse, ApiErrorResponse } from "../src/types/api.js";

const SYSTEM_PROMPT = `You are a spending analyst for LEAKS, a personal finance product.
Currency is BDT (৳) unless the data clearly uses another currency.
Be conservative. A leak is an observable pattern worth reviewing — not every expense.

Look for:
- recurring charges that look unused, overlapping, or easy to pause
- fee stacks (delivery, cash-out, convenience)
- unusual spikes versus the rest of the ledger
- repeated merchants that add up quietly
- practical savings a person could act on this month

Do not moralize. Do not shame. Do not label rent, groceries, utilities, or necessary transport as leaks unless there is a clear avoidable pattern (for example duplicate subscriptions or repeated delivery fees).

Use wording such as: "worth reviewing", "potential saving", "unusual pattern", "possible recurring cost".

hidden_leak_count must match the number of items in leaks.
health_score is 0–100.
Always fill recommendations with 2–4 practical next steps when any pattern exists.
Headline should be short and concrete. Never use titles like "Spending Analysis Summary".
If there is no strong leak, keep leaks empty, set hidden_leak_count to 0, and put a neutral note in top_leak.
Return only the structured object.`;

export type AnalyzeHttpResult = {
  status: number;
  body: ApiAnalyzeResponse | ApiErrorResponse;
};

export async function analyzeTransactions(
  rawBody: unknown,
  apiKey: string | undefined,
): Promise<AnalyzeHttpResult> {
  if (!apiKey) {
    return {
      status: 503,
      body: { error: "We couldn't analyze this data. Try again." },
    };
  }

  const parsed = AnalyzeRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.code === "too_small") {
      return { status: 400, body: { error: "Please add at least one transaction." } };
    }
    return {
      status: 400,
      body: {
        error:
          "We couldn't find enough information to identify meaningful patterns.",
      },
    };
  }

  const transactions = parsed.data.transactions.filter(
    (row) => row.merchant.trim() && Number.isFinite(row.amount),
  );

  if (transactions.length === 0) {
    return {
      status: 400,
      body: { error: "Please add at least one transaction." },
    };
  }

  const client = new OpenAI({ apiKey });
  const ledger = transactions.map((row) => ({
    date: row.date,
    merchant: row.merchant.trim(),
    amount: row.amount,
  }));

  try {
    const completion = await client.chat.completions.parse({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze these transactions and fill the schema.\n\n${JSON.stringify(ledger)}`,
        },
      ],
      response_format: zodResponseFormat(AnalyzeResponseSchema, "leaks_analysis"),
    });

    const message = completion.choices[0]?.message;
    if (message?.refusal) {
      return {
        status: 502,
        body: { error: "We couldn't analyze this data. Try again." },
      };
    }

    const analysis = message?.parsed;
    if (!analysis) {
      return {
        status: 502,
        body: { error: "We couldn't analyze this data. Try again." },
      };
    }

    return { status: 200, body: analysis };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("[analyze]", message);
    if (error instanceof OpenAI.AuthenticationError) {
      return {
        status: 503,
        body: { error: "We couldn't analyze this data. Try again." },
      };
    }
    if (error instanceof OpenAI.RateLimitError) {
      return {
        status: 429,
        body: { error: "We couldn't analyze this data. Try again." },
      };
    }
    return {
      status: 502,
      body: { error: "We couldn't analyze this data. Try again." },
    };
  }
}
