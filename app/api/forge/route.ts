import { NextRequest, NextResponse } from "next/server";
import { anthropic, FORGE_SYSTEM_PROMPT } from "@/lib/claude";
import { retrieveContext } from "@/lib/rag";

export async function POST(req: NextRequest) {
  const { demographics, constraints } = await req.json();

  const userContent = `
Company Demographics:
- Name: ${demographics.company_name || "Not specified"}
- Industry: ${demographics.industry || "Not specified"}
- Employee Count: ${demographics.employee_count}
- Average Age: ${demographics.avg_age}
- Female Employees: ${demographics.female_pct}%
- Primary City: ${demographics.city || "Not specified"}
- Health Risk Notes: ${demographics.health_notes || "None"}

Sales Rep Constraints:
${constraints || "No specific constraints provided. Generate balanced options for this demographic."}
`.trim();

  // Retrieve relevant policy chunks from indexed insurer documents
  const policyContext = retrieveContext(userContent);

  const fullUserMessage = policyContext
    ? `${userContent}\n\n${policyContext}`
    : userContent;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: FORGE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: fullUserMessage }],
    });

    const raw = (response.content[0] as { text: string }).text.trim();

    let options = null;
    try {
      const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = fenceMatch
        ? fenceMatch[1].trim()
        : raw.startsWith("[")
        ? raw
        : raw.slice(raw.indexOf("["));
      options = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response. Please try again.", raw }, { status: 500 });
    }

    return NextResponse.json({ options, hasRealContext: policyContext.length > 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
