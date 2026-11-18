import { JavaSteps } from "./quartz/plugins/java-steps"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const config = await loadQuartzConfig()
config.plugins.transformers.push(JavaSteps())
export default config
export const layout = await loadQuartzLayout()
