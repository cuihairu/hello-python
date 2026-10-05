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
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/hello-python/favicon.svg' }],
    // PNG 兜底：部分浏览器/场景不支持 SVG favicon，按 sizes 提供 16/32
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/hello-python/favicon-32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/hello-python/favicon-16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/hello-python/apple-touch-icon.png' }],
    // 移动端浏览器地址栏着色，取两种模式的真实页面底色；
    // media 放首位：mergeHead 取首个非 content 属性做去重键，靠 media 区分两条
    ['meta', { media: '(prefers-color-scheme: light)', name: 'theme-color', content: '#ffffff' }],
    ['meta', { media: '(prefers-color-scheme: dark)', name: 'theme-color', content: '#0d1117' }],
    // 分享卡片图与 twitter 卡型；图为 1200x630 静态卡，由 logo.svg 栅格化合成
    ['meta', { property: 'og:image', content: 'https://cuihairu.github.io/hello-python/og-image.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],

  ignoreDeadLinks: false,

  // 外部写入 docs/ 的平行编号目录（01-…06-）：隔离出构建，归属未明不进站
  srcExclude: ['0[1-6]-*/*.md', '0[1-6]-*/**/*.md'],

  // 逐页补社交分享标签（og:image 用 og-image.png 静态卡）
  transformHead: ({ pageData, siteData }) => {
    const url =
      'https://cuihairu.github.io/hello-python/' +
      String(pageData.relativePath).replace(/(index)?\.md$/, '')
    const head: [string, Record<string, string>, string?][] = [
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: siteData.title }],
      ['meta', { property: 'og:title', content: pageData.title }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }]
    ]
    const desc = pageData.description || siteData.description
    if (desc) head.push(['meta', { property: 'og:description', content: desc }])

    // JSON-LD：首页 WebSite，内页 TechArticle（爬虫可读的页面语义）
    const isHome = pageData.relativePath === 'index.md'
    const jsonLd = isHome
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteData.title,
          description: siteData.description,
          url: 'https://cuihairu.github.io/hello-python/',
          inLanguage: 'zh-CN'
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: pageData.title,
          description: desc,
          url,
          inLanguage: 'zh-CN',
          image: 'https://cuihairu.github.io/hello-python/og-image.png',
          author: { '@type': 'Person', name: 'cuihairu' },
          publisher: { '@type': 'Person', name: 'cuihairu' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url }
        }
    head.push(['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)])
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
    navMenuLabel: '主导航',
    mobileMenuLabel: '打开菜单',
    skipToContentLabel: '跳到正文',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  markdown: {
    lineNumbers: false
  }
})
