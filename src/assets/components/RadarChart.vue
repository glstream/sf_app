<template>
  <div ref="container"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Radar } from '@antv/g2plot'

// Defining component props
const props = defineProps({
  data: Array
})

const container = ref(null)
let radarPlot = null

const invertDataValues = (data) => {
  const maxRankValue = Math.max(...data.map((d) => d.value)) // Determine the maximum value.
  return data.map((d) => ({ ...d, value: maxRankValue + 1 - d.value })) // Invert each value.
}

onMounted(() => {
  radarPlot = new Radar(container.value, {
    data: props.data,
    xField: 'position',
    yField: 'value',
    seriesField: 'metric',
    meta: {
      value: {
        alias: 'Metric Value',
        nice: true
      }
    },
    point: {
      size: 4
    },
    area: {},
    tooltip: {
      shared: true,
      showMarkers: true
    },
    xAxis: {
      tickLine: null
    },
    yAxis: {
      label: {
        formatter: (v) => `${v}`
      }
    },
    legend: {
      position: 'top'
    }
  })
  radarPlot.render()
})

watch(
  () => props.data,
  (newData) => {
    if (radarPlot) {
      radarPlot.changeData(newData)
    }
  },
  {
    deep: true,
    immediate: true
  }
)
</script>

<style scoped>
div {
  height: 400px; /* Ensures the container div takes up adequate space */
}
</style>
