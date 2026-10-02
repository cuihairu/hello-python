import { defineConfig } from 'vitepress'
import sidebar from './sidebar.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'Hello Python',
  description: 'Python 语言知识体系：从语法入门到面向对象、并发编程与工程实践',
  base: '/hello-python/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/hello-python/favicon.svg' }]
  ],

  ignoreDeadLinks: true,

  // 外部写入 docs/ 的平行编号目录（01-…06-）：隔离出构建，归属未明不进站
  srcExclude: ['0[1-6]-*/*.md', '0[1-6]-*/**/*.md'],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Hello Python',

    nav: [
      { text: '首页', link: '/' },
      { text: '入门', link: '/basics/setup' },
      { text: '数据结构', link: '/datastructures/list-tuple' },
      { text: '进阶', link: '/advanced/oop' },
      { text: '并发编程', link: '/concurrency/threading' },
      { text: '工程实践', link: '/engineering/stdlib' }
    ],

    // 本仓无 mdbook 遗留，sidebar.json 为手工编排的目录
    sidebar: sidebar as never,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cuihairu/hello-python' }
    ],

    footer: {
      message: 'Hello Python',
      copyright: '© 2025 cuihairu'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },

    outline: {
      label: '页面导航',
      level: [2, 3]
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdated: {
      text: '最后更新'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  markdown: {
    lineNumbers: false
  }
})
