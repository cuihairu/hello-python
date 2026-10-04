import { defineConfig } from 'vitepress'
import sidebar from './sidebar.json' with { type: 'json' }

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-CN',
  title: 'Hello Python',
  description: 'Python 语言知识体系：从语法入门到面向对象、并发编程与工程实践',
  base: '/hello-python/',
  cleanUrls: true,
  lastUpdated: true,

  sitemap: {
    hostname: 'https://cuihairu.github.io',
    // vitepress 生成的 item url 不含 base，子路径部署需手动补
    transformItems: (items) =>
      items.map((item) => ({
        ...item,
        url: ('/hello-python/' + String(item.url).replace(/^\//, ''))
      }))
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/hello-python/favicon.svg' }]
  ],

  ignoreDeadLinks: false,

  // 外部写入 docs/ 的平行编号目录（01-…06-）：隔离出构建，归属未明不进站
  srcExclude: ['0[1-6]-*/*.md', '0[1-6]-*/**/*.md'],

  // 逐页补社交分享标签；无 og:image（仓库只有 SVG 图，爬虫不支持，宁缺毋假）
  transformHead: ({ pageData, siteData }) => {
    const url =
      'https://cuihairu.github.io/hello-python/' +
      String(pageData.relativePath).replace(/(index)?\.md$/, '')
    const head: [string, Record<string, string>][] = [
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: siteData.title }],
      ['meta', { property: 'og:title', content: pageData.title }],
      ['meta', { property: 'og:url', content: url }]
    ]
    const desc = pageData.description || siteData.description
    if (desc) head.push(['meta', { property: 'og:description', content: desc }])
    return head
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Hello Python',

    nav: [
      { text: '首页', link: '/' },
      { text: '入门', link: '/basics/setup' },
      { text: '数据结构', link: '/datastructures/list-tuple' },
      { text: '进阶', link: '/advanced/oop' },
      { text: '并发编程', link: '/concurrency/threading' },
      { text: '工程实践', link: '/engineering/stdlib' },
      { text: '源码解析', link: '/internals/cpython-source' }
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

    editLink: {
      pattern: 'https://github.com/cuihairu/hello-python/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
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
        },
        // MiniSearch 默认按空白/标点切词，中文整句成为一个 token，查询基本落空；
        // 这里把汉字串切成二元组（单字落单时保留单字），拉丁/数字仍按词切
        miniSearch: {
          options: {
            tokenize: (text: string): string[] => {
              const tokens: string[] = []
              for (const word of text.toLowerCase().split(/[^\p{L}\p{N}_]+/u)) {
                if (!word) continue
                if (/^[㐀-䶿一-鿿]+$/.test(word)) {
                  if (word.length === 1) {
                    tokens.push(word)
                  } else {
                    for (let i = 0; i < word.length - 1; i++) tokens.push(word.slice(i, i + 2))
                  }
                } else {
                  tokens.push(word)
                }
              }
              return tokens
            }
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
