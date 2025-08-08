<template>
  <a-modal
    v-model:open="isVisible"
    :title="null"
    @ok="handleOk"
    :footer="null"
    width="420px"
    class="modern-player-modal"
  >
    <div v-if="selectedPlayer" class="player-modal-content">
      <div class="player-header-compact">
        <div class="player-avatar-small">
          <UserOutlined />
          <div class="tier-badge-small" :class="getTierClass(selectedPlayer.player_value)">
            {{ getTierLabel(selectedPlayer.player_value) }}
          </div>
        </div>
        <div class="player-info-compact">
          <h2 class="player-name-compact">{{ selectedPlayer.player_full_name }}</h2>
          <div class="player-details">
            <span
              class="position-badge-small"
              :style="getPositionTag(selectedPlayer._position)"
            >
              {{ selectedPlayer._position }}
            </span>
            <span v-if="selectedPlayer.team" class="meta-info">{{ selectedPlayer.team }}</span>
            <span v-if="selectedPlayer.age" class="meta-info">{{ selectedPlayer.age }}y</span>
          </div>
        </div>
        <div class="value-compact">
          {{
            selectedPlayer.player_value === -1
              ? 'N/A'
              : selectedPlayer.player_value?.toLocaleString()
          }}
        </div>
      </div>

      <div class="stats-compact">
        <div class="stat-item">
          <div class="stat-number">{{ selectedPlayer._rownum }}</div>
          <div class="stat-text">Overall</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ selectedPlayer.pos_ranked }}</div>
          <div class="stat-text">Position</div>
        </div>
      </div>

      <div class="chart-compact">
        <h4>Value History</h4>
        <a-spin :spinning="isChartLoading">
          <div id="player-value-chart-container" style="height: 160px">
            <a-empty
              v-if="!isChartLoading && (!playerValueHistory || playerValueHistory.length === 0)"
              description="No history"
              :image="null"
            />
          </div>
        </a-spin>
      </div>
    </div>
    <div v-else class="loading-state">
      <a-spin size="large" />
      <p>Loading player details...</p>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import axios from 'axios'
import { message } from 'ant-design-vue'
import { UserOutlined } from '@ant-design/icons-vue'
import { Line } from '@antv/g2plot'

// Props
const props = defineProps<{
  isSuperflex: boolean
  isDynasty: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Modal state
const isVisible = ref(false)
const selectedPlayer = ref(null)
const playerValueHistory = ref([])
const isChartLoading = ref(false)
let chartInstance = null

// Show modal function
const showModal = async (player) => {
  selectedPlayer.value = player
  isVisible.value = true
  isChartLoading.value = true
  playerValueHistory.value = []

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  console.log('🔍 Player data received:', player)
  console.log('🔍 Available player IDs:', {
    ktc_player_id: player.ktc_player_id,
    player_id: player.player_id,
    sleeper_id: player.sleeper_id
  })

  // Determine the player ID to use - prioritize actual ktc_player_id
  const playerIdToUse = player.ktc_player_id || player.player_id || player.sleeper_id
  
  if (!playerIdToUse) {
    console.error('No valid player ID found for:', player.player_full_name)
    console.error('Full player data:', player)
    message.error('Cannot load value history: No valid player ID found.')
    isChartLoading.value = false
    await nextTick()
    const container = document.getElementById('player-value-chart-container')
    if (container) container.innerHTML = ''
    return
  }

  console.log(`🔍 Using player ID: ${playerIdToUse} (type: ${
    player.ktc_player_id ? 'ktc_player_id' : 
    player.player_id ? 'player_id' : 'sleeper_id'
  })`)

  const apiUrl = import.meta.env.VITE_API_URL
  const currentRankType = props.isDynasty ? 'dynasty' : 'redraft'
  
  try {
    console.log(
      `🔍 Fetching value history for player ID: ${playerIdToUse} with rank_type=${currentRankType}`
    )
    const response = await axios.get(`${apiUrl}/player_values`, {
      params: {
        player_id: playerIdToUse,
        rank_type: currentRankType
      }
    })

    console.log('🔍 API Response:', response.data)
    
    if (response.data && Array.isArray(response.data)) {
      playerValueHistory.value = response.data
      console.log(`✅ Fetched ${response.data.length} history points for player: ${player.player_full_name}`)
      
      if (response.data.length === 0) {
        console.warn(`⚠️  No historical data found for player ID: ${playerIdToUse}`)
        console.warn(`⚠️  This could mean:`)
        console.warn(`   1. Player ID is incorrect (sleeper_id used instead of ktc_player_id)`)
        console.warn(`   2. Player has no historical data in the database`)
        console.warn(`   3. Player name mismatch in database join`)
      }
    } else {
      console.warn('❌ Received unexpected data format for player value history:', response.data)
      playerValueHistory.value = []
    }

    await nextTick()
    renderPlayerValueChart()
  } catch (error) {
    console.error('❌ Error fetching player value history:', error)
    console.error(`❌ Failed for player: ${player.player_full_name}`)
    console.error(`❌ Player ID used: ${playerIdToUse}`)
    
    if (error.response) {
      console.error('❌ API Response Status:', error.response.status)
      console.error('❌ API Response Data:', error.response.data)
      message.error(`Could not load player value history: ${error.response.status} error`)
    } else {
      message.error('Could not load player value history: Network error')
    }
    
    playerValueHistory.value = []
    await nextTick()
    renderPlayerValueChart()
  } finally {
    isChartLoading.value = false
  }
}

// Render chart function
const renderPlayerValueChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  const container = document.getElementById('player-value-chart-container')
  if (!container || !playerValueHistory.value || playerValueHistory.value.length === 0) {
    console.log('Chart container not found or no data.')
    if (container) container.innerHTML = ''
    return
  }

  const valueField = props.isSuperflex ? 'superflex_player_value' : 'one_qb_player_value'

  const formattedData = playerValueHistory.value
    .map((item) => ({
      date: item.value_date,
      value: item[valueField]
    }))
    .filter((item) => item.value != null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (formattedData.length === 0) {
    console.log('No valid data points to plot after formatting.')
    if (container) container.innerHTML = ''
    return
  }

  const values = formattedData.map((item) => item.value)
  let minValue = Math.min(...values)
  let maxValue = Math.max(...values)

  const range = maxValue - minValue
  const padding = range === 0 ? maxValue * 0.05 : range * 0.05
  minValue = Math.max(0, minValue - padding)
  maxValue = maxValue + padding

  console.log('Formatted data for chart:', formattedData)
  console.log(`Calculated Y-Axis Min: ${minValue}, Max: ${maxValue}`)

  chartInstance = new Line(container, {
    data: formattedData,
    padding: [25, 35, 45, 45],
    xField: 'date',
    yField: 'value',
    theme: {
      background: 'transparent'
    },
    xAxis: {
      type: 'time',
      tickCount: 3,
      line: null,
      tickLine: null,
      subTickLine: null,
      label: {
        style: {
          fill: 'rgba(107, 114, 128, 0.8)',
          fontSize: 10,
          fontWeight: 600,
          textAlign: 'center'
        },
        formatter: (text) => {
          const date = new Date(text)
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        },
        offset: 8
      },
      grid: {
        line: {
          style: {
            stroke: 'rgba(229, 231, 235, 0.6)',
            lineWidth: 1,
            lineDash: [1, 3]
          }
        }
      }
    },
    yAxis: {
      line: null,
      tickLine: null,
      subTickLine: null,
      label: {
        style: {
          fill: 'rgba(107, 114, 128, 0.7)',
          fontSize: 10,
          fontWeight: 500,
          textAlign: 'right'
        },
        formatter: (v) => {
          const num = Number(v)
          if (num >= 10000) {
            return `${Math.round(num / 1000)}K`
          } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`
          }
          return num.toString()
        },
        offset: 12
      },
      grid: {
        line: {
          style: {
            stroke: 'rgba(229, 231, 235, 0.4)',
            lineWidth: 1,
            lineDash: [1, 4]
          }
        }
      },
      min: minValue,
      max: maxValue,
      nice: false
    },
    tooltip: {
      showCrosshairs: false,
      showMarkers: false,
      marker: false,
      shared: false,
      enterable: false,
      position: 'top',
      offset: 10,
      customContent: (title, items) => {
        if (!items || items.length === 0) return ''
        const item = items[0]
        const date = new Date(item.title).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
        
        return `
          <div style="
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 10px 12px;
            border: 1px solid rgba(59, 130, 246, 0.15);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            font-family: system-ui, -apple-system, sans-serif;
          ">
            <div style="
              font-weight: 600;
              font-size: 14px;
              color: #1f2937;
              margin-bottom: 2px;
            ">${item.value.toLocaleString()}</div>
            <div style="
              color: #6b7280;
              font-size: 10px;
              font-weight: 500;
            ">${date}</div>
          </div>
        `
      }
    },
    smooth: true,
    height: 160,
    autoFit: true,
    point: {
      size: 3,
      shape: 'circle',
      style: {
        fill: '#ffffff',
        stroke: '#3b82f6',
        lineWidth: 2
      }
    },
    lineStyle: {
      stroke: '#3b82f6',
      lineWidth: 2.5,
      lineCap: 'round',
      lineJoin: 'round'
    },
    area: {
      style: {
        fill: 'l(90) 0:#3b82f640 0.5:#3b82f620 1:#3b82f600',
        fillOpacity: 0.6
      }
    }
  })

  try {
    chartInstance.render()
    console.log('Chart rendered successfully.')
  } catch (error) {
    console.error('Error rendering chart:', error)
    if (container) container.innerHTML = ''
    message.error('Failed to render player value chart.')
  }
}

// Handle modal close
const handleOk = () => {
  isVisible.value = false
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  playerValueHistory.value = []
  selectedPlayer.value = null
  emit('close')
}

// Utility functions
function getPositionTag(position) {
  switch (position) {
    case 'QB':
      return {
        color: 'rgb(39, 125, 161)',
        background: 'rgb(39, 125, 161, .15)',
        'border-color': 'rgb(39, 125, 161)'
      }
    case 'RB':
      return {
        color: 'rgb(144, 190, 109)',
        background: 'rgb(144, 190, 109, .15)',
        'border-color': 'rgb(144, 190, 109)'
      }
    case 'WR':
      return {
        color: 'rgb(67, 170, 139)',
        background: 'rgb(67, 170, 139, .15)',
        'border-color': 'rgb(67, 170, 139)'
      }
    case 'TE':
      return {
        color: 'rgb(249, 132, 74)',
        background: 'rgb(249, 132, 74, .15)',
        'border-color': 'rgb(249, 132, 74)'
      }
    case 'PICKS':
      return {
        color: 'rgb(143, 145, 146)',
        background: 'rgb(143, 145, 146, .15)',
        'border-color': 'rgb(143, 145, 146)'
      }
    default:
      return {}
  }
}

function getTierClass(value) {
  if (value >= 8000) return 'tier-elite'
  if (value >= 5000) return 'tier-1'
  if (value >= 3000) return 'tier-2'
  if (value >= 1500) return 'tier-3'
  if (value >= 800) return 'tier-4'
  return 'tier-depth'
}

function getTierLabel(value) {
  if (value >= 8000) return 'Elite'
  if (value >= 5000) return 'Tier 1'
  if (value >= 3000) return 'Tier 2'
  if (value >= 1500) return 'Tier 3'
  if (value >= 800) return 'Depth'
  return 'Waiver'
}

// Expose the showModal function
defineExpose({
  showModal
})
</script>

<style scoped>
/* Compact Player Modal */
.modern-player-modal :deep(.ant-modal-content) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.player-modal-content {
  padding: 0;
}

.player-header-compact {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.03));
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.player-avatar-small {
  position: relative;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #64748b;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.tier-badge-small {
  position: absolute;
  bottom: -6px;
  right: -6px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: 1px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-info-compact {
  flex: 1;
  min-width: 0;
}

.player-name-compact {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: var(--color-text);
  line-height: 1.2;
}

.player-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.position-badge-small {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid currentColor;
}

.meta-info {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
}

.value-compact {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  text-align: right;
  flex-shrink: 0;
}

.stats-compact {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(248, 250, 252, 0.5);
}

.stat-item {
  flex: 1;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  padding: 12px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-number {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  margin-bottom: 2px;
}

.stat-text {
  font-size: 10px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
}

.chart-compact {
  padding: 20px;
}

.chart-compact h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px 0;
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
}

.loading-state p {
  margin-top: 12px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* Compact Tier Badge Colors */
.tier-elite.tier-badge-small {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.tier-1.tier-badge-small {
  background: linear-gradient(135deg, #22c55e, #15803d);
  color: white;
}

.tier-2.tier-badge-small {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.tier-3.tier-badge-small {
  background: linear-gradient(135deg, #eab308, #a16207);
  color: white;
}

.tier-4.tier-badge-small {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
}

.tier-depth.tier-badge-small {
  background: linear-gradient(135deg, #fb923c, #c2410c);
  color: white;
}

/* Mobile Modal Optimization */
@media (max-width: 768px) {
  .modern-player-modal :deep(.ant-modal) {
    width: 95% !important;
    max-width: 380px !important;
    margin: 10px auto;
  }

  .player-header-compact {
    padding: 16px;
    gap: 12px;
  }

  .player-avatar-small {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }

  .tier-badge-small {
    bottom: -4px;
    right: -4px;
    padding: 1px 6px;
    font-size: 7px;
  }

  .player-name-compact {
    font-size: 16px;
  }

  .value-compact {
    font-size: 18px;
  }

  .stats-compact {
    padding: 12px 16px;
    gap: 8px;
  }

  .stat-item {
    padding: 10px 6px;
  }

  .stat-number {
    font-size: 14px;
  }

  .chart-compact {
    padding: 16px;
  }

  #player-value-chart-container {
    height: 140px !important;
  }
}

/* Global dark theme overrides */
html.dark .modern-player-modal .ant-modal-content {
  background: rgba(34, 34, 34, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4) !important;
}

html.dark .stats-compact {
  background: rgba(31, 41, 55, 0.5) !important;
}

html.dark .stat-item {
  background: rgba(55, 65, 81, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
</style>