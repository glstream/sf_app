<template>
  <div ref="container" :style="{ height: chartHeight }"></div>
</template>

<script setup>
import { onMounted, ref, watch, toRef, computed, onUnmounted } from 'vue'
import { Scatter } from '@antv/g2plot'

const props = defineProps({
  scatterPlotData: Array
})

const container = ref(null)
let scatterPlot = null
const medianX = calculateMedian(props.scatterPlotData.map((d) => d.Value))
const medianY = calculateMedian(props.scatterPlotData.map((d) => d.Projection))
function calculateMedian(numbers) {
  const sorted = numbers.slice().sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}
const chartHeight = computed(() => {
  return window.innerHeight > window.innerWidth ? '60vh' : '50vh'
})
const pointSize = computed(() => (window.innerWidth < 600 ? 4 : 7))
const textSize = computed(() => (window.innerWidth < 600 ? 10 : 14))

onMounted(() => {
  scatterPlot = new Scatter(container.value, {
    data: props.scatterPlotData,
    xField: 'Value',
    yField: 'Projection',
    sizeField: 'Manager',
    shape: 'circle',
    size: pointSize.value,
    pixelRatio: window.devicePixelRatio,
    pointStyle: {
      stroke: '#777',
      lineWidth: 1,
      fill: '#277DA1'
    },
    tooltip: {
      showMarkers: false,
      shared: true
    },
    xAxis: {
      title: {
        text: 'Rankings Source Value'
      }
    },
    yAxis: {
      title: {
        text: 'Player Projections'
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
    ],
    annotations: [
      {
        style: {
          fontSize: textSize.value
        }
      },
      // Lines
      {
        type: 'line',
        start: ['median', 'min'],
        end: ['median', 'max'],
        style: {
          stroke: '#7777',
          lineWidth: 2,
          lineDash: [4, 4]
        }
      },
      {
        type: 'line',
        start: ['min', 'median'],
        end: ['max', 'median'],
        style: {
          stroke: '#7777',
          lineWidth: 2,
          lineDash: [4, 4]
        }
      },
      // Texts
      {
        type: 'text',
        position: ['max', 'max'],
        content: 'Elite',
        style: {
          textAlign: 'right',
          textBaseline: 'top',
          fill: '#666'
        },
        offsetX: -10,
        offsetY: 10
      },
      {
        type: 'text',
        position: ['min', 'max'],
        content: 'Contenders',
        style: {
          textAlign: 'left',
          textBaseline: 'top',
          fill: '#666'
        },
        offsetX: 10,
        offsetY: 10
      },
      {
        type: 'text',
        position: ['min', 'min'],
        content: 'Teardown',
        style: {
          textAlign: 'left',
          textBaseline: 'bottom',
          fill: '#666'
        },
        offsetX: 10,
        offsetY: -10
      },
      {
        type: 'text',
        position: ['max', 'min'],
        content: 'Rebuilding',
        style: {
          textAlign: 'right',
          textBaseline: 'bottom',
          fill: '#666'
        },
        offsetX: -10,
        offsetY: -10
      }
    ]
  })
  scatterPlot.render()
})
const handleResize = () => {
  scatterPlot.update({
    // Reconfigure the chart as needed
    size: pointSize.value,
    pixelRatio: window.devicePixelRatio
  })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
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
