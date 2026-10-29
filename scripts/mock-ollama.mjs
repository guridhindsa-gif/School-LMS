// A tiny Ollama-compatible server for demos and tests (no model, canned but context-aware replies).
// Run: npm run mock:ollama   then in another terminal: npm run dev:mock
import http from 'node:http';

const PORT = Number(process.env.PORT || 11999);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function pick(text, label) {
  const m = text.match(new RegExp(`${label}:\\s*(.+)`));
  return m ? m[1].trim() : '';
}

function lesson(prompt) {
  const unit = pick(prompt, 'Chapter / unit') || pick(prompt, 'Subject') || 'this chapter';
  const topics = (pick(prompt, 'Official sub-topics') || 'Key idea; Worked example; Applications').split(';').map(s => s.trim()).filter(Boolean).slice(0, 4);
  return `## What is ${unit}?\n\nThis is a **demo lesson** from the mock AI server. Connect Ollama to get a real lesson written for your class.\n\n${topics.map((t, i) => `## ${i + 1}. ${t}\n\nA short, clear explanation of ${t.toLowerCase()} with an everyday example from home or school.\n`).join('\n')}\n### Worked example\n\n1. Read the question and list what is given.\n2. Choose the right idea or formula, for example $v = u + at$.\n3. Substitute and solve: $v = 2 + 3 \\times 4 = 14$ m/s.\n\n> **Remember**\n> - Write what is given first.\n> - Check units at every step.\n> - Draw a diagram when you can.\n\n## Common mistakes\n\n- Mixing up units (cm vs m).\n- Skipping the diagram.\n\n## Quick check\n\n1. Name one example of ${unit} in daily life.\n**Answer:** Any correct everyday example.\n2. What is the first step in solving a problem?\n**Answer:** List what is given.\n3. Why check units?\n**Answer:** To catch mistakes early.\n`;
}

function questions(prompt) {
  const n = Math.min(Number((prompt.match(/Create (\d+)/) || [])[1] || 5), 20);
  const unit = pick(prompt, 'Chapter / unit') || pick(prompt, 'Exam') || 'the chapter';
  const diff = (prompt.match(/all (easy|medium|hard)/) || [])[1];
  const levels = ['easy', 'medium', 'hard'];
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = 2 + i, b = 3 + (i % 4), ans = (i * 7) % 4;
    const opts = [a * b - 1, a * b + 1, a + b, a * b + 2].map(String);
    opts[ans] = String(a * b);
    out.push({
      q: `[Demo · ${unit}] What is ${a} × ${b}?`,
      options: opts,
      answer: ans,
      explanation: `${a} × ${b} = ${a * b}. (Demo question from the mock AI server.)`,
      hint: `Add ${a} to itself ${b} times.`,
      difficulty: diff || levels[i % 3],
      topic: `Demo topic ${1 + (i % 3)}`,
      whyWrong: opts.map((o, k) => (k === ans ? '' : `${o} is not ${a} × ${b}.`)),
    });
  }
  return JSON.stringify({ questions: out });
}

function tutor(messages) {
  const last = messages.filter(m => m.role === 'user').pop()?.content || '';
  const sys = messages.find(m => m.role === 'system')?.content || '';
  const unit = pick(sys, 'Chapter / unit');
  return `Good question! ${unit ? `We're working on **${unit}**. ` : ''}Let's think it through together.\n\nWhat do you already know about "${last.slice(0, 80)}"? Tell me one fact, and I'll give you the next hint.\n\n_(Demo reply from the mock AI server — connect Ollama for real tutoring.)_`;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/api/tags')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ models: [{ name: 'mock:latest' }] }));
  }
  if (req.method === 'POST' && req.url.startsWith('/api/chat')) {
    let raw = '';
    for await (const c of req) raw += c;
    const body = JSON.parse(raw || '{}');
    const msgs = body.messages || [];
    const userText = msgs.filter(m => m.role === 'user').map(m => m.content).join('\n');
    let content;
    if (body.format) content = questions(userText);
    else if (/Write a lesson/.test(userText)) content = lesson(userText);
    else content = tutor(msgs);
    if (body.stream === false) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ model: body.model, message: { role: 'assistant', content }, done: true }));
    }
    res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
    const parts = content.match(/[\s\S]{1,24}/g) || [];
    for (const p of parts) {
      res.write(JSON.stringify({ model: body.model, message: { role: 'assistant', content: p }, done: false }) + '\n');
      await sleep(12);
    }
    res.end(JSON.stringify({ model: body.model, message: { role: 'assistant', content: '' }, done: true }) + '\n');
    return;
  }
  res.writeHead(404); res.end();
});

server.listen(PORT, () => console.log(`Mock Ollama listening on http://127.0.0.1:${PORT}`));
