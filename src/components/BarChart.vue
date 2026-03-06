<template>
  <div ref="chartContainer" :style="{ height: chartHeight }"></div>
</template>

<script setup>
import { ref, onMounted, watchEffect, computed, onUnmounted } from 'vue'
import { Bar } from '@antv/g2plot'

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'

const props = defineProps({
  chartData: Array
})

const chartHeight = computed(() => {
  return window.innerHeight > window.innerWidth ? '45vh' : '38vh'
})

const chartContainer = ref(null)
let stackedBarPlot = null // Define this outside to reference it later for updates

const positionColors = {
  QB: 'rgb(39, 125, 161, .9)',
  RB: 'rgb(144, 190, 109, .9)',
  WR: 'rgb(67, 170, 139, .9)',
  TE: 'rgb(249, 132, 74, .9)',
  Picks: 'rgb(70, 70, 70,.625)'
}
const positionOrder = ['QB', 'RB', 'WR', 'TE', 'Picks']

// Calculate total values for each display name
const displayNameTotals = computed(() => {
  const totals = {}
  props.chartData.forEach((item) => {
    if (!totals[item.display_name]) {
      totals[item.display_name] = 0
    }
    totals[item.display_name] += item.value
  })
  return totals
})

// Group and sort data based on total values for display names
const sortedChartData = computed(() => {
  // Group data by position
  const groups = props.chartData.reduce((acc, item) => {
    if (!acc[item.position]) acc[item.position] = []
    acc[item.position].push(item)
    return acc
  }, {})

  // Sort each group by the total values of display names
  return positionOrder.flatMap((position) => {
    return (
      groups[position]?.sort(
        (a, b) => displayNameTotals.value[b.display_name] - displayNameTotals.value[a.display_name]
      ) || []
    )
  })
})
// const handleResize = () => {
//   stackedBarPlot.update({
//     legend: {
//       position: window.innerWidth < 600 ? 'top' : 'bottom'
//     },
//     label: {
//       style: {
//         fontSize: window.innerWidth < 600 ? '10px' : '12px'
//       }
//     }
//   })
// }
const handleTouchStart = (event) => {
  // Handle the start of a touch event
}
onMounted(() => {
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
})

onUnmounted(() => {
  // window.removeEventListener('resize', handleResize)
})

onMounted(() => {
  // Initialize the chart with an empty data set initially
  stackedBarPlot = new Bar(chartContainer.value, {
    data: sortedChartData.value,
    isStack: true,
    xField: 'value',
    yField: 'display_name',
    seriesField: 'position',
    color: ({ position }) => positionColors[position],
    legend: {
      position: window.innerWidth < 600 ? 'top' : 'bottom',
      itemSpacing: 12,
      flipPage: true
    },
    label: {
      position: 'middle',
      content: (data) => `${addOrdinalSuffix(data.rank)}`,
      style: {
        fontSize: window.innerWidth < 600 ? '10px' : '12px'
      },
      layout: [{ type: 'interval-adjust-position' }, { type: 'interval-hide-overlap' }]
    },

    tooltip: {
      showMarkers: false,
      customContent: (_title, items) => {
        if (!items || items.length === 0) return ''
        const displayName = items[0].data.display_name
        const total = items.reduce((sum, i) => sum + (i.data.value || 0), 0)
        const rows = positionOrder
          .map((pos) => items.find((i) => i.data.position === pos))
          .filter(Boolean)
          .map((item) => {
            const color = positionColors[item.data.position] ?? '#888'
            return `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${color};flex-shrink:0;"></span>
                <span style="font-size:12px;color:#888;flex:1;">${item.data.position}</span>
                <span style="font-size:12px;font-weight:600;">${item.data.value?.toLocaleString()}</span>
                ${item.data.rank ? `<span style="font-size:11px;color:#bbb;min-width:26px;text-align:right;">${addOrdinalSuffix(item.data.rank)}</span>` : ''}
              </div>`
          }).join('')
        return `
          <div style="padding:12px 16px;min-width:220px;max-width:300px;font-family:inherit;">
            <div style="font-size:13px;font-weight:600;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(128,128,128,0.15);word-break:break-word;white-space:normal;line-height:1.4;">
              ${displayName}
            </div>
            ${rows}
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(128,128,128,0.15);display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:#888;">Total</span>
              <span style="font-size:13px;font-weight:700;">${total.toLocaleString()}</span>
            </div>
          </div>`
      }
    },
    legend: {
      position: window.innerWidth < 600 ? 'top' : 'bottom',
      itemSpacing: 8,
      itemWidth: window.innerWidth < 600 ? 75 : 100,
      flipPage: true
    },

    xAxis: {
      nice: false // Disables rounding and padding beyond the max value
    }
  })
  stackedBarPlot.render()
})

watchEffect(() => {
  if (sortedChartData.value.length > 0 && stackedBarPlot) {
    stackedBarPlot.update({ data: sortedChartData.value })
  }
})
</script>

<style scoped>
#chart-container {
  width: 100%; /* Ensures it fills the container */
  max-height: 45vh; /* Limits height on larger devices */
}
</style>
