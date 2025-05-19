<template>
  <div ref="chartContainer" style="width: 100%; height: 500px"></div>
</template>
<script setup>
import { ref, onMounted, watchEffect, computed } from 'vue'
import { Column } from '@antv/g2plot'

const props = defineProps({
  projectionPercentColumnData: Array
})

const chartContainer = ref(null)
let percentColumnPlot = null // Initialize the Column plot variable

onMounted(() => {
  // Prepare the chart data to fit the Percent Column layout
  const transformedData = props.projectionPercentColumnData.flatMap((item) => [
    { display_name: item.display_name, type: 'Starters', value: item.starters_sum },
    { display_name: item.display_name, type: 'Bench', value: item.bench_sum }
  ])

  // Initialize the chart with an empty data set initially
  percentColumnPlot = new Column(chartContainer.value, {
    data: transformedData,
    xField: 'display_name',
    yField: 'value',
    seriesField: 'type',
    isPercent: true,
    isStack: true,
    title: {
      text: 'Starters Vs Bench %',
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#333' // Adjust color to fit your design
      }
    },
    tooltip: {
      shared: true,
      showMarkers: false
    },
    xAxis: {
      title: {
        text: 'Manager',
        style: {
          fontSize: 12,
          fill: '#666' // Adjust the styling as needed
        }
      }
    },
    yAxis: {
      title: {
        text: 'Starters Vs Bench %',
        style: {
          fontSize: 12,
          fill: '#666' // Adjust the styling as needed
        }
      },
      label: {
        formatter: (val) => `${val * 100}%` // Ensuring y-axis labels are displayed as percentages
      }
    },
    legend: {
      position: 'bottom', // Position the legend at the bottom of the chart
      layout: 'horizontal' // Layout the legend items horizontally
    }
  })

  percentColumnPlot.render()
})

watchEffect(() => {
  if (props.projectionPercentColumnData.length > 0 && percentColumnPlot) {
    const newData = props.projectionPercentColumnData.flatMap((item) => [
      { display_name: item.display_name, type: 'Starters', value: item.starters_sum },
      { display_name: item.display_name, type: 'Bench', value: item.bench_sum }
    ])
    percentColumnPlot.changeData(newData)
  }
})
</script>

<style scoped>
#chart-container {
  height: 500px;
}
</style>
