import { defineConfig } from 'vitepress'
import sidebarEn from './sidebar.en.json' with { type: 'json' }
import sidebarZh from './sidebar.zh.json' with { type: 'json' }

// 双语分址：英文页在根目录，中文页在 /zh/（VitePress locales 按路径前缀选 locale）。
// themeConfig 下的键按 locale 全覆盖，避免依赖跨层合并顺序。
const HOST = 'https://cuihairu.github.io'
const SITE_BASE = '/hello-python/'
const EDIT_PATTERN = 'https://github.com/cuihairu/hello-python/edit/main/docs/:path'

// 中文整句会被 MiniSearch 当成单个 token，查询基本落空；
// 这里把汉字串切成二元组（单字落单时保留单字），拉丁/数字仍按词切
const cjkTokenizer = {
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

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Hello Python',
  description: 'Field notes from a game developer on Python in real projects — observations, trade-offs and gotchas across the language, concurrency and engineering practice.',
  base: SITE_BASE,
  cleanUrls: true,
  lastUpdated: true,

  sitemap: {
    hostname: HOST,
    // xhtml 命名空间是 hreflang 互指的序列化前提
    xmlns: { xhtml: true },
    // vitepress 生成的 item url 不含 base，子路径部署需手动补；
    // 随后按 /zh/ 前缀算出对偶 locale 的 hreflang
    transformItems: (items) =>
      items
        .map((item) => ({
          ...item,
          url: (SITE_BASE + String(item.url).replace(/^\//, ''))
        }))
        .map((item) => {
          // 404 是软着陆页，没有对偶语言，不挂 alternates
          if (item.url.endsWith('/404')) return item
          const path = '/' + item.url.slice(SITE_BASE.length)
          const enPath = path === '/zh/' || path === '/zh' ? '/' : path.replace(/^\/zh(?=\/|$)/, '')
          const zhPath = enPath === '/' ? '/zh/' : '/zh' + enPath
          const origin = HOST + SITE_BASE
          return {
            ...item,
            links: [
              { lang: 'en-US', hreflang: 'en-US', url: origin + enPath.replace(/^\//, '') },
              { lang: 'zh-CN', hreflang: 'zh-CN', url: origin + zhPath.replace(/^\//, '') },
              { lang: 'x-default', hreflang: 'x-default', url: origin + enPath.replace(/^\//, '') }
            ]
          }
        })
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/hello-python/favicon.svg' }],
    // PNG 兜底：部分浏览器/场景不支持 SVG favicon，按 sizes 提供 16/32
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/hello-python/favicon-32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/hello-python/favicon-16.png' }],
    ['link', { rel: 'manifest', href: '/hello-python/site.webmanifest' }],
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

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      description: 'Field notes from a game developer on Python in real projects — observations, trade-offs and gotchas across the language, concurrency and engineering practice.'
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      description: '游戏开发者的 Python 经验记录，整理语言、并发与工程实践中的观察、取舍和踩坑。'
    }
  },

  // 逐页补社交分享标签（og:image 用 og-image.png 静态卡）；
  // og:locale 与 JSON-LD inLanguage 跟随当前 locale，英文页不能带 zh_CN
  transformHead: ({ pageData, siteData }) => {
    // 404 是所有坏地址的软着陆页，不该带指向自身的 og:url/canonical/JSON-LD
    if (pageData.relativePath === '404.md') return []
    const isZh = pageData.localeIndex === 'zh'
    // relativePath 在 /zh/ 下带 zh/ 前缀，canonical 直接拼，不要二次剥前缀
    const url =
      HOST + SITE_BASE + String(pageData.relativePath).replace(/(index)?\.md$/, '')
    const head: [string, Record<string, string>, string?][] = [
      // canonical 收敛 URL 变体（尾斜杠/大小写/旧链），避免站外引用分权重
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: siteData.title }],
      ['meta', { property: 'og:title', content: pageData.title }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:locale', content: isZh ? 'zh_CN' : 'en_US' }]
    ]
    const desc = pageData.description || siteData.description
    if (desc) head.push(['meta', { property: 'og:description', content: desc }])

    // JSON-LD：首页 WebSite，内页 TechArticle（爬虫可读的页面语义）
    const isHome =
      pageData.relativePath === 'index.md' || pageData.relativePath === 'zh/index.md'
    const jsonLd = isHome
      ? {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteData.title,
          description: siteData.description,
          url: HOST + SITE_BASE + (isZh ? 'zh/' : ''),
          inLanguage: isZh ? 'zh-CN' : 'en-US'
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: pageData.title,
          description: desc,
          url,
          inLanguage: isZh ? 'zh-CN' : 'en-US',
          image: HOST + SITE_BASE + 'og-image.png',
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

    socialLinks: [
      { icon: 'github', link: 'https://github.com/cuihairu/hello-python' }
    ],

    footer: {
      message: 'Hello Python',
      copyright: '© 2025 cuihairu'
    },

    editLink: { pattern: EDIT_PATTERN },
    outline: { level: [2, 3] },

    locales: {
      root: {
        label: 'English',
        lang: 'en-US',

        nav: [
          { text: 'Home', link: '/' },
          { text: 'Basics', link: '/basics/setup' },
          { text: 'Data Structures', link: '/datastructures/list-tuple' },
          { text: 'Advanced', link: '/advanced/oop' },
          { text: 'Concurrency', link: '/concurrency/threading' },
          { text: 'Engineering', link: '/engineering/stdlib' },
          { text: 'Internals', link: '/internals/cpython-source' },
          { text: 'Timeline', link: '/timeline' },
          { text: 'Knowledge', link: '/knowledge/' }
        ],

        // sidebar.en.json 是英文侧栏真源；维护规则见 /navigation
        sidebar: sidebarEn as never,

        search: {
          provider: 'local',
          options: {
            miniSearch: cjkTokenizer
          }
        },

        editLink: { text: 'Edit this page on GitHub' },
        outline: { label: 'On this page' },

        docFooter: {
          prev: 'Previous',
          next: 'Next'
        },

        lastUpdated: {
          text: 'Last updated'
        },

        returnToTopLabel: 'Back to top',
        sidebarMenuLabel: 'Menu',
        navMenuLabel: 'Main navigation',
        mobileMenuLabel: 'Open menu',
        skipToContentLabel: 'Skip to content',
        darkModeSwitchLabel: 'Appearance',
        lightModeSwitchTitle: 'Switch to light mode',
        darkModeSwitchTitle: 'Switch to dark mode',

        notFound: {
          title: 'Page Not Found',
          quote: 'The address may be out of date, or it may never have existed.',
          linkText: 'Take me home',
          linkLabel: 'Take me home'
        }
      },

      zh: {
        label: '简体中文',
        lang: 'zh-CN',
        link: '/zh/',

        nav: [
          { text: '首页', link: '/zh/' },
          { text: '入门', link: '/zh/basics/setup' },
          { text: '数据结构', link: '/zh/datastructures/list-tuple' },
          { text: '进阶', link: '/zh/advanced/oop' },
          { text: '并发编程', link: '/zh/concurrency/threading' },
          { text: '工程实践', link: '/zh/engineering/stdlib' },
          { text: '源码解析', link: '/zh/internals/cpython-source' },
          { text: '时间线', link: '/zh/timeline' },
          { text: '知识体系', link: '/zh/knowledge/' }
        ],

        // sidebar.zh.json 是中文侧栏真源；维护规则见 /zh/navigation
        sidebar: sidebarZh as never,

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
            miniSearch: cjkTokenizer
          }
        },

        editLink: { text: '在 GitHub 上编辑此页' },
        outline: { label: '页面导航' },

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
        darkModeSwitchTitle: '切换到深色模式',

        // 404 页默认值全英文（PAGE NOT FOUND / Take me home / 英文格言），中文站本地化
        notFound: {
          title: '页面不存在',
          quote: '地址可能已经失效，或者从未存在过。',
          linkText: '返回首页',
          linkLabel: '返回首页'
        }
      }
    }
  },

  markdown: {
    lineNumbers: false
  }
})
