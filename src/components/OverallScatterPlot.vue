<template>
  <div ref="container" :style="{ height: chartHeight }"></div>
</template>

<script setup>
import { onMounted, ref, watch, toRef, computed, onUnmounted } from 'vue'
import { Scatter } from '@antv/g2plot'
import { useThemeStore } from '@/stores/theme.js'

const props = defineProps({
  scatterPlotData: Array
})

const container = ref(null)
let scatterPlot = null

// Theme support
const themeStore = useThemeStore()

// Modern muted palette — less saturated, more refined
const QUADRANT = {
  elite:      { fill: '#52b788', region: 'rgba(82, 183, 136, 0.09)',   label: '#2d7a56' },
  contenders: { fill: '#5b8db8', region: 'rgba(91, 141, 184, 0.09)',  label: '#2e5f8a' },
  teardown:   { fill: '#c97064', region: 'rgba(201, 112, 100, 0.09)', label: '#943f34' },
  rebuilding: { fill: '#d4a843', region: 'rgba(212, 168, 67, 0.09)',  label: '#8c6a1a' },
}

// Theme-responsive colors
const themeColors = computed(() => {
  if (themeStore.isDarkMode) {
    return {
      gridStroke: '#333333',
      textColor: '#aaaaaa',
      pointStroke: '#1a1a1a',
      tooltipBackground: '#2a2a2a',
      tooltipBorder: '#444',
      medianStroke: '#505050',
    }
  } else {
    return {
      gridStroke: '#ebebeb',
      textColor: '#888888',
      pointStroke: '#ffffff',
      tooltipBackground: '#fff',
      tooltipBorder: '#e0e0e0',
      medianStroke: '#cccccc',
    }
  }
})

// Calculate medians for positioning quadrant dividers
const medianX = computed(() => calculateMedian(props.scatterPlotData.map((d) => d.Value)))
const medianY = computed(() => calculateMedian(props.scatterPlotData.map((d) => d.Projection)))

function calculateMedian(numbers) {
  if (!numbers || numbers.length === 0) return 0
  const sorted = numbers.slice().sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

// Responsive chart dimensions
const chartHeight = computed(() => {
  return window.innerHeight > window.innerWidth ? '45vh' : '38vh'
})

const pointSize = computed(() => (window.innerWidth < 600 ? 12 : 8))
const textSize = computed(() => (window.innerWidth < 600 ? 10 : 13))

// Get the min and max values for configuring quadrants
const getDataExtents = () => {
  if (!props.scatterPlotData || props.scatterPlotData.length === 0) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 100 }
  }

  const xValues = props.scatterPlotData.map((d) => d.Value)
  const yValues = props.scatterPlotData.map((d) => d.Projection)

  const minX = Math.min(...xValues) * 0.95
  const maxX = Math.max(...xValues) * 1.05
  const minY = Math.min(...yValues) * 0.95
  const maxY = Math.max(...yValues) * 1.05

  return { minX, maxX, minY, maxY }
}

// Color points by their quadrant position
const getPointColor = (record) => {
  const mX = medianX.value
  const mY = medianY.value

  if (record.Value >= mX && record.Projection >= mY)  return QUADRANT.elite.fill
  if (record.Value < mX  && record.Projection >= mY)  return QUADRANT.contenders.fill
  if (record.Value < mX  && record.Projection < mY)   return QUADRANT.teardown.fill
  return QUADRANT.rebuilding.fill
}

const buildAnnotations = (minX, maxX, minY, maxY, mX, mY) => [
  // Quadrant backgrounds — very subtle tint
  { type: 'region', start: [mX, mY],   end: [maxX, maxY], style: { fill: QUADRANT.elite.region } },
  { type: 'region', start: [minX, mY], end: [mX, maxY],   style: { fill: QUADRANT.contenders.region } },
  { type: 'region', start: [minX, minY], end: [mX, mY],   style: { fill: QUADRANT.teardown.region } },
  { type: 'region', start: [mX, minY], end: [maxX, mY],   style: { fill: QUADRANT.rebuilding.region } },

  // Median lines — thin, muted
  {
    type: 'line',
    start: [mX, minY],
    end: [mX, maxY],
    style: { stroke: themeColors.value.medianStroke, lineWidth: 1, lineDash: [4, 4], opacity: 0.7 }
  },
  {
    type: 'line',
    start: [minX, mY],
    end: [maxX, mY],
    style: { stroke: themeColors.value.medianStroke, lineWidth: 1, lineDash: [4, 4], opacity: 0.7 }
  },

  // Quadrant labels — muted, lighter weight
  {
    type: 'text',
    position: [mX + (maxX - mX) / 2, mY + (maxY - mY) / 2],
    content: 'ELITE',
    style: { textAlign: 'center', textBaseline: 'middle', fill: QUADRANT.elite.label, fontWeight: '600', fontSize: textSize.value, opacity: 0.55 }
  },
  {
    type: 'text',
    position: [minX + (mX - minX) / 2, mY + (maxY - mY) / 2],
    content: 'CONTENDERS',
    style: { textAlign: 'center', textBaseline: 'middle', fill: QUADRANT.contenders.label, fontWeight: '600', fontSize: textSize.value, opacity: 0.55 }
  },
  {
    type: 'text',
    position: [minX + (mX - minX) / 2, minY + (mY - minY) / 2],
    content: 'TEARDOWN',
    style: { textAlign: 'center', textBaseline: 'middle', fill: QUADRANT.teardown.label, fontWeight: '600', fontSize: textSize.value, opacity: 0.55 }
  },
  {
    type: 'text',
    position: [mX + (maxX - mX) / 2, minY + (mY - minY) / 2],
    content: 'REBUILDING',
    style: { textAlign: 'center', textBaseline: 'middle', fill: QUADRANT.rebuilding.label, fontWeight: '600', fontSize: textSize.value, opacity: 0.55 }
  },
]

const buildChartConfig = (minX, maxX, minY, maxY, mX, mY) => ({
  data: props.scatterPlotData,
  xField: 'Value',
  yField: 'Projection',
  colorField: 'Manager',
  shape: 'circle',
  size: pointSize.value,
  pixelRatio: window.devicePixelRatio,
  color: (record) => getPointColor(record),
  pointStyle: {
    lineWidth: 2,
    stroke: themeColors.value.pointStroke,
  },
  legend: false,
  tooltip: {
    showMarkers: false,
    shared: true,
    formatter: (datum) => ({
      name: datum.Manager,
      value: `Value: ${datum.Value.toLocaleString()}, Projection: ${datum.Projection.toLocaleString()}`
    })
  },
  xAxis: {
    title: {
      text: 'Team Value',
      style: { fontSize: 12, fontWeight: 500, fill: themeColors.value.textColor }
    },
    label: { style: { fill: themeColors.value.textColor, fontSize: 11 } },
    grid: {
      line: { style: { stroke: themeColors.value.gridStroke, lineWidth: 1, lineDash: [3, 3] } }
    }
  },
  yAxis: {
    title: {
      text: 'Team Projection',
      style: { fontSize: 12, fontWeight: 500, fill: themeColors.value.textColor }
    },
    label: { style: { fill: themeColors.value.textColor, fontSize: 11 } },
    grid: {
      line: { style: { stroke: themeColors.value.gridStroke, lineWidth: 1, lineDash: [3, 3] } }
    }
  },
  interactions: [
    {
      type: 'tooltip',
      cfg: {
        start: [{ trigger: 'plot:mousemove', action: 'tooltip:show' }],
        end:   [{ trigger: 'plot:mouseleave', action: 'tooltip:hide' }]
      }
    },
    { type: 'element-active' }
  ],
  annotations: buildAnnotations(minX, maxX, minY, maxY, mX, mY)
})

onMounted(() => {
  const { minX, maxX, minY, maxY } = getDataExtents()
  const mX = medianX.value
  const mY = medianY.value

  scatterPlot = new Scatter(container.value, buildChartConfig(minX, maxX, minY, maxY, mX, mY))
  scatterPlot.render()
})

const handleResize = () => {
  if (scatterPlot) {
    const { minX, maxX, minY, maxY } = getDataExtents()
    const mX = medianX.value
    const mY = medianY.value

    scatterPlot.update({
      size: pointSize.value,
      pixelRatio: window.devicePixelRatio,
      annotations: buildAnnotations(minX, maxX, minY, maxY, mX, mY)
    })
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (scatterPlot) {
    scatterPlot.destroy()
  }
})

watch(
  () => props.scatterPlotData,
  (newData) => {
    if (scatterPlot && newData && newData.length > 0) {
      scatterPlot.changeData(newData)
      handleResize()
    }
  },
  { deep: true, immediate: true }
)

// Watch for theme changes and recreate chart
watch(
  () => themeStore.isDarkMode,
  () => {
    if (scatterPlot) {
      scatterPlot.destroy()
      scatterPlot = null
      setTimeout(() => {
        const { minX, maxX, minY, maxY } = getDataExtents()
        const mX = medianX.value
        const mY = medianY.value

        scatterPlot = new Scatter(container.value, buildChartConfig(minX, maxX, minY, maxY, mX, mY))
        scatterPlot.render()
      }, 100)
    }
  }
)
</script>

<style scoped>
div {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 16px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

html.dark div {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15);
}
</style>
