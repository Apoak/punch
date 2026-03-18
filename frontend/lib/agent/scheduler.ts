import Anthropic from "@anthropic-ai/sdk";
import { agentTools } from "./tools";
import { SCHEDULING_SYSTEM_PROMPT } from "./prompts";
import { Schedule } from "@/types/schedule";

interface SchedulerInput {
  weekStartDate: string;
  constraints?: Record<string, unknown>;
}

export async function runSchedulingAgent({
  weekStartDate,
  constraints = {},
}: SchedulerInput): Promise<Schedule> {
  const client = new Anthropic();

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Generate a complete shift schedule for the week starting ${weekStartDate}.
Additional constraints: ${JSON.stringify(constraints)}`,
    },
  ];

  // Agentic loop
  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SCHEDULING_SYSTEM_PROMPT,
      tools: agentTools,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      // Extract final schedule from last text block
      const text = response.content.find((b) => b.type === "text");
      if (!text || text.type !== "text") throw new Error("No schedule returned");
      return JSON.parse(text.text) as Schedule;
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;

        const tool = agentTools.find((t) => t.name === block.name);
        if (!tool) throw new Error(`Unknown tool: ${block.name}`);

        // Tool execution is handled in tools.ts
        const result = await (tool as any).execute(block.input);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: "user", content: toolResults });
    }
  }
}
