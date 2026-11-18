import test from "node:test"
import assert from "node:assert/strict"
import { parseJava, buildTrace } from "./engine.mjs"

const selection = `public static void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        int temp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = temp;
    }
}`
const insertion = `public static void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`

test("sorts ordinary, empty, singleton, duplicate, negative and reverse inputs", () => {
  for (const code of [selection, insertion]) for (const arr of [[7, 5, 9, 2, 3], [], [4], [3, 3, 1, 3, 1], [-2, 5, -8, 0], [5, 4, 3, 2, 1]]) {
    const steps = buildTrace(parseJava(code), { arr })
    assert.equal(steps.at(-1).error, false)
    assert.deepEqual(steps.at(-1).variables.arr, [...arr].sort((a, b) => a - b))
    assert.deepEqual(steps[0].variables.arr, arr, "Earlier snapshots must remain immutable")
    assert.equal("i" in steps.at(-1).variables, false, "Loop variables leave scope")
    if (code === selection) assert.equal(steps.at(-1).comparisons, Math.max(0, arr.length * (arr.length - 1) / 2))
  }
})

test("selection's first minimum scan and swap match the teaching example", () => {
  const steps = buildTrace(parseJava(selection), { arr: [8, 4, 6, 1, 5] })
  const firstScan = steps.filter(s => s.variables.i === 0 && s.title === "Minimumun index'i güncellendi")
  assert.deepEqual(firstScan.map(s => s.variables.minIndex), [1, 3])
  const firstSwap = steps.find(s => s.variables.i === 0 && s.changed.includes("arr[3]"))
  assert.deepEqual(firstSwap.variables.arr, [1, 4, 6, 8, 5])
})

test("insertion short-circuits at j = -1 and sorted inputs need n-1 element comparisons", () => {
  const reverse = buildTrace(parseJava(insertion), { arr: [3, 2, 1] })
  assert.ok(reverse.some(s => s.variables.j === -1 && s.explanation.includes("kısa devre")))
  assert.equal(reverse.at(-1).comparisons, 3)
  const sorted = buildTrace(parseJava(insertion), { arr: [1, 2, 3, 4, 5] })
  assert.equal(sorted.at(-1).comparisons, 4)
})

test("linear, logarithmic, nested and consecutive loops have correct independent counts", () => {
  const programs = [
    ["for (int i=0; i<n; i++) { System.out.println(i); }", 8, 8],
    ["for (long i=1; i<n; i*=2) { System.out.println(i); }", 16, null],
    ["for (int i=0; i<n; i++) { for (int j=0; j<n; j++) { System.out.println(j); } }", 4, 16],
    ["for (int i=0; i<n; i++) {}\nfor (long j=1; j<n; j*=2) {}", 8, 0],
  ]
  for (const [code, n, count] of programs) {
    if (n > 12) { assert.throws(() => buildTrace(parseJava(code), { n })); continue }
    const result = buildTrace(parseJava(code), { n }).at(-1)
    assert.equal(result.error, false)
    assert.equal(result.output.length, count)
    if (code.includes("\n")) assert.deepEqual(result.loops, { "Satır 1": 8, "Satır 2": 3 })
  }
  const log = buildTrace(parseJava("for(long i=1; i<n; i*=2) { System.out.println(i); }"), { n: 12 }).at(-1)
  assert.deepEqual(log.output, ["1", "2", "4", "8"])
})

test("strict and inclusive triangle sums agree with the formula at n = 0, 1, 4, 8", () => {
  for (const n of [0, 1, 4, 8]) for (const inclusive of [false, true]) {
    const code = `for(int i=0; i<n; i++) {\n for(int j=0; j${inclusive ? "<=" : "<"}i; j++) {}\n}`
    const result = buildTrace(parseJava(code), { n }).at(-1)
    assert.equal(result.error, false)
    assert.equal(result.loops["Satır 2"] ?? 0, Math.max(0, n * (n + (inclusive ? 1 : -1)) / 2))
  }
})

test("array initializers, Java integer division, overflow and method n parameters", () => {
  const result = buildTrace(parseJava("int[] arr = {8,4,6,1,5}; int x = -7 / 2; int y=2147483647; y++;" )).at(-1)
  assert.equal(result.error, false)
  assert.deepEqual(result.variables.arr, [8,4,6,1,5])
  assert.equal(result.variables.x, -3)
  assert.equal(result.variables.y, -2147483648)
  const method = buildTrace(parseJava("public static void run(int n) { for(int i=0;i<n;i++) { System.out.println(i); } }"), { n: 3 }).at(-1)
  assert.deepEqual(method.output, ["0", "1", "2"])
})

test("invalid index, division by zero, unsupported code and nonterminating loops stop explicitly", () => {
  const invalid = buildTrace(parseJava("for(int i=0;i<2;i++) { int x = arr[-1]; }" )).at(-1)
  assert.equal(invalid.error, true)
  assert.equal(invalid.variables.i, 0)
  assert.match(invalid.explanation, /ArrayIndexOutOfBoundsException/)
  assert.equal(buildTrace(parseJava("int x=1/0;")).at(-1).error, true)
  assert.throws(() => parseJava("new ProcessBuilder(\"x\").start();"))
  assert.throws(() => parseJava("class Test {}"))
  const forever = buildTrace(parseJava("while(true) {}"))
  assert.equal(forever.at(-1).error, true)
  assert.ok(forever.length < 5002)
})
