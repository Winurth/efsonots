import type { QuartzTransformerPlugin } from "../types"
import script from "./client.inline"
import styles from "./styles.scss"

export const JavaSteps: QuartzTransformerPlugin = () => ({
  name: "JavaSteps",
  externalResources() {
    return {
      css: [{ content: styles, inline: true }],
      js: [{ script, loadTime: "afterDOMReady", contentType: "inline", moduleType: "module" }],
    }
  },
})
