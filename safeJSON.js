export function safeJSON(text) {
  try {
    const cleaned = text
      .replace(/^```json/gi, "")
      .replace(/^```/gi, "")
      .replace(/```$/gi, "")
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("JSON inválido");
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (err) {
    console.error(err);
    throw new Error("Falha ao converter JSON");
  }
}
