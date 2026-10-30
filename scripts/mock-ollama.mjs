// A tiny Ollama-compatible server for demos and tests (no model, canned but context-aware replies).
// Run: npm run mock:ollama   then in another terminal: npm run dev:mock
import http from 'node:http';
import fs from 'node:fs';

const SAMPLES = JSON.parse(fs.readFileSync(new URL('../src/data/visual-samples.json', import.meta.url), 'utf8'));
function visual(prompt) {
  const unit = pick(prompt, 'Chapter / unit') || 'This chapter';
  const n = (unit + ' ' + pick(prompt, 'Subject')).toLowerCase();
  if (/kinematic|projectile|motion in a/.test(n)) return JSON.stringify(SAMPLES.kinematics);
  if (/photosynth|nutrition in plants|plant/.test(n)) return JSON.stringify(SAMPLES.plants);
  const topics = (pick(prompt, 'Official sub-topics') || 'Key idea; How it works; Where we use it').split(';').map(t => t.trim()).filter(Boolean).slice(0, 5);
  return JSON.stringify({ title: unit, scenes: [
    { type: 'intro', title: unit, narration: `Let's explore ${unit}. (Demo lesson from the mock AI server.)`, emoji: '✨', bullets: topics.slice(0, 3) },
    { type: 'concept_map', title: 'Big ideas', narration: 'Tap each idea.', center: { label: unit.slice(0, 40), emoji: '📘' }, nodes: topics.map((t, i) => ({ label: t.slice(0, 40), emoji: ['💡', '🔍', '⚙️', '🧪', '📐'][i % 5], detail: `Sub-topic ${i + 1}` })) },
    { type: 'quiz', title: 'Quick check', narration: 'Try this.', q: `Which is part of ${unit}?`, options: [topics[0].slice(0, 40), 'Cooking', 'Football', 'Films'], answer: 0, explanation: 'It is in the official syllabus.' },
  ] });
}

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

// Demo questions are built from the chapter's own official sub-topics, so a Class 12 Physics
// chapter never gets primary-school arithmetic. They are clearly labelled as demo content.
const OFF_TOPIC = ['Cricket scoring rules', 'Cooking a dal tadka', 'Film editing software', 'Traffic signal timings', 'Folk dance steps', 'Stock market charts', 'Mobile phone plans', 'Gardening tools'];
function questions(prompt) {
  const n = Math.min(Number((prompt.match(/Create (\d+)/) || [])[1] || 5), 20);
  const unit = pick(prompt, 'Chapter / unit') || pick(prompt, 'Exam') || 'this chapter';
  const subject = pick(prompt, 'Subject') || pick(prompt, 'Subject / section') || '';
  const topics = (pick(prompt, 'Official sub-topics') || pick(prompt, 'Units in scope') || unit)
    .split(/;|\|/).map(s => s.trim()).filter(Boolean);
  const avoid = pick(prompt, 'Do not repeat these questions');
  const diff = (prompt.match(/all (easy|medium|hard)/) || [])[1];
  const levels = ['easy', 'medium', 'hard'];
  const out = [];
  // start where earlier batches stopped, so prefetched batches do not repeat
  const offset = avoid ? avoid.split('|').length : 0;
  for (let i = 0; i < n; i++) {
    const k = offset + i;
    const topic = topics[k % topics.length];
    const ans = (k * 7) % 4;
    const wrong = [0, 1, 2].map(j => OFF_TOPIC[(k * 3 + j) % OFF_TOPIC.length]);
    const opts = [...wrong]; opts.splice(ans, 0, topic);
    out.push({
      q: `[Demo · ${unit}] Which of these is part of the official ${subject ? subject + ' ' : ''}syllabus for this chapter? (set ${k + 1})`,
      options: opts,
      answer: ans,
      explanation: `"${topic}" is listed in the official syllabus for ${unit}. (Demo question from the mock AI server: connect Ollama for real questions.)`,
      hint: 'Look for the option that belongs to this subject.',
      difficulty: diff || levels[k % 3],
      topic,
      whyWrong: opts.map((o, j) => (j === ans ? '' : `"${o}" is not part of ${unit}.`)),
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
    if (body.format && /picture-first lesson/.test(userText)) content = visual(userText);
    else if (body.format) content = questions(userText);
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
