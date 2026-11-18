// A deliberately small Java interpreter for the integer/array examples in these notes.
// It never evaluates source as JavaScript. Unsupported Java is rejected explicitly.
export class JavaStepError extends Error {}

const TYPES = new Set(["int", "long", "boolean"])
const PRECEDENCE = { "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 4, "<=": 4, ">": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 }

function tokenize(source) {
  if (source.length > 12000) throw new JavaStepError("Bu örnek adım adım incelemek için fazla uzun.")
  const tokens = []
  let at = 0, line = 1
  while (at < source.length) {
    const rest = source.slice(at)
    const skipped = /^(?:\s+|\/\/[^\n]*|\/\*[\s\S]*?\*\/)/.exec(rest)
    if (skipped) {
      line += (skipped[0].match(/\n/g) || []).length
      at += skipped[0].length
      continue
    }
    const match = /^(?:"(?:\\.|[^"\\])*"|\d+[lL]?|[A-Za-z_$][\w$]*|\+\+|--|\+=|-=|\*=|\/=|%=|<=|>=|==|!=|&&|\|\||[{}()[\];,.=+\-*/%<>!])/.exec(rest)
    if (!match) throw new JavaStepError(`Satır ${line}: bu Java yapısı henüz desteklenmiyor.`)
    tokens.push({ value: match[0], start: at, end: at + match[0].length, line })
    at += match[0].length
    if (tokens.length > 4000) throw new JavaStepError("Bu örnekte çok fazla işlem var.")
  }
  tokens.push({ value: "EOF", start: at, end: at, line })
  return tokens
}

export function parseJava(source) {
  const tokens = tokenize(source)
  let pos = 0
  const peek = () => tokens[pos]
  const accept = (value) => peek().value === value ? tokens[pos++] : null
  const expect = (value) => {
    const token = accept(value)
    if (!token) throw new JavaStepError(`Satır ${peek().line}: “${value}” bekleniyor; bu yapı desteklenen Java örneklerinden farklı.`)
    return token
  }
  const identifier = () => {
    const token = peek()
    if (!/^[A-Za-z_$][\w$]*$/.test(token.value) || token.value === "EOF") throw new JavaStepError(`Satır ${token.line}: değişken adı bekleniyor.`)
    pos++
    return token
  }
  const node = (kind, start, extra = {}) => ({ kind, line: start.line, start: start.start, end: tokens[pos - 1]?.end ?? start.end, ...extra })
  function expression(minimum = 0) {
    const start = peek()
    let left
    if (["!", "-", "+"].includes(peek().value)) {
      const op = tokens[pos++].value
      left = node("unary", start, { op, arg: expression(7) })
    } else if (accept("(")) {
      left = expression()
      expect(")")
    } else if (accept("new")) {
      const type = expect("int").value
      expect("[")
      const size = expression()
      expect("]")
      left = node("newArray", start, { type, size })
    } else if (accept("{")) {
      const items = []
      if (!accept("}")) {
        do { items.push(expression()) } while (accept(","))
        expect("}")
      }
      left = node("array", start, { items })
    } else if (/^\d/.test(peek().value)) {
      const raw = tokens[pos++].value
      const value = Number(raw.replace(/[lL]$/, ""))
      if (!Number.isSafeInteger(value) || (!/[lL]$/.test(raw) && value > 2147483647)) throw new JavaStepError("Bu örnek küçük tamsayılarla destekleniyor; sayı sınırı aşıldı.")
      left = node("literal", start, { value, type: /[lL]$/.test(raw) ? "long" : "int" })
    } else if (peek().value.startsWith('"')) {
      let value
      try { value = JSON.parse(tokens[pos++].value) } catch { throw new JavaStepError("Bu metindeki kaçış karakteri desteklenmiyor.") }
      left = node("literal", start, { value, type: "String" })
    } else if (["true", "false"].includes(peek().value)) {
      left = node("literal", start, { value: tokens[pos++].value === "true", type: "boolean" })
    } else {
      left = node("variable", start, { name: identifier().value })
    }
    while (true) {
      if (accept("[")) {
        const index = expression()
        expect("]")
        left = node("index", start, { array: left, index })
      } else if (accept(".")) {
        expect("length")
        left = node("length", start, { array: left })
      } else break
    }
    while ((PRECEDENCE[peek().value] ?? -1) >= minimum) {
      const op = tokens[pos++].value
      const right = expression(PRECEDENCE[op] + 1)
      left = node("binary", start, { op, left, right })
    }
    return left
  }
  function simple(semicolon = true) {
    const start = peek()
    let result
    if (TYPES.has(peek().value)) {
      let type = tokens[pos++].value
      if (accept("[")) { expect("]"); type += "[]" }
      if (type.endsWith("[]") && type !== "int[]") throw new JavaStepError("Bu sürümde array örnekleri int[] ile destekleniyor.")
      const name = identifier().value
      expect("=")
      result = node("declare", start, { type, name, value: expression() })
    } else {
      const target = expression()
      const op = tokens[pos++].value
      if (!["=", "+=", "-=", "*=", "/=", "%=", "++", "--"].includes(op) || !["variable", "index"].includes(target.kind)) throw new JavaStepError(`Satır ${start.line}: bu ifade henüz adımlanamıyor.`)
      result = node("assign", start, { target, op, value: ["++", "--"].includes(op) ? null : expression() })
    }
    if (semicolon) expect(";")
    result.end = tokens[pos - 1].end
    return result
  }
  function statement() {
    const start = peek()
    if (accept("{")) {
      const statements = []
      while (peek().value !== "}" && peek().value !== "EOF") statements.push(statement())
      expect("}")
      return node("block", start, { statements })
    }
    if (accept(";")) return node("empty", start)
    if (accept("for")) {
      expect("(")
      const init = peek().value === ";" ? null : simple(false)
      expect(";")
      const test = peek().value === ";" ? null : expression()
      expect(";")
      const update = peek().value === ")" ? null : simple(false)
      expect(")")
      const body = statement()
      return node("for", start, { init, test, update, body })
    }
    if (accept("while")) {
      expect("("); const test = expression(); expect(")")
      return node("while", start, { test, body: statement() })
    }
    if (accept("if")) {
      expect("("); const test = expression(); expect(")")
      const body = statement()
      const otherwise = accept("else") ? statement() : null
      return node("if", start, { test, body, otherwise })
    }
    if (accept("System")) {
      expect("."); expect("out"); expect("."); expect("println"); expect("(")
      const value = expression()
      expect(")"); expect(";")
      return node("print", start, { value })
    }
    return simple()
  }
  let method = null
  let parameters = []
  if (["public", "private", "protected", "static", "void"].includes(peek().value)) {
    while (["public", "private", "protected", "static"].includes(peek().value)) pos++
    expect("void")
    method = identifier().value
    expect("(")
    if (!accept(")")) {
      do {
        let type = tokens[pos++].value
        if (!TYPES.has(type)) throw new JavaStepError("Bu metodun parametre türü henüz desteklenmiyor.")
        if (accept("[")) { expect("]"); type += "[]" }
        parameters.push({ type, name: identifier().value })
      } while (accept(","))
      expect(")")
    }
  }
  const statements = []
  while (peek().value !== "EOF") statements.push(statement())
  if (method && (statements.length !== 1 || statements[0].kind !== "block")) throw new JavaStepError("Tek bir metot gövdesi bekleniyor.")
  const declarations = new Set(parameters.map(p => p.name))
  const references = new Set()
  const walk = value => {
    if (!value || typeof value !== "object") return
    if (value.kind === "declare") declarations.add(value.name)
    if (value.kind === "variable") references.add(value.name)
    for (const child of Object.values(value)) if (Array.isArray(child)) child.forEach(walk); else if (typeof child === "object") walk(child)
  }
  statements.forEach(walk)
  const inputs = { n: references.has("n") && (!declarations.has("n") || parameters.some(p => p.name === "n")), arr: references.has("arr") && (!declarations.has("arr") || parameters.some(p => p.name === "arr")) }
  if (parameters.some(p => !((p.name === "arr" && p.type === "int[]") || (p.name === "n" && p.type === "int")))) throw new JavaStepError("Metot örneklerinde şu anda int[] arr ve int n parametreleri destekleniyor.")
  return { source, statements, method, inputs }
}

const display = value => Array.isArray(value) ? `[${value.join(", ")}]` : typeof value === "string" ? JSON.stringify(value) : String(value)

export function buildTrace(program, options = {}) {
  const array = options.arr ?? (program.method === "insertionSort" ? [5, 2, 7, 3] : [7, 5, 9, 2, 3])
  const n = options.n ?? 4
  if (!Number.isInteger(n) || n < 0 || n > 12 || !Array.isArray(array) || array.length > 12 || array.some(v => !Number.isInteger(v) || v < -1000 || v > 1000)) throw new JavaStepError("n: 0–12; array: en fazla 12 adet, −1000 ile 1000 arasında tamsayı olmalı.")
  const scopes = [new Map()]
  if (program.inputs.n) scopes[0].set("n", { value: n, type: "int" })
  if (program.inputs.arr) scopes[0].set("arr", { value: [...array], type: "int[]" })
  const steps = []
  const output = []
  const loops = new Map()
  let comparisons = 0, writes = 0, budget = 5000, active = null, reads = [], changed = [], failureVariables = null
  const currentVariables = () => {
    const variables = Object.create(null)
    for (const scope of scopes) for (const [name, data] of scope) variables[name] = Array.isArray(data.value) ? [...data.value] : data.value
    return variables
  }
  const lookup = name => {
    for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(name)) return scopes[i].get(name)
    throw new JavaStepError(`“${name}” henüz tanımlı değil. Bu örneğe arr veya n dışında bir başlangıç değeri gerekiyorsa notta tanımlanmalı.`)
  }
  const text = node => program.source.slice(node.start, node.end).trim()
  const snapshot = (node, title, explanation, terminal = false, error = false) => {
    if (--budget < 0) throw new JavaStepError("Adım sınırına ulaşıldı. Döngü bitmiyor olabilir; daha küçük bir girdiyle dene.")
    const variables = error && failureVariables ? failureVariables : currentVariables()
    steps.push({ line: node?.line ?? null, title, explanation, variables, reads: reads.map(x => ({ ...x })), changed: [...changed], output: [...output], comparisons, writes, loops: Object.fromEntries(loops), terminal, error })
    reads = []; changed = []
  }
  const checkBoolean = result => {
    if (result.type !== "boolean") throw new JavaStepError("Java'da bu koşul boolean olmalı.")
    return result.value
  }
  const normalize = (value, type) => {
    if (type === "int") return value | 0
    if (type === "long" && !Number.isSafeInteger(value)) throw new JavaStepError("Bu long değeri görselleştiricinin güvenilir sayı aralığını aşıyor.")
    return value
  }
  function calculate(op, left, right) {
    const a = left.value, b = right.value
    const detail = `${display(a)} ${op} ${display(b)}`
    const arrayComparison = left.arrayRead || right.arrayRead
    if (["<", "<=", ">", ">=", "==", "!="].includes(op)) {
      if (["<", "<=", ">", ">="].includes(op) && (!["int", "long"].includes(left.type) || !["int", "long"].includes(right.type))) throw new JavaStepError("Bu karşılaştırma tamsayı gerektiriyor.")
      if (["==", "!="].includes(op) && left.type !== right.type && !(["int", "long"].includes(left.type) && ["int", "long"].includes(right.type))) throw new JavaStepError("Bu eşitlik karşılaştırmasının Java türleri uyuşmuyor.")
      if (["==", "!="].includes(op) && (left.type === "String" || left.type.endsWith("[]"))) throw new JavaStepError("Nesne referanslarının eşitliği bu görselleştiricide henüz desteklenmiyor.")
      if (arrayComparison) comparisons++
      let value
      switch (op) {
        case "<": value = a < b; break
        case "<=": value = a <= b; break
        case ">": value = a > b; break
        case ">=": value = a >= b; break
        case "==": value = a === b; break
        case "!=": value = a !== b; break
      }
      return { value, type: "boolean", detail, arrayRead: arrayComparison }
    }
    if (op === "+" && (left.type === "String" || right.type === "String")) return { value: String(a) + String(b), type: "String", detail }
    if (!["int", "long"].includes(left.type) || !["int", "long"].includes(right.type)) throw new JavaStepError("Bu aritmetik işlem yalnızca int ve long ile destekleniyor.")
    if ((op === "/" || op === "%") && b === 0) throw new JavaStepError("Sıfıra bölme: Java'da ArithmeticException oluşur.")
    const type = left.type === "long" || right.type === "long" ? "long" : "int"
    let value
    switch (op) {
      case "+": value = a + b; break
      case "-": value = a - b; break
      case "*": value = type === "int" ? Math.imul(a, b) : a * b; break
      case "/": value = Math.trunc(a / b); break
      case "%": value = a % b; break
      default: throw new JavaStepError("Bu işlem henüz desteklenmiyor.")
    }
    return { value: normalize(value, type), type, detail, arrayRead: arrayComparison }
  }
  function location(node) {
    if (node.kind === "variable") return { data: lookup(node.name), name: node.name }
    const arrayResult = evaluate(node.array)
    const indexResult = evaluate(node.index)
    if (arrayResult.type !== "int[]" || indexResult.type !== "int") throw new JavaStepError("Array erişimi int[] ve int index gerektiriyor.")
    const index = indexResult.value
    if (index < 0 || index >= arrayResult.value.length) throw new JavaStepError(`arr[${index}] geçersiz: geçerli index aralığı 0–${arrayResult.value.length - 1}. Java'da ArrayIndexOutOfBoundsException oluşur.`)
    return { array: arrayResult.value, index, name: node.array.kind === "variable" ? node.array.name : "arr" }
  }
  function evaluate(node) {
    switch (node.kind) {
      case "literal": return { value: node.value, type: node.type, detail: display(node.value) }
      case "variable": return { ...lookup(node.name), detail: `${node.name} = ${display(lookup(node.name).value)}` }
      case "length": {
        const result = evaluate(node.array)
        if (!Array.isArray(result.value)) throw new JavaStepError("length bu örneklerde yalnızca array için destekleniyor.")
        return { value: result.value.length, type: "int", detail: `${text(node)} = ${result.value.length}` }
      }
      case "array": {
        if (node.items.length > 12) throw new JavaStepError("Görselleştirme için array uzunluğu en fazla 12 olabilir.")
        const results = node.items.map(evaluate)
        if (results.some(x => x.type !== "int")) throw new JavaStepError("int[] yalnızca int değerler içerebilir.")
        return { value: results.map(x => x.value), type: "int[]", detail: text(node) }
      }
      case "newArray": {
        const size = evaluate(node.size)
        if (size.type !== "int" || size.value < 0 || size.value > 12) throw new JavaStepError("Görselleştirme için array uzunluğu 0–12 olmalı.")
        return { value: Array(size.value).fill(0), type: "int[]", detail: text(node) }
      }
      case "index": {
        const ref = location(node)
        reads.push({ name: ref.name, index: ref.index })
        return { value: ref.array[ref.index], type: "int", detail: `${ref.name}[${ref.index}] = ${ref.array[ref.index]}`, arrayRead: true }
      }
      case "unary": {
        const arg = evaluate(node.arg)
        if (node.op === "!") return { value: !checkBoolean(arg), type: "boolean", detail: `!${arg.value}` }
        if (!["int", "long"].includes(arg.type)) throw new JavaStepError("Bu tekli işlem tamsayı gerektiriyor.")
        return { value: normalize(node.op === "-" ? -arg.value : arg.value, arg.type), type: arg.type, detail: text(node), arrayRead: arg.arrayRead }
      }
      case "binary": {
        const left = evaluate(node.left)
        if (node.op === "&&" || node.op === "||") {
          const a = checkBoolean(left)
          if ((node.op === "&&" && !a) || (node.op === "||" && a)) return { value: a, type: "boolean", detail: `${left.detail} → ${a}; ikinci koşul kısa devre nedeniyle değerlendirilmez` }
          const right = evaluate(node.right)
          return { value: checkBoolean(right), type: "boolean", detail: `${left.detail} → ${a}; ${right.detail} → ${right.value}` }
        }
        return calculate(node.op, left, evaluate(node.right))
      }
      default: throw new JavaStepError("Bu ifade henüz desteklenmiyor.")
    }
  }
  function convert(result, type) {
    if (type !== result.type && !(type === "long" && result.type === "int")) throw new JavaStepError(`Java türü uyuşmuyor: ${result.type} → ${type}.`)
    return result.value
  }
  function execute(node) {
    active = node
    if (--budget < 0) throw new JavaStepError("Adım sınırına ulaşıldı; döngü bitmiyor olabilir.")
    switch (node.kind) {
      case "block":
        scopes.push(new Map())
        try { for (const child of node.statements) execute(child) }
        catch (error) { failureVariables ??= currentVariables(); throw error }
        finally { scopes.pop() }
        break
      case "empty": break
      case "declare": {
        if (scopes.some(s => s.has(node.name))) throw new JavaStepError(`“${node.name}” bu kapsamda zaten tanımlı.`)
        const result = evaluate(node.value)
        const value = convert(result, node.type)
        scopes.at(-1).set(node.name, { value, type: node.type })
        changed.push(node.name)
        let explanation = `${node.type} ${node.name} oluşturuldu. ${text(node.value)} → ${display(value)}.`
        if (node.name === "minIndex") explanation += " Bu konum şimdilik minimumun index'i; minimumun değeri arr[minIndex] ile okunur."
        if (node.name === "key") explanation += " Kaydırmalar sırasında kaybolmaması için yerleştirilecek değer burada saklanır."
        snapshot(node, node.name === "minIndex" ? "Geçici minimum seçildi" : "Değişken oluşturuldu", explanation)
        break
      }
      case "assign": {
        const ref = location(node.target)
        const previous = ref.data ? ref.data.value : ref.array[ref.index]
        let result
        if (node.op === "=") result = evaluate(node.value)
        else {
          const left = { value: previous, type: ref.data?.type ?? "int" }
          const right = node.value ? evaluate(node.value) : { value: 1, type: "int" }
          result = calculate(node.op === "++" ? "+" : node.op === "--" ? "-" : node.op[0], left, right)
          if (ref.data?.type === "int" && result.type === "long") result = { ...result, value: normalize(result.value, "int"), type: "int" }
        }
        const value = convert(result, ref.data?.type ?? "int")
        let label
        if (ref.data) { ref.data.value = value; label = ref.name; changed.push(ref.name) }
        else { ref.array[ref.index] = value; label = `${ref.name}[${ref.index}]`; changed.push(label); writes++ }
        snapshot(node, ref.data ? (ref.name === "minIndex" ? "Minimumun index'i güncellendi" : "Değişken güncellendi") : "Array'e değer yazıldı", `${label}: ${display(previous)} → ${display(value)}. ${node.value ? `${text(node.value)} → ${display(value)}.` : "Sayaç bir adım ilerledi."}`)
        break
      }
      case "print": {
        const result = evaluate(node.value)
        if (output.length >= 200) throw new JavaStepError("Çıktı sınırına ulaşıldı; daha küçük bir örnek seç.")
        output.push(String(result.value))
        snapshot(node, "Konsola yazıldı", `System.out.println: ${display(result.value)} çıktısı eklendi.`)
        break
      }
      case "if": {
        const result = evaluate(node.test)
        const yes = checkBoolean(result)
        snapshot(node, "Koşul kontrol edildi", `${text(node.test)} → ${result.detail} → ${yes}. ${yes ? "if gövdesi çalışacak." : node.otherwise ? "else gövdesi çalışacak." : "if gövdesi atlanır."}`)
        if (yes) execute(node.body); else if (node.otherwise) execute(node.otherwise)
        break
      }
      case "for":
      case "while": {
        scopes.push(new Map())
        const key = `Satır ${node.line}`
        loops.set(key, loops.get(key) ?? 0)
        try {
          if (node.init) execute(node.init)
          while (true) {
            active = node
            const result = node.test ? evaluate(node.test) : { value: true, type: "boolean", detail: "true" }
            const yes = checkBoolean(result)
            if (yes) loops.set(key, loops.get(key) + 1)
            snapshot(node, yes ? "Döngü gövdesine giriliyor" : "Döngü sona erdi", `${node.test ? text(node.test) : "Koşul yok"} → ${result.detail} → ${yes}. ${yes ? "Koşul doğru; bu tur çalışacak." : "Koşul yanlış; döngüden çıkılır."}`)
            if (!yes) break
            execute(node.body)
            if (node.update) execute(node.update)
          }
        } catch (error) { failureVariables ??= currentVariables(); throw error }
        finally { scopes.pop() }
        break
      }
      default: throw new JavaStepError("Bu Java ifadesi henüz desteklenmiyor.")
    }
  }
  snapshot(null, "Başlangıç", "Henüz hiçbir satır çalışmadı. Sonraki adım ile ilk işlemi incele.")
  try {
    for (const statement of program.statements) execute(statement)
    snapshot(null, "Kod tamamlandı", "Kodun bütün adımları tamamlandı. Geri giderek değişkenlerin ve array'in nasıl değiştiğini karşılaştırabilirsin.", true)
  } catch (error) {
    budget = 2
    snapshot(active, "İşlem burada durdu", error instanceof JavaStepError ? error.message : "Bu örnek henüz güvenilir biçimde adımlanamıyor.", true, true)
  }
  return steps
}
