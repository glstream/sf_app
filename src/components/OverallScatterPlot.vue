<template>
  <div ref="container" style="height: 400px"></div>
</template>

<script setup>
import { onMounted, ref, watch, toRef } from 'vue'
import { Scatter } from '@antv/g2plot'

const props = defineProps({
  scatterPlotData: Array
})

const container = ref(null)
let scatterPlot = null

onMounted(() => {
  scatterPlot = new Scatter(container.value, {
    data: props.scatterPlotData,
    xField: 'Value',
    yField: 'Projection',
    sizeField: 'Manager',
    // colorField: 'Manager',
    shape: 'circle',
    size: 7,
    pointStyle: {
      stroke: '#7777',
      lineWidth: 1,
      fill: '#277DA1'
    },
    tooltip: {
      showMarkers: false,
      shared: true
    },
    xAxis: {
      title: {
        text: 'Summary Value'
      }
    },
    yAxis: {
      title: {
        text: 'Projection Value'
      }
    },
    interactions: [
      {
        type: 'tooltip',
        cfg: {
          start: [{ trigger: 'plot:mousemove', action: 'tooltip:show' }],
          end: [{ trigger: 'plot:mouseleave', action: 'tooltip:hide' }]
        }
      }
    ]
  })
  scatterPlot.render()
})

watch(
  () => props.scatterPlotData,
  (newData) => {
    if (scatterPlot) {
      scatterPlot.changeData(newData)
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
