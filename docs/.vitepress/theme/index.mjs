import DefaultTheme from 'vitepress/theme'
import '@fontsource-variable/outfit'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './style.css'

export default {
  extends: DefaultTheme,
  notFound: {
    code: '404',
    title: '页面未找到',
    quote: '但如果你不改变方向，继续寻找，你可能会到达你本要去的地方。',
    linkText: '回到首页',
    linkLabel: '回到首页'
  }
}
