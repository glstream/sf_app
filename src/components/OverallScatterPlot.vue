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
  return window.innerHeight > window.innerWidth ? '60vh' : '50vh'
})
// Increase point size to make bubbles larger
const pointSize = computed(() => (window.innerWidth < 600 ? 12 : 8))
const textSize = computed(() => (window.innerWidth < 600 ? 10 : 16))

// Get the min and max values for configuring quadrants
const getDataExtents = () => {
  if (!props.scatterPlotData || props.scatterPlotData.length === 0) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 100 }
  }

  const xValues = props.scatterPlotData.map((d) => d.Value)
  const yValues = props.scatterPlotData.map((d) => d.Projection)

  // Add 5% padding to make sure points aren't right at the edges
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

  if (record.Value >= mX && record.Projection >= mY) {
    return '#3FA34D' // Elite - green
  } else if (record.Value < mX && record.Projection >= mY) {
    return '#4285F4' // Contenders - blue
  } else if (record.Value < mX && record.Projection < mY) {
    return '#DB4437' // Teardown - red
  } else {
    return '#F4B400' // Rebuilding - yellow/amber
  }
}

onMounted(() => {
  const { minX, maxX, minY, maxY } = getDataExtents()
  const mX = medianX.value
  const mY = medianY.value

  scatterPlot = new Scatter(container.value, {
    data: props.scatterPlotData,
    xField: 'Value',
    yField: 'Projection',
    colorField: 'Manager', // This allows us to customize colors
    shape: 'circle',
    size: pointSize.value,
    pixelRatio: window.devicePixelRatio,
    color: (record) => getPointColor(record),
    pointStyle: {
      lineWidth: 1,
      stroke: '#fff'
    },
    // Disable the legend
    legend: false,
    tooltip: {
      showMarkers: false,
      shared: true,
      formatter: (datum) => {
        return {
          name: datum.Manager,
          value: `Value: ${datum.Value.toLocaleString()}, Projection: ${datum.Projection.toLocaleString()}`
        }
      }
    },
    xAxis: {
      title: {
        text: 'Team Value',
        style: {
          fontSize: 14,
          fontWeight: 500
        }
      },
      grid: {
        line: {
          style: {
            stroke: '#e0e0e0',
            lineWidth: 1,
            lineDash: [4, 4]
          }
        }
      }
    },
    yAxis: {
      title: {
        text: 'Team Projection',
        style: {
          fontSize: 14,
          fontWeight: 500
        }
      },
      grid: {
        line: {
          style: {
            stroke: '#e0e0e0',
            lineWidth: 1,
            lineDash: [4, 4]
          }
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
      },
      {
        type: 'element-active'
      }
    ],
    annotations: [
      // Quadrant background colors with increased opacity
      {
        type: 'region',
        start: [mX, mY],
        end: [maxX, maxY],
        style: {
          fill: 'rgba(63, 163, 77, 0.2)' // Elite - light green with increased opacity
        }
      },
      {
        type: 'region',
        start: [minX, mY],
        end: [mX, maxY],
        style: {
          fill: 'rgba(66, 133, 244, 0.2)' // Contenders - light blue with increased opacity
        }
      },
      {
        type: 'region',
        start: [minX, minY],
        end: [mX, mY],
        style: {
          fill: 'rgba(219, 68, 55, 0.2)' // Teardown - light red with increased opacity
        }
      },
      {
        type: 'region',
        start: [mX, minY],
        end: [maxX, mY],
        style: {
          fill: 'rgba(244, 180, 0, 0.2)' // Rebuilding - light yellow with increased opacity
        }
      },
      // Median lines
      {
        type: 'line',
        start: [mX, minY],
        end: [mX, maxY],
        style: {
          stroke: '#666',
          lineWidth: 2,
          lineDash: [6, 4],
          opacity: 0.8
        }
      },
      {
        type: 'line',
        start: [minX, mY],
        end: [maxX, mY],
        style: {
          stroke: '#666',
          lineWidth: 2,
          lineDash: [6, 4],
          opacity: 0.8
        }
      },
      // Quadrant Labels
      {
        type: 'text',
        position: [mX + (maxX - mX) / 2, mY + (maxY - mY) / 2],
        content: 'Elite',
        style: {
          textAlign: 'center',
          textBaseline: 'middle',
          fill: '#3FA34D',
          fontWeight: 'bold',
          fontSize: textSize.value
        }
      },
      {
        type: 'text',
        position: [minX + (mX - minX) / 2, mY + (maxY - mY) / 2],
        content: 'Contenders',
        style: {
          textAlign: 'center',
          textBaseline: 'middle',
          fill: '#4285F4',
          fontWeight: 'bold',
          fontSize: textSize.value
        }
      },
      {
        type: 'text',
        position: [minX + (mX - minX) / 2, minY + (mY - minY) / 2],
        content: 'Teardown',
        style: {
          textAlign: 'center',
          textBaseline: 'middle',
          fill: '#DB4437',
          fontWeight: 'bold',
          fontSize: textSize.value
        }
      },
      {
        type: 'text',
        position: [mX + (maxX - mX) / 2, minY + (mY - minY) / 2],
        content: 'Rebuilding',
        style: {
          textAlign: 'center',
          textBaseline: 'middle',
          fill: '#F4B400',
          fontWeight: 'bold',
          fontSize: textSize.value
        }
      }
    ]
  })

  scatterPlot.render()
})

const handleResize = () => {
  if (scatterPlot) {
    const { minX, maxX, minY, maxY } = getDataExtents()
    const mX = medianX.value
    const mY = medianY.value

    // Update the chart with new dimensions and configurations
    scatterPlot.update({
      size: pointSize.value,
      pixelRatio: window.devicePixelRatio,
      annotations: [
        // Update quadrant regions with increased opacity
        {
          type: 'region',
          start: [mX, mY],
          end: [maxX, maxY],
          style: { fill: 'rgba(63, 163, 77, 0.2)' }
        },
        {
          type: 'region',
          start: [minX, mY],
          end: [mX, maxY],
          style: { fill: 'rgba(66, 133, 244, 0.2)' }
        },
        {
          type: 'region',
          start: [minX, minY],
          end: [mX, mY],
          style: { fill: 'rgba(219, 68, 55, 0.2)' }
        },
        {
          type: 'region',
          start: [mX, minY],
          end: [maxX, mY],
          style: { fill: 'rgba(244, 180, 0, 0.2)' }
        },
        // Update median lines
        {
          type: 'line',
          start: [mX, minY],
          end: [mX, maxY],
          style: { stroke: '#666', lineWidth: 2, lineDash: [6, 4], opacity: 0.8 }
        },
        {
          type: 'line',
          start: [minX, mY],
          end: [maxX, mY],
          style: { stroke: '#666', lineWidth: 2, lineDash: [6, 4], opacity: 0.8 }
        },
        // Update quadrant labels with new sizes
        {
          type: 'text',
          position: [mX + (maxX - mX) / 2, mY + (maxY - mY) / 2],
          content: 'Elite',
          style: {
            textAlign: 'center',
            textBaseline: 'middle',
            fill: '#3FA34D',
            fontWeight: 'bold',
            fontSize: textSize.value
          }
        },
        {
          type: 'text',
          position: [minX + (mX - minX) / 2, mY + (maxY - mY) / 2],
          content: 'Contenders',
          style: {
            textAlign: 'center',
            textBaseline: 'middle',
            fill: '#4285F4',
            fontWeight: 'bold',
            fontSize: textSize.value
          }
        },
        {
          type: 'text',
          position: [minX + (mX - minX) / 2, minY + (mY - minY) / 2],
          content: 'Teardown',
          style: {
            textAlign: 'center',
            textBaseline: 'middle',
            fill: '#DB4437',
            fontWeight: 'bold',
            fontSize: textSize.value
          }
        },
        {
          type: 'text',
          position: [mX + (maxX - mX) / 2, minY + (mY - minY) / 2],
          content: 'Rebuilding',
          style: {
            textAlign: 'center',
            textBaseline: 'middle',
            fill: '#F4B400',
            fontWeight: 'bold',
            fontSize: textSize.value
          }
        }
      ]
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
      // Recalculate everything when data changes
      const { minX, maxX, minY, maxY } = getDataExtents()
      const mX = medianX.value
      const mY = medianY.value

      // Update annotations to match new data
      handleResize()
    }
  },
  { deep: true, immediate: true }
)
</script>

<style scoped>
div {
  height: 400px;
  background-color: #fcfcfc; /* Very light background */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
}
</style>
