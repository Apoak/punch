import Anthropic from "@anthropic-ai/sdk";

// Extend the SDK tool type to include an execute function for our agentic loop
type AgentTool = Anthropic.Tool & {
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

export const agentTools: AgentTool[] = [
  {
    name: "get_employees",
    description: "Fetch all employees with their roles, availability, and weekly hour limits.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
    execute: async () => {
      const res = await fetch(`${process.env.BACKEND_URL}/api/employees`);
      return res.json();
    },
  },
  {
    name: "get_shift_requirements",
    description: "Get the required shifts and staffing levels for each day of the week.",
    input_schema: {
      type: "object" as const,
      properties: {
        weekStartDate: { type: "string", description: "ISO date string for the week start (Monday)" },
      },
      required: ["weekStartDate"],
    },
    execute: async (input) => {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/shift-requirements?week=${input.weekStartDate}`
      );
      return res.json();
    },
  },
  {
    name: "save_schedule",
    description: "Persist the generated schedule to the database.",
    input_schema: {
      type: "object" as const,
      properties: {
        weekStartDate: { type: "string" },
        shifts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              employeeId: { type: "string" },
              day: { type: "string" },
              startTime: { type: "string" },
              endTime: { type: "string" },
            },
            required: ["employeeId", "day", "startTime", "endTime"],
          },
        },
      },
      required: ["weekStartDate", "shifts"],
    },
    execute: async (input) => {
      const res = await fetch(`${process.env.BACKEND_URL}/api/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return res.json();
    },
  },
];
