<template>
  <div ref="container"></div>
</template>

<script setup>
import { onMounted, ref, watch, toRefs, reactive } from 'vue'
import { Scatter } from '@antv/g2plot'

const props = defineProps({
  scatterPlotData: Array
})
const positionColors = {
  QB: 'rgb(39, 125, 161, .9)',
  RB: 'rgb(144, 190, 109, .9)',
  WR: 'rgb(67, 170, 139, .9)',
  TE: 'rgb(249, 132, 74, .9)'
}

const container = ref(null)
let scatterPlot = null

onMounted(() => {
  scatterPlot = new Scatter(container.value, {
    data: props.scatterPlotData,
    xField: 'Age',
    yField: 'Value',
    colorField: 'position',
    sizeField: 'Manager',
    shape: 'circle',
    size: 6,
    tooltip: {
      showMarkers: false,
      shared: true
    },
    color: ({ position }) => positionColors[position],
    xAxis: {
      title: {
        text: 'Avg Age'
      },
      grid: {
        line: {
          style: {
            stroke: '#eee'
          }
        }
      }
    },
    yAxis: {
      title: {
        text: 'Avg Value'
      },
      line: {
        style: {
          stroke: '#aaa'
        }
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

// Watch for changes in scatterPlotData and update the plot accordingly
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
