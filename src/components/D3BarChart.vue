<template>
  <div ref="chartContainer" class="d3-chart-wrapper" :style="{ height: chartHeight }"></div>
</template>

<script setup>
import { ref, onMounted, watchEffect, computed, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { addOrdinalSuffix } from '../utils/suffix'

const props = defineProps({
  chartData: Array
})

const chartContainer = ref(null)
let chart = null

const chartHeight = computed(() => {
  // Match the height allocation of the original chart for consistency
  return window.innerHeight > window.innerWidth ? '70vh' : '60vh'
})

// Add responsive state tracking
const windowWidth = ref(window.innerWidth)

const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (chart) {
    // Clear previous chart
    d3.select(chartContainer.value).selectAll('*').remove()
    renderChart()
  }
}

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

// Group and sort data similar to the original chart
const sortedChartData = computed(() => {
  if (!props.chartData || props.chartData.length === 0) {
    return []
  }

  // Process data to include original names for tooltips
  const processedData = props.chartData.map((item) => ({
    ...item,
    original_name: item.display_name
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

const renderChart = () => {
  if (!props.chartData || props.chartData.length === 0 || !chartContainer.value) {
    return
  }

  const data = sortedChartData.value
  const isMobile = windowWidth.value < 600

  // Clear previous chart
  d3.select(chartContainer.value).selectAll('*').remove()

  // Get container dimensions
  const container = chartContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  // Create SVG
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;')

  const margin = isMobile
    ? { top: 20, right: 10, bottom: 40, left: 65 }
    : { top: 30, right: 30, bottom: 50, left: 80 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Group managers by name
  const managers = [...new Set(data.map((d) => d.display_name))]

  // Calculate stack data
  const stackedData = managers.map((manager) => {
    // Group by manager
    const managerData = {}
    data
      .filter((d) => d.display_name === manager)
      .forEach((d) => {
        managerData[d.position] = d.value
        managerData.display_name = manager
        managerData.original_name = d.original_name
        if (d.rank) managerData[`${d.position}_rank`] = d.rank
      })
    return managerData
  })

  // Create scales
  const yScale = d3.scaleBand().domain(managers).range([0, innerHeight]).padding(0.1)

  const maxValue = d3.max(stackedData, (d) => {
    return d3.sum(positionOrder, (pos) => d[pos] || 0)
  })

  const xScale = d3
    .scaleLinear()
    .domain([0, maxValue * 1.05]) // Add 5% padding
    .range([0, innerWidth])

  // Create axes
  const xAxis = (g) =>
    g
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(isMobile ? 5 : 10)
          .tickFormat((d) => (d >= 1000 ? `${d / 1000}k` : d))
      )
      .call((g) => g.select('.domain').remove())

  const yAxis = (g) =>
    g.call(d3.axisLeft(yScale).tickSize(0)).call((g) => g.select('.domain').remove())

  // Create a group for the chart content
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Add axes
  g.append('g').call(xAxis)
  g.append('g').call(yAxis)

  // For each manager, create stacked bars
  stackedData.forEach((manager) => {
    let xOffset = 0

    positionOrder.forEach((position) => {
      if (!manager[position]) return

      const barHeight = yScale.bandwidth()
      const barY = yScale(manager.display_name)

      // Create bar group
      const barGroup = g
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', `translate(${xOffset},${barY})`)

      // Bar width based on position value
      const barWidth = xScale(manager[position])

      // Add the bar
      barGroup
        .append('rect')
        .attr('height', barHeight)
        .attr('width', barWidth)
        .attr('fill', positionColors[position])
        .attr('rx', 2) // Rounded corners
        .attr('ry', 2)

      // Add rank label in center of bar if wide enough
      if (barWidth > 20) {
        barGroup
          .append('text')
          .attr('x', barWidth / 2)
          .attr('y', barHeight / 2)
          .attr('dy', '0.35em') // Vertical alignment
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-weight', 'bold')
          .attr('font-size', isMobile ? '9px' : '12px')
          .attr('text-shadow', '0px 0px 2px rgba(0,0,0,0.7)')
          .text(manager[`${position}_rank`] ? addOrdinalSuffix(manager[`${position}_rank`]) : '')
      }

      // Update offset for next position
      xOffset += barWidth
    })
  })

  // Add tooltip functionality
  const tooltip = d3
    .select(container)
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background-color', 'rgba(255, 255, 255, 0.95)')
    .style('border-radius', '4px')
    .style('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.15)')
    .style('padding', '10px')
    .style('pointer-events', 'none')
    .style('z-index', 10)

  // Add position legend
  const legendG = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${margin.left + innerWidth / 2}, ${height - margin.bottom + 30})`)

  const legend = legendG
    .selectAll('.legend-item')
    .data(positionOrder)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr(
      'transform',
      (d, i) =>
        `translate(${i * (isMobile ? 60 : 80) - positionOrder.length * (isMobile ? 30 : 40)}, 0)`
    )

  legend
    .append('rect')
    .attr('width', 12)
    .attr('height', 12)
    .attr('rx', 2)
    .attr('fill', (d) => positionColors[d])

  legend
    .append('text')
    .attr('x', 16)
    .attr('y', 10)
    .attr('font-size', isMobile ? '10px' : '12px')
    .text((d) => d)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  renderChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watchEffect(() => {
  if (props.chartData && props.chartData.length > 0) {
    renderChart()
  }
})
</script>

<style scoped>
.d3-chart-wrapper {
  width: 100%;
  max-height: 75vh;
  margin: 0 !important;
  padding: 0 !important;
  overflow: visible;
  position: relative;
}

.d3-tooltip {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  padding: 6px 8px !important;
  max-width: 90vw !important;
  transition: opacity 0.3s !important;
}

@media (max-width: 375px) {
  .d3-chart-wrapper {
    height: 80vh !important;
  }
}
</style>
