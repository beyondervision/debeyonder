export const config = {
  runtime: "nodejs"
};

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { question, context = "global" } = req.body || {};

    if (!question) {
      return res.status(400).json({
        error: "Z.A.L runtime failure",
        detail: "Missing question"
      });
    }

    /* =====================================================
       Z3RO · Resonantie-bepaling (kernlogica)
       ===================================================== */
    let resonance = 3; // default = balans

    const q = question.toLowerCase();

    if (q.includes("waarheid") || q.includes("audit")) resonance = 6;
    else if (q.includes("analyse") || q.includes("uitleg")) resonance = 1;
    else if (q.includes("balans")) resonance = 3;
    else if (q.includes("init") || q.includes("start")) resonance = 0;

    /* =====================================================
       Z3RO · Antwoord via OpenAI
       ===================================================== */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Je bent Z3RO. Je liegt niet. Je antwoordt feitelijk, kort en helder."
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    const answer = completion.choices[0].message.content;

    /* =====================================================
       Z3RO · Output
       ===================================================== */
    return res.status(200).json({
      answer,
      resonance,
      context
    });

  } catch (err) {
    return res.status(500).json({
      error: "Z.A.L runtime failure",
      detail: err.message
    });
  }
}
