// gemini-ping.mjs
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const key = process.env.GEMINI_API_KEY;
  console.log("Key present:", !!key);
  if (!key) {
    console.error("❌ Missing GEMINI_API_KEY in env");
    process.exit(1);
  }

  console.log("Node version:", process.versions.node);

  const ai = new GoogleGenerativeAI(key);

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log("\nTrying model:", modelName);
      const model = ai.getGenerativeModel({ model: modelName });
      const r = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: 'Return JSON {"ok":true}' }] },
        ],
        generationConfig: { responseMimeType: "application/json" },
      });
      const text = r.response.text();
      console.log("✅ SUCCESS", modelName, "→", text);
      process.exit(0);
    } catch (e) {
      console.error("❌ FAIL", modelName, {
        name: e?.name,
        message: e?.message,
        code: e?.code,
        status: e?.status,
        response: e?.response ? JSON.stringify(e.response) : undefined,
      });
    }
  }

  console.error(
    "\nAll models failed. Check errors above (Node, key, quota, or model access)."
  );
  process.exit(2);
}

main().catch((e) => {
  console.error("UNCAUGHT", e);
  process.exit(3);
});
