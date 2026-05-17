export async function claude({
  apiKey,
  system,
  user,
  maxTokens = 2000
}) {
  const response = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system,
        messages: [
          {
            role: "user",
            content: user
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Anthropic Error ${response.status}: ${text}`
    );
  }

  const data = await response.json();

  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}
