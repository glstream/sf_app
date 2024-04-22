<template>
  <div ref="chartContainer"></div>
</template>

<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue'
import { Bar } from '@antv/g2plot'

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'

const props = defineProps({
  chartData: Array
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

onMounted(() => {
  const maxValue = Math.max(...props.chartData.map((item) => item.value))
  // Initialize the chart with an empty data set initially
  stackedBarPlot = new Bar(chartContainer.value, {
    data: sortedChartData.value,
    isStack: true,
    xField: 'value',
    yField: 'display_name',
    seriesField: 'position',
    color: ({ position }) => positionColors[position], // Apply custom colors based on position
    legend: {
      position: 'bottom', // top, bottom, left, right
      itemSpacing: 1, // Reduces the space between legend items
      itemWidth: 50, // Optionally, constrain the width of each legend item
      flipPage: true // Allows pagination in the legend if there are many items
    },

    // tooltip: {
    //   // Define custom content function
    //   customContent: (title, items) => {
    //     if (items && items.length > 0) {
    //       const item = items[0] // Access the first item if there are multiple (for stacked)
    //       return `<div class="custom-tooltip">
    //               <h5>${item.data.display_name} - Detailed Info</h5>
    //               <ul>
    //                 <li>Value: ${item.value}</li>
    //                 <li>Position: ${item.data.position}</li>
    //                 ${item.data.rank ? `<li>Rank: ${item.data.rank}</li>` : ''}
    //               </ul>
    //             </div>`
    //     }
    //     return ''
    //   }
    // },
    label: {
      position: 'middle', // adjust based on preference
      content: (data) => `${addOrdinalSuffix(data.rank)}`, // display rank in labels
      layout: [{ type: 'interval-adjust-position' }, { type: 'interval-hide-overlap' }]
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
  height: 500px;
}
</style>
