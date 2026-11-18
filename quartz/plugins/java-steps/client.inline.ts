// @ts-nocheck
import { parseJava, buildTrace } from "./engine.mjs"

const make = (tag, className = "", value = "") => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (value !== "") node.textContent = value
  return node
}
const button = (label, className = "") => {
  const node = make("button", className, label)
  node.type = "button"
  return node
}
const valueText = value => Array.isArray(value) ? `[${value.join(", ")}]` : String(value)

function attach(pre) {
  const code = pre.querySelector("code")
  if (!code || pre.dataset.javaStepsAttached || pre.closest(".popover, .java-steps")) return
  pre.dataset.javaStepsAttached = "true"
  const lineNodes = [...code.querySelectorAll(":scope > [data-line]")]
  const source = lineNodes.length ? lineNodes.map(line => line.textContent).join("\n") : code.textContent
  const lines = source.split("\n")
  const host = pre.closest("figure") || pre
  const details = make("details", "java-steps")
  const summary = make("summary", "java-steps-summary")
  summary.append(make("span", "java-steps-summary-title", "Adım adım incele"), make("span", "java-steps-summary-note", "Java · etkileşimli"))
  details.append(summary)
  host.insertAdjacentElement("afterend", details)
  let initialized = false, timer = null, frames = [], index = 0, program
  let render = () => {}
  let playButton
  const clearHighlight = () => lineNodes.forEach(node => node.classList.remove("java-steps-active-line"))
  const stop = () => {
    if (timer !== null) window.clearInterval(timer)
    timer = null
    if (playButton) { playButton.textContent = "▶ Oynat"; playButton.setAttribute("aria-pressed", "false") }
  }
  const cleanup = () => { stop(); clearHighlight() }
  if (typeof window.addCleanup === "function") window.addCleanup(cleanup)

  function initialize() {
    initialized = true
    const body = make("div", "java-steps-body")
    details.append(body)
    try { program = parseJava(source) } catch (error) {
      const note = make("p", "java-steps-notice", "Bu blok için henüz adımlama yok. " + error.message)
      const support = make("p", "java-steps-muted", "Desteklenen örnekler: int / long, int[], for, while, if ve System.out.println. Tam Java desteği içermez.")
      body.append(note, support)
      return
    }
    const top = make("div", "java-steps-top")
    const title = make("strong", "java-steps-title", "Başlangıç")
    const position = make("span", "java-steps-position")
    top.append(title, position)

    const inputs = make("details", "java-steps-inputs")
    inputs.append(make("summary", "", "Örnek veriyi değiştir"))
    const form = make("form", "java-steps-form")
    const arrayInput = make("input")
    arrayInput.type = "text"
    arrayInput.value = program.method === "insertionSort" ? "5, 2, 7, 3" : "7, 5, 9, 2, 3"
    arrayInput.maxLength = 100
    arrayInput.autocomplete = "off"
    const nInput = make("input")
    nInput.type = "number"; nInput.min = "0"; nInput.max = "12"; nInput.step = "1"; nInput.value = "4"
    for (const [enabled, label, input] of [[program.inputs.arr, "arr · virgülle ayrılmış tamsayılar", arrayInput], [program.inputs.n, "n · 0 ile 12 arasında", nInput]]) {
      if (enabled) { const field = make("label"); field.append(make("span", "", label), input); form.append(field) }
    }
    const apply = button("Bu veriyle başlat")
    apply.type = "submit"
    const inputError = make("p", "java-steps-error")
    inputError.setAttribute("role", "alert")
    form.append(apply, inputError)
    inputs.append(form)

    const current = make("div", "java-steps-current")
    const lineLabel = make("span", "java-steps-line-label")
    const currentCode = make("code")
    current.append(lineLabel, currentCode)
    const arrays = make("div", "java-steps-arrays")
    const vars = make("dl", "java-steps-variables")
    const explanation = make("p", "java-steps-explanation")
    explanation.setAttribute("aria-live", "polite")
    explanation.setAttribute("aria-atomic", "true")
    const stats = make("div", "java-steps-stats")
    const consoleDetails = make("details", "java-steps-console")
    const consoleLabel = make("summary", "", "Konsol çıktısı")
    const consoleOutput = make("pre")
    consoleDetails.append(consoleLabel, consoleOutput)

    const controls = make("div", "java-steps-controls")
    const previous = button("← Geri")
    playButton = button("▶ Oynat")
    playButton.setAttribute("aria-pressed", "false")
    const reset = button("Sıfırla", "java-steps-reset")
    const next = button("Sonraki adım →", "java-steps-next")
    const speedLabel = make("label", "java-steps-speed")
    speedLabel.append(make("span", "", "Hız"))
    const speed = make("select")
    for (const [value, label] of [[1500, "Yavaş"], [900, "Normal"], [450, "Hızlı"]]) {
      const option = make("option", "", label); option.value = String(value); speed.append(option)
    }
    speed.value = "900"
    speedLabel.append(speed)
    controls.append(previous, playButton, speedLabel, reset, next)

    const progress = make("input", "java-steps-progress")
    progress.type = "range"; progress.min = "0"; progress.step = "1"
    progress.setAttribute("aria-label", "Kodun adımları arasında gezin")
    const caption = make("p", "java-steps-caption", "Her adım, gösterilen satırdaki işlemin sonrasını gösterir. Renkler: minimum · okunan hücre · yazılan hücre.")
    const scope = make("p", "java-steps-footnote", "Bu panel, desteklenen Java örneğinin adımlarını gösterir. Tam bir Java çalıştırıcısı değildir.")
    body.append(top)
    if (program.inputs.arr || program.inputs.n) body.append(inputs)
    body.append(current, arrays, vars, explanation, stats, consoleDetails, progress, controls, caption, scope)

    const renderArray = (name, values, frame) => {
      const section = make("div", "java-steps-array-section")
      const label = make("div", "java-steps-array-name", `${name} · ${values.length} eleman`)
      const row = make("div", "java-steps-array")
      row.setAttribute("role", "list")
      row.setAttribute("aria-label", `${name}: ${valueText(values)}`)
      if (!values.length) row.append(make("span", "java-steps-muted", "Boş array [ ]"))
      values.forEach((value, i) => {
        const cell = make("div", "java-steps-cell")
        cell.setAttribute("role", "listitem")
        const markers = []
        if (name === "arr") {
          for (const key of ["i", "j", "minIndex"]) if (frame.variables[key] === i) markers.push(key === "minIndex" ? "min" : key)
          if (frame.variables.minIndex === i) cell.classList.add("is-min")
        }
        if (frame.reads.some(ref => ref.name === name && ref.index === i)) cell.classList.add("is-read")
        if (frame.changed.includes(name) || frame.changed.includes(`${name}[${i}]`)) cell.classList.add("is-write")
        cell.append(make("span", "java-steps-cell-markers", markers.join(" · ")), make("strong", "java-steps-cell-value", String(value)), make("span", "java-steps-cell-index", `[${i}]`))
        cell.title = `${name}[${i}] = ${value}${markers.length ? " · " + markers.join(", ") : ""}`
        row.append(cell)
      })
      section.append(label, row)
      return section
    }
    render = () => {
      const frame = frames[index]
      if (!frame) return
      title.textContent = frame.title
      position.textContent = `Adım ${index} / ${frames.length - 1}`
      currentCode.textContent = frame.line ? (lines[frame.line - 1] || "").trim() : frame.terminal ? "Tamamlandı" : "Başlangıç durumu"
      lineLabel.textContent = frame.line ? `Son çalıştırılan satır · ${frame.line}` : "Henüz satır çalışmadı"
      if (frame.terminal) lineLabel.textContent = frame.error ? `Durma noktası · satır ${frame.line ?? "?"}` : "Son durum"
      explanation.textContent = frame.explanation
      explanation.classList.toggle("has-error", frame.error)
      arrays.replaceChildren()
      vars.replaceChildren()
      for (const [name, value] of Object.entries(frame.variables)) {
        if (Array.isArray(value)) arrays.append(renderArray(name, value, frame))
        else {
          const pair = make("div", frame.changed.includes(name) ? "is-changed" : "")
          pair.append(make("dt", "", name), make("dd", "", valueText(value)))
          vars.append(pair)
        }
      }
      const currentArray = frame.variables.arr
      const minimum = frame.variables.minIndex
      if (Array.isArray(currentArray) && Number.isInteger(minimum) && minimum >= 0 && minimum < currentArray.length) {
        const pair = make("div")
        pair.append(make("dt", "", "arr[minIndex]"), make("dd", "", String(currentArray[minimum])))
        vars.append(pair)
      }
      vars.hidden = vars.childElementCount === 0
      stats.replaceChildren()
      for (const [label, value] of Object.entries(frame.loops)) stats.append(make("span", "", `${label}: ${value} tur`))
      if (program.inputs.arr || Object.values(frame.variables).some(Array.isArray)) {
        stats.append(make("span", "", `${frame.comparisons} eleman karşılaştırması`), make("span", "", `${frame.writes} array yazımı`))
      }
      consoleDetails.hidden = !source.includes("System.out.println")
      consoleLabel.textContent = `Konsol çıktısı · ${frame.output.length} satır`
      consoleOutput.textContent = frame.output.length ? frame.output.join("\n") : "Henüz çıktı yok."
      previous.disabled = index === 0
      next.disabled = index === frames.length - 1
      playButton.disabled = index === frames.length - 1
      reset.disabled = index === 0
      progress.max = String(frames.length - 1)
      progress.value = String(index)
      progress.setAttribute("aria-valuetext", `Adım ${index}: ${frame.title}`)
      clearHighlight()
      if (details.open && frame.line && lineNodes[frame.line - 1]) lineNodes[frame.line - 1].classList.add("java-steps-active-line")
    }
    const rerun = () => {
      stop()
      const raw = arrayInput.value.trim()
      if (program.inputs.arr && raw && !/^-?\d+(?:\s*,\s*-?\d+)*$/.test(raw)) throw new Error("Array'i 7, 5, 9, 2, 3 biçiminde yaz. Boş array için alanı boş bırak.")
      const arr = raw ? raw.split(",").map(value => Number(value.trim())) : []
      frames = buildTrace(program, { n: Number(nInput.value), arr })
      index = 0
      inputError.textContent = ""
      render()
    }
    const advance = () => {
      if (index < frames.length - 1) { index++; render() }
      if (index === frames.length - 1) stop()
    }
    const play = () => {
      if (timer !== null) { stop(); return }
      if (index === frames.length - 1) return
      playButton.textContent = "Ⅱ Duraklat"
      playButton.setAttribute("aria-pressed", "true")
      timer = window.setInterval(advance, Number(speed.value))
    }
    previous.addEventListener("click", () => { stop(); if (index > 0) { index--; render() } })
    next.addEventListener("click", () => { stop(); advance() })
    playButton.addEventListener("click", play)
    reset.addEventListener("click", () => { stop(); index = 0; render() })
    speed.addEventListener("change", () => { if (timer !== null) { stop(); play() } })
    progress.addEventListener("input", () => { stop(); index = Number(progress.value); render() })
    form.addEventListener("submit", event => {
      event.preventDefault()
      try { rerun() } catch (error) { inputError.textContent = error.message }
    })
    try { rerun() } catch (error) { inputError.textContent = error.message }
  }
  details.addEventListener("toggle", () => {
    if (details.open) { if (!initialized) initialize(); else render() }
    else { stop(); clearHighlight() }
  })
}

function mount() {
  for (const pre of document.querySelectorAll('pre[data-language="java"], pre:has(code.language-java)')) attach(pre)
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true })
else mount()
document.addEventListener("nav", mount)
document.addEventListener("render", mount)
