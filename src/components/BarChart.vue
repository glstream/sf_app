<template>
  <div ref="chartContainer" class="chart-wrapper" :style="{ height: chartHeight }"></div>
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
  // Increase height allocation, especially on mobile
  return window.innerHeight > window.innerWidth ? '70vh' : '60vh'
})

// Add responsive state tracking
const windowWidth = ref(window.innerWidth)

const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (stackedBarPlot) {
    updateChartLayout()
  }
}

// Function to update chart layout based on screen size
const updateChartLayout = () => {
  const isMobile = windowWidth.value < 600
  const isSmall = windowWidth.value < 768

  stackedBarPlot.update({
    padding: isMobile
      ? [15, 10, 40, 65] // Reduced padding for mobile [top, right, bottom, left]
      : isSmall
        ? [20, 20, 45, 70] // Medium padding for small screens
        : [30, 30, 50, 80], // Original padding for larger screens
    legend: {
      position: 'bottom', // Always place legend at the bottom
      itemSpacing: isMobile ? 4 : 8,
      itemWidth: isMobile ? 65 : isSmall ? 75 : 100,
      maxRow: isMobile ? 2 : 1,
      flipPage: true
    },
    label: {
      position: 'middle',
      content: (data) => `${addOrdinalSuffix(data.rank)}`,
      style: {
        fontSize: isMobile ? '9px' : '12px',
        fill: '#fff',
        fontWeight: 'bold',
        textShadow: '0px 0px 2px rgba(0,0,0,0.7)'
      }
    }
  })
}

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

// Function to intelligently shorten manager names
function shortenManagerName(name) {
  if (!name) return ''

  const parts = name.split(' ')
  if (parts.length > 1) {
    // For names with multiple parts, use first initial + last name
    const firstInitial = parts[0].charAt(0)
    const lastName = parts[parts.length - 1]
    return `${firstInitial}. ${lastName}`
  } else if (name.length > 12) {
    // For single long names, truncate with ellipsis
    return name.substring(0, 10) + '...'
  }
  return name // Return unchanged for short single names
}

// Calculate total values for each display name
const displayNameTotals = computed(() => {
  const totals = {}
  if (props.chartData) {
    props.chartData.forEach((item) => {
      if (!totals[item.display_name]) {
        totals[item.display_name] = 0
      }
      totals[item.display_name] += item.value
    })
  }
  return totals
})

// Group and sort data based on total values for display names,
// and add shortened names for display
const sortedChartData = computed(() => {
  if (!props.chartData || props.chartData.length === 0) {
    return []
  }

  // Process data to include shortened display names
  const processedData = props.chartData.map((item) => ({
    ...item,
    original_name: item.display_name, // Store original name for tooltips
    display_name: shortenManagerName(item.display_name) // Use shortened name for display
  }))

  // Group data by position
  const groups = processedData.reduce((acc, item) => {
    if (!acc[item.position]) acc[item.position] = []
    acc[item.position].push(item)
    return acc
  }, {})

  // Sort each group by the total values of original display names
  return positionOrder.flatMap((position) => {
    return (
      groups[position]?.sort(
        (a, b) =>
          displayNameTotals.value[b.original_name] - displayNameTotals.value[a.original_name]
      ) || []
    )
  })
})

const handleTouchStart = (event) => {
  // Handle the start of a touch event
}

onMounted(() => {
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('resize', handleResize)
  if (stackedBarPlot) {
    stackedBarPlot.destroy()
  }
})

onMounted(() => {
  if (!props.chartData || props.chartData.length === 0) {
    return
  }

  const isMobile = window.innerWidth < 600
  const isSmall = window.innerWidth < 768

  stackedBarPlot = new Bar(chartContainer.value, {
    data: sortedChartData.value,
    isStack: true,
    xField: 'value',
    yField: 'display_name',
    seriesField: 'position',
    color: ({ position }) => positionColors[position],
    // Adjust padding based on screen size
    padding: isMobile
      ? [15, 10, 40, 65] // Mobile padding
      : isSmall
        ? [20, 20, 45, 70] // Small screen padding
        : [30, 30, 50, 80], // Default padding
    marginRatio: isMobile ? 0.05 : 0.1, // Reduce spacing between bars on mobile
    legend: {
      position: 'bottom', // Always place legend at the bottom
      itemSpacing: isMobile ? 4 : 8,
      itemWidth: isMobile ? 65 : isSmall ? 75 : 100,
      maxRow: isMobile ? 2 : 1,
      flipPage: true
    },
    label: {
      position: 'middle',
      content: (data) => `${addOrdinalSuffix(data.rank)}`,
      style: {
        fontSize: isMobile ? '9px' : '12px',
        fill: '#fff',
        fontWeight: 'bold',
        textShadow: '0px 0px 2px rgba(0,0,0,0.7)' // Add shadow for better visibility
      },
      layout: [{ type: 'interval-adjust-position' }, { type: 'interval-hide-overlap' }]
    },
    tooltip: {
      customContent: (title, items) => {
        if (!items || items.length === 0) return ''

        // Get the full manager name from the first item
        const managerName = items[0].data.original_name
        const managerTotal = displayNameTotals.value[managerName]

        // Create a colored dot for each position with its value
        const positionDetails = items
          .map((item) => {
            return `<div style="display: flex; align-items: center; margin-bottom: 6px;">
                    <span style="display: inline-block; width: 10px; height: 10px; background-color: ${positionColors[item.data.position]}; margin-right: 8px; border-radius: 50%;"></span>
                    <span style="font-weight: 500;">${item.data.position}:</span>
                    <span style="margin-left: 5px;">${item.data.value.toLocaleString()}</span>
                    <span style="margin-left: 5px; font-size: 11px; color: #666;">
                      (${addOrdinalSuffix(item.data.rank)})
                    </span>
                  </div>`
          })
          .join('')

        return `<div style="padding: 10px; min-width: 180px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    ${managerName}
                  </div>
                  ${positionDetails}
                  <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #eee; font-weight: bold;">
                    Total: ${managerTotal.toLocaleString()}
                  </div>
                </div>`
      }
    },
    xAxis: {
      nice: false, // Disables rounding and padding beyond the max value
      label: {
        formatter: (value) => {
          // More compact number formatting based on screen size
          if (isMobile) {
            return value >= 1000 ? `${Math.floor(value / 1000)}k` : value
          }
          return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
        },
        autoHide: isMobile, // Hide some labels on mobile
        autoRotate: false // Prevent label rotation to save space
      },
      grid: null // Remove grid lines to reduce visual noise
    },
    yAxis: {
      label: {
        autoRotate: false,
        autoHide: false,
        autoEllipsis: true,
        style: {
          fontSize: isMobile ? '11px' : '12px'
        }
      }
    },
    interactions: [
      { type: 'active-region', enable: false }, // Disable the default active region
      { type: 'element-highlight' } // Keep element highlighting for better UX
    ],
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 800
      }
    }
  })
  stackedBarPlot.render()
})

watchEffect(() => {
  if (stackedBarPlot && props.chartData && props.chartData.length > 0) {
    stackedBarPlot.update({
      data: sortedChartData.value
    })
    // Apply responsive layout adjustments
    updateChartLayout()
  }
})
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  max-height: 75vh; /* Increased from 60vh to use more vertical space */
  margin: 0 !important; /* Remove any margins */
  padding: 0 !important; /* Remove any padding */
  overflow: visible; /* Allow labels to expand outside if needed */
}

/* Target the chart's parent container within the UI to reduce its padding */
:deep(.ant-card-body) {
  padding: 4px !important; /* Reduce card padding to maximize chart space */
}

/* Make sure the chart container takes up all available space */
div[ref='chartContainer'] {
  min-height: 200px;
  position: relative;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Improve tooltip appearance while keeping it compact */
:deep(.g2-tooltip) {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  padding: 6px 8px !important; /* More compact padding */
  max-width: 90vw !important; /* Prevent overflow on small screens */
  transition: opacity 0.3s !important;
}

/* Adjust for super small screens */
@media (max-width: 375px) {
  .chart-wrapper {
    height: 80vh !important; /* Override computed height for very small screens */
  }

  :deep(.g2-tooltip) {
    font-size: 12px !important; /* Smaller tooltip text */
  }
}

/* Ensure full width in LeagueDetailView context */
:deep(.viz-container) {
  padding: 0 !important;
  margin: 0 !important;
}
</style>
