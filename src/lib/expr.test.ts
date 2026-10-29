import { describe, expect, it } from 'vitest';
import { compile, tryCompile } from './expr';

const ev = (s: string, v: Record<string, number> = {}, deg = true) => compile(s, deg).fn(v);
const near = (a: number, b: number) => expect(Math.abs(a - b) < 1e-9).toBe(true);

describe('expression evaluator', () => {
  it('respects precedence and parentheses', () => {
    expect(ev('2 + 3 * 4')).toBe(14);
    expect(ev('(2 + 3) * 4')).toBe(20);
    expect(ev('2 ^ 3 ^ 2')).toBe(512);
    expect(ev('-2 ^ 2')).toBe(-4);
    expect(ev('10 / 4')).toBe(2.5);
  });
  it('handles variables and implicit multiplication', () => {
    expect(ev('u*t + 0.5*a*t^2', { u: 2, a: 3, t: 4 })).toBe(32);
    expect(ev('2x + 1', { x: 5 })).toBe(11);
    expect(ev('2(x+1)', { x: 2 })).toBe(6);
    expect(compile('m*g*h').vars).toEqual(['m', 'g', 'h']);
  });
  it('supports functions in degrees and constants', () => {
    near(ev('sin(30)'), 0.5);
    near(ev('u^2 * sin(2*theta) / g', { u: 20, theta: 45, g: 10 }), 40);
    near(ev('pi * r^2', { r: 1 }), Math.PI);
    near(ev('sqrt(16) + abs(-3)'), 7);
    near(ev('sin(pi/2)', {}, false), 1);
  });
  it('rejects unsafe or invalid input', () => {
    expect(tryCompile('alert(1)')).toBe(null);
    expect(tryCompile('2 +* 3')).toBe(null);
    expect(tryCompile('(1 + 2')).toBe(null);
    expect(tryCompile('x; y')).toBe(null);
  });
});
