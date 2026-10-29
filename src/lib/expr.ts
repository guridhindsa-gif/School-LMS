/**
 * Safe arithmetic expression evaluator for interactive formulas (no eval).
 * Supports numbers, variables, + - * / ^, parentheses, unary minus,
 * functions sin cos tan asin acos atan sqrt abs ln log exp, constants pi and e.
 * Trig functions take degrees when `degrees` is true (school convention).
 */
type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string } | { t: '('; v: '(' } | { t: ')'; v: ')' } | { t: ','; v: ',' };

const FN: Record<string, (x: number, deg: boolean) => number> = {
  sin: (x, d) => Math.sin(d ? (x * Math.PI) / 180 : x),
  cos: (x, d) => Math.cos(d ? (x * Math.PI) / 180 : x),
  tan: (x, d) => Math.tan(d ? (x * Math.PI) / 180 : x),
  asin: (x, d) => (d ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
  acos: (x, d) => (d ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
  atan: (x, d) => (d ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
  sqrt: x => Math.sqrt(x), abs: x => Math.abs(x), ln: x => Math.log(x), log: x => Math.log10(x), exp: x => Math.exp(x),
};
const CONST: Record<string, number> = { pi: Math.PI, e: Math.E };
const PREC: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4, 'neg': 3 };

function tokenize(src: string): Tok[] {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\*\*/g, '^').replace(/π/g, 'pi');
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.eE]/.test(s[j]) && !(/[eE]/.test(s[j]) && !/[0-9+-]/.test(s[j + 1] || ''))) { if (/[eE]/.test(s[j]) && /[+-]/.test(s[j + 1])) j++; j++; } const v = Number(s.slice(i, j)); if (!isFinite(v)) throw new Error('bad number'); out.push({ t: 'num', v }); i = j; continue; }
    if (/[A-Za-z_]/.test(c)) { let j = i; while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++; out.push({ t: 'id', v: s.slice(i, j) }); i = j; continue; }
    if ('+-*/^'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    if (c === '(' || c === ')' || c === ',') { out.push({ t: c, v: c } as Tok); i++; continue; }
    throw new Error(`Unexpected "${c}"`);
  }
  // implicit multiplication: 2x, 2(…), )(…), x(… when x is not a function
  const res: Tok[] = [];
  for (let k = 0; k < out.length; k++) {
    const a = out[k - 1], b = out[k];
    if (a && a.t === 'id' && !FN[a.v] && b.t === '(') throw new Error(`Unknown function ${a.v}`);
    if (a && ((a.t === 'num' || a.t === ')' || (a.t === 'id' && !FN[a.v])) && (b.t === 'num' || b.t === 'id' || b.t === '('))) res.push({ t: 'op', v: '*' });
    res.push(b);
  }
  return res;
}

export type Compiled = (vars: Record<string, number>) => number;

export function compile(src: string, degrees = true): { fn: Compiled; vars: string[] } {
  if (src.length > 300) throw new Error('Expression too long');
  const toks = tokenize(src);
  const out: (Tok | { t: 'fn'; v: string } | { t: 'neg'; v: 'neg' })[] = [];
  const stack: (Tok | { t: 'fn'; v: string } | { t: 'neg'; v: 'neg' })[] = [];
  let prev: Tok | null = null;
  const vars = new Set<string>();
  for (const tk of toks) {
    if (tk.t === 'num') out.push(tk);
    else if (tk.t === 'id') {
      if (FN[tk.v]) stack.push({ t: 'fn', v: tk.v });
      else { out.push(tk); if (!(tk.v in CONST)) vars.add(tk.v); }
    } else if (tk.t === 'op') {
      const unary = tk.v === '-' && (!prev || prev.t === 'op' || prev.t === '(' || prev.t === ',');
      if (unary) { stack.push({ t: 'neg', v: 'neg' }); prev = tk; continue; }
      if (tk.v === '+' && (!prev || prev.t === 'op' || prev.t === '(')) { prev = tk; continue; }
      if (!prev || prev.t === 'op' || prev.t === '(' || prev.t === ',') throw new Error(`Unexpected ${tk.v}`);
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.t === 'fn') { out.push(stack.pop()!); continue; }
        if (top.t !== 'op' && top.t !== 'neg') break;
        const p1 = PREC[tk.v], p2 = PREC[top.v];
        if (p2 > p1 || (p2 === p1 && tk.v !== '^')) out.push(stack.pop()!); else break;
      }
      stack.push(tk);
    } else if (tk.t === '(') stack.push(tk);
    else if (tk.t === ')') {
      while (stack.length && stack[stack.length - 1].t !== '(') out.push(stack.pop()!);
      if (!stack.length) throw new Error('Unbalanced )');
      stack.pop();
      if (stack.length && stack[stack.length - 1].t === 'fn') out.push(stack.pop()!);
    }
    prev = tk;
  }
  while (stack.length) { const x = stack.pop()!; if (x.t === '(') throw new Error('Unbalanced ('); out.push(x); }
  const fn: Compiled = v => {
    const st: number[] = [];
    for (const t of out) {
      if (t.t === 'num') st.push(t.v);
      else if (t.t === 'id') { const val = t.v in CONST ? CONST[t.v] : v[t.v]; if (val === undefined) throw new Error(`Unknown ${t.v}`); st.push(val); }
      else if (t.t === 'neg') st.push(-(st.pop() ?? NaN));
      else if (t.t === 'fn') st.push(FN[t.v](st.pop() ?? NaN, degrees));
      else if (t.t === 'op') {
        const b = st.pop() ?? NaN, a = st.pop() ?? NaN;
        st.push(t.v === '+' ? a + b : t.v === '-' ? a - b : t.v === '*' ? a * b : t.v === '/' ? a / b : Math.pow(a, b));
      }
    }
    if (st.length !== 1) throw new Error('Malformed expression');
    return st[0];
  };
  return { fn, vars: [...vars] };
}

/** Returns a safe evaluator or null if the expression is invalid. */
export function tryCompile(src: string, degrees = true) {
  try { const c = compile(src, degrees); c.fn(Object.fromEntries(c.vars.map(v => [v, 1]))); return c; } catch { return null; }
}
