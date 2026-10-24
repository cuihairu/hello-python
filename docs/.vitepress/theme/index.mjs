import DefaultTheme from 'vitepress/theme'
import '@fontsource-variable/outfit'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './style.css'

// 404 页文案在 .vitepress/config.mts 的 themeConfig.locales.<locale>.notFound：
// NotFound 组件只读 useData().theme（即按 locale 合并后的 themeConfig），theme 模块上的键不会被消费
export default {
  extends: DefaultTheme
}
