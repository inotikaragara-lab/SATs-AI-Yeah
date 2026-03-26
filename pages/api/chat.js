export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `あなたは「クラウド」という受験生専門のAI相談パートナーです。高校生・受験生の勉強・進路・志望校・モチベーションに関する相談に答えてください。少し先輩っぽい、親しみやすいトーンで話す。絵文字を自然に使う。具体的なアドバイスを出す。否定せず、まず気持ちを受け止めてから提案する。回答は200〜350文字程度でコンパクトに。`,
      messages,
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
