import { GoogleGenerativeAI } from "@google/generative-ai";
import { PatchesTypes } from "../types/index.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function aiReview(patches: PatchesTypes[]) {
  if (!patches || patches.length === 0) {
    return "## 🤖 AI Review\n\nNo code changes found in this PR.";
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  let diffText = "";
  for (const patch of patches) {
    diffText += `
File: ${patch.filename}
---------------------
${patch.patch ?? "No diff available"}
`;
  }

  const prompt = `
You are a senior software engineer reviewing a GitHub Pull Request.

Provide:
1. Summary
2. Bugs / Issues
3. Suggestions
4. Performance
5. Security
6. Final recommendation

Code diff:
${diffText}
  `;

  try {
    const result = await model.generateContent(prompt);
    return `## 🤖 AI Review\n\n${result.response.text()}`;
  } catch (err) {
    console.error("Gemini error:", err);
    return "## 🤖 AI Review\n\nError generating review (check Gemini config)";
  }
}
