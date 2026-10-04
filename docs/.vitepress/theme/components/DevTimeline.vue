<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ERAS, FIELD_LABELS, TIMELINE } from '../data/timeline'
import type { TimelineEvent } from '../data/timeline'

type Field = TimelineEvent['field']
type Filter = 'all' | Field

type ListedEvent = TimelineEvent & { idx: number }

const EVENTS: ListedEvent[] = TIMELINE.map((e, idx) => ({ ...e, idx }))
const fields = Object.keys(FIELD_LABELS) as Field[]

const filter = ref<Filter>('all')
const expanded = ref<number | null>(null)

const counts = computed<Record<Filter, number>>(() => {
  const c: Record<Filter, number> = { all: EVENTS.length, core: 0, concurrency: 0, ecosystem: 0, engineering: 0 }
  for (const e of EVENTS) c[e.field] += 1
  return c
})

// 当前筛选下的分期视图；空分期整块隐藏
const periods = computed(() =>
  ERAS.map((era) => ({
    ...era,
    events: EVENTS.filter(
      (e) => e.year >= era.from && e.year <= era.to && (filter.value === 'all' || e.field === filter.value),
    ),
  })).filter((p) => p.events.length > 0),
)

// 通读区专用：永远给全量数据，不随筛选收窄
function periodsOf(list: ListedEvent[]) {
  return ERAS.map((era) => ({
    ...era,
    events: list.filter((e) => e.year >= era.from && e.year <= era.to),
  })).filter((p) => p.events.length > 0)
}

function yearLabel(e: TimelineEvent) {
  return e.month ? `${e.year}.${String(e.month).padStart(2, '0')}` : String(e.year)
}

// 站内链接补 base 前缀，防 Pages 子路径 404
function withBase(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  return base.replace(/\/$/, '') + path
}

function toggle(idx: number) {
  expanded.value = expanded.value === idx ? null : idx
}

// 滚动进场：尊重 prefers-reduced-motion，命中则直接呈现。
// 筛选切换会卸载/重挂分期块，重挂的是新 DOM，periods 变化后必须补观察
let observer: IntersectionObserver | null = null

function observeEras() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer!.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12 },
    )
  }
  document.querySelectorAll('.tl-era:not(.in)').forEach((el) => observer!.observe(el))
}

onMounted(observeEras)
watch(periods, () => nextTick(observeEras))
</script>

<template>
  <div class="tl">
    <div class="tl-chips" role="group" aria-label="按领域筛选时间线">
      <button
        type="button"
        class="tl-chip"
        :class="{ active: filter === 'all' }"
        :aria-pressed="filter === 'all'"
        @click="filter = 'all'"
      >全部 <b>{{ counts.all }}</b></button>
      <button
        v-for="f in fields"
        :key="f"
        type="button"
        class="tl-chip"
        :class="{ active: filter === f }"
        :aria-pressed="filter === f"
        @click="filter = f"
      >{{ FIELD_LABELS[f] }} <b>{{ counts[f] }}</b></button>
    </div>

    <section v-for="p in periods" :key="p.name" class="tl-era">
      <header class="tl-era-head">
        <span class="tl-era-mark" aria-hidden="true">&gt;&gt;&gt;</span>
        <div class="tl-era-title">
          <h3>{{ p.name }}</h3>
          <p class="tl-era-range">{{ p.from }} → {{ p.to }}</p>
        </div>
      </header>
      <p class="tl-era-intro">{{ p.intro }}</p>

      <ol class="tl-list">
        <li
          v-for="(e, i) in p.events"
          :key="e.idx"
          class="tl-node"
          :class="{ open: expanded === e.idx }"
          :style="{ '--i': Math.min(i, 8) }"
        >
          <button
            type="button"
            class="tl-row"
            :aria-expanded="expanded === e.idx"
            :aria-controls="`tl-detail-${e.idx}`"
            @click="toggle(e.idx)"
          >
            <span class="tl-year">{{ yearLabel(e) }}</span>
            <span class="tl-title">{{ e.title }}</span>
            <span class="tl-field">{{ FIELD_LABELS[e.field] }}</span>
          </button>

          <div :id="`tl-detail-${e.idx}`" class="tl-detail">
            <div class="tl-detail-inner">
              <dl>
                <dt>谁做的</dt>
                <dd>{{ e.who }}</dd>
                <dt>为什么是这个时候</dt>
                <dd>{{ e.why }}</dd>
                <template v-if="e.link">
                  <dt>站内对应</dt>
                  <dd><a class="tl-link" :href="withBase(e.link)">{{ e.link }}</a></dd>
                </template>
              </dl>
            </div>
          </div>
        </li>
      </ol>
    </section>

    <section class="tl-readall">
      <h3>按时期通读全部节点</h3>
      <div v-for="p in periodsOf(EVENTS)" :key="p.name" class="tl-readall-era">
        <h4>{{ p.name }}（{{ p.from }} → {{ p.to }}）</h4>
        <ul>
          <li v-for="e in p.events" :key="e.idx">
            <code>{{ yearLabel(e) }}</code>
            {{ e.title }}（{{ e.who }}）
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tl {
  margin-top: 12px;
}

/* ── 筛选 chips ─────────────────────────────── */
.tl-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 28px;
}

.tl-chip {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 4px 14px;
  font-size: 13px;
  line-height: 20px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.tl-chip b {
  font-weight: 600;
  margin-left: 2px;
  color: var(--vp-c-text-3);
  transition: color 0.2s;
}

.tl-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.tl-chip.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
}

.tl-chip.active b {
  color: #fff;
}

/* 键盘走查：自定义按钮给品牌色焦点环，不依赖 UA 默认样式 */
.tl-chip:focus-visible,
.tl-row:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

/* ── 分期块 ─────────────────────────────────── */
.tl-era {
  margin-bottom: 40px;
}

.tl-era-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.tl-era-mark {
  font-family: var(--vp-font-family-mono);
  font-size: 15px;
  opacity: 0.5;
  letter-spacing: 2px;
  user-select: none;
}

.tl-era-title h3 {
  margin: 0;
  font-size: 19px;
  line-height: 28px;
}

.tl-era-range {
  margin: 2px 0 0;
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
}

.tl-era-intro {
  margin: 10px 0 18px;
  max-width: 640px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* ── 节点列表与脊线 ─────────────────────────── */
.tl-list {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tl-list::before {
  content: '';
  position: absolute;
  left: 76px;
  top: 10px;
  bottom: 10px;
  width: 1px;
  background: var(--vp-c-divider);
}

.tl-node {
  position: relative;
  padding-left: 100px;
}

.tl-node::before {
  content: '';
  position: absolute;
  left: 72px;
  top: 13px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-bg);
  transition: box-shadow 0.2s;
}

.tl-node.open::before {
  box-shadow: 0 0 0 3px var(--vp-c-bg), 0 0 0 6px var(--vp-c-brand-soft);
}

/* ── 节点行 ─────────────────────────────────── */
.tl-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  width: 100%;
  padding: 6px 8px 6px 0;
  border: 0;
  background: transparent;
  text-align: left;
  font-size: 15px;
  line-height: 24px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.tl-row:hover {
  background: var(--vp-c-bg-soft);
}

.tl-year {
  flex: 0 0 52px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.tl-title {
  flex: 1;
  font-weight: 500;
}

.tl-row:hover .tl-title {
  color: var(--vp-c-brand-1);
}

.tl-field {
  flex: 0 0 auto;
  font-size: 12px;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
}

/* ── 展开详情 ───────────────────────────────── */
.tl-detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease, opacity 0.25s ease;
  opacity: 0.25;
}

.tl-node.open .tl-detail {
  grid-template-rows: 1fr;
  opacity: 1;
}

.tl-detail-inner {
  overflow: hidden;
  margin: 0 0 0 0;
  padding-left: 14px;
  border-left: 3px solid var(--vp-c-brand-1);
}

.tl-detail-inner dl {
  margin: 8px 0 14px;
}

.tl-detail-inner dt {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--vp-c-text-3);
}

.tl-detail-inner dt:first-child {
  margin-top: 0;
}

.tl-detail-inner dd {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--vp-c-text-1);
}

.tl-link {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.tl-link:hover {
  text-decoration: underline;
}

/* ── 通读区 ─────────────────────────────────── */
.tl-readall {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.tl-readall h3 {
  margin: 0 0 16px;
  font-size: 17px;
}

.tl-readall-era {
  margin-bottom: 20px;
}

.tl-readall-era h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.tl-readall-era ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tl-readall-era li {
  margin: 6px 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

/* 通读区的年份 code 剥掉全局行内码芯片样式 */
.tl-readall-era li code {
  background: transparent;
  border: 0;
  padding: 0 6px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* ── 滚动进场动画（尊重 prefers-reduced-motion） ── */
@media (prefers-reduced-motion: no-preference) {
  .tl-era .tl-node {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease;
    transition-delay: calc(var(--i) * 45ms);
  }

  .tl-era.in .tl-node {
    opacity: 1;
    transform: none;
  }
}

/* ── 窄屏 ───────────────────────────────────── */
@media (max-width: 560px) {
  .tl-list::before {
    display: none;
  }

  .tl-node {
    padding-left: 0;
    padding-top: 10px;
  }

  .tl-node::before {
    display: none;
  }

  .tl-row {
    flex-wrap: wrap;
    row-gap: 2px;
  }

  .tl-year {
    flex: 0 0 100%;
  }

  .tl-field {
    display: none;
  }

  .tl-detail-inner {
    margin-left: 8px;
  }
}
</style>
