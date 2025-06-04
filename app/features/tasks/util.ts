import type { Task } from "~/generated/prisma";

export const prepareListData = (str: string) =>
  JSON.stringify(str ? str.split("\n").filter(Boolean) : []);

export function convertListToStrings(task: Task) {
  let steps: string[] = [];
  let acceptanceCriteria: string[] = [];
  let suggestedTests: string[] = [];
  try {
    steps = JSON.parse(task.steps ?? "[]");
  } catch {}
  try {
    acceptanceCriteria = JSON.parse(task.acceptance_criteria ?? "[]");
  } catch {}
  try {
    suggestedTests = JSON.parse(task.suggested_tests ?? "[]");
  } catch {}

  return {
    steps,
    acceptanceCriteria,
    suggestedTests,
  };
}
