<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <a-layout-content class="responsive-padding">
      <div class="page-title">
        <h1>Fantasy Navigator Rankings</h1>
        <p class="subtitle">
          Dynasty and Redraft rankings that help you make informed decisions. Filter by position,
          league type, and roster type. Click on a player for detailed value history.
        </p>
      </div>

      <!-- Controls section -->
      <div class="ranks-controls">
        <div class="ranks-toggle-section">
          <div class="setting-item">
            <a-switch
              id="switch1"
              size="large"
              v-model:checked="state.checked1"
              checked-children="Superflex"
              un-checked-children="OneQB"
            />
          </div>
          <div class="setting-item">
            <a-switch
              id="switch2"
              size="large"
              v-model:checked="state.checked2"
              checked-children="Dynasty"
              un-checked-children="Redraft"
            />
          </div>
          <!-- Updated Rookie switch without separate label -->
          <div class="setting-item">
            <a-switch
              id="rookie-switch"
              v-model:checked="checkState.showRookiesOnly"
              checked-children="Rookies Only"
              un-checked-children="All Players"
              size="large"
            />
          </div>
        </div>

        <div class="ranks-filter-section">
          <a-checkbox
            v-model:checked="checkState.checkAll"
            :indeterminate="checkState.indeterminate"
            @change="onCheckAllChange"
          >
            ALL
          </a-checkbox>
          <a-checkbox-group v-model:value="checkState.checkedList" :options="plainOptions" />

          <a-button type="default" @click="downloadData" class="download-btn">
            <DownloadOutlined /> Export
          </a-button>
        </div>
      </div>

      <!-- Rankings table -->
      <a-spin :spinning="isLoading">
        <div class="rankings-table">
          <div class="rankings-header">
            <div class="cell cell-rank"></div>
            <div class="cell cell-tier">Tier</div>
            <div class="cell cell-player">Player</div>
            <div class="cell cell-team">Team</div>
            <div class="cell cell-age">Age</div>
            <div class="cell cell-value">Value</div>
          </div>

          <div
            v-for="(asset, index) in paginatedData"
            :key="asset._rownum"
            class="rankings-row"
            :class="getTierClass(asset.player_value)"
            @click="showPlayerModal(asset)"
          >
            <div class="cell cell-rank">{{ (currentPage - 1) * perPage + index + 1 }}</div>
            <div class="cell cell-tier">
              <div class="tier-indicator" :class="getTierClass(asset.player_value)">
                {{ getTierLabel(asset.player_value) }}
              </div>
            </div>
            <div class="cell cell-player">
              <div class="player-container">
                <div class="position-tag" :style="getPositionTag(asset._position)">
                  {{ asset._position }}<span class="pos-rank">{{ asset.pos_ranked }}</span>
                </div>
                <div class="player-name">{{ asset.player_full_name }}</div>
              </div>
            </div>
            <div class="cell cell-team">{{ asset.team || '—' }}</div>
            <div class="cell cell-age">{{ asset.age || '—' }}</div>
            <div class="cell cell-value">{{ asset.player_value.toLocaleString() }}</div>
          </div>
        </div>
        <div class="pagination-container">
          <a-pagination
            :current="currentPage"
            :total="filteredData.length"
            :pageSize="perPage"
            @change="handlePageChange"
          ></a-pagination>
        </div>
      </a-spin>

      <!-- Player Detail Modal -->
      <a-modal
        v-model:open="isPlayerModalVisible"
        :title="selectedPlayer?.player_full_name || 'Player Details'"
        @ok="handlePlayerModalOk"
        :footer="null"
        width="400px"
      >
        <div v-if="selectedPlayer" class="player-modal-content">
          <div class="player-modal-header">
            <div class="player-image-placeholder">
              <!-- Placeholder for player image -->
              <UserOutlined style="font-size: 48px; color: #ccc" />
            </div>
            <div class="player-modal-info">
              <h2>{{ selectedPlayer.player_full_name }}</h2>
              <p>
                <a-tag :style="getPositionTag(selectedPlayer._position)">{{
                  selectedPlayer._position
                }}</a-tag>
                <span v-if="selectedPlayer.team"> &bull; {{ selectedPlayer.team }}</span>
                <span v-if="selectedPlayer.age"> &bull; {{ selectedPlayer.age }} yrs</span>
              </p>
            </div>
          </div>
          <div class="player-modal-details">
            <a-descriptions bordered :column="1" size="small">
              <a-descriptions-item label="Value">
                {{
                  selectedPlayer.player_value === -1
                    ? 'N/A'
                    : selectedPlayer.player_value?.toLocaleString()
                }}
              </a-descriptions-item>
              <a-descriptions-item label="Overall Rank">
                {{ selectedPlayer._rownum }}
              </a-descriptions-item>
              <a-descriptions-item label="Positional Rank">
                {{ selectedPlayer.pos_ranked }}
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- Player Value Chart Section -->
          <div class="player-modal-chart">
            <h3>Value History</h3>
            <a-spin :spinning="isChartLoading">
              <div id="player-value-chart-container" style="height: 200px; margin-top: 16px">
                <!-- Chart will be rendered here -->
                <a-empty
                  v-if="!isChartLoading && (!playerValueHistory || playerValueHistory.length === 0)"
                  description="No value history available"
                />
              </div>
            </a-spin>
          </div>
        </div>
        <div v-else>
          <p>Loading player details...</p>
        </div>
      </a-modal>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watchEffect, watch, nextTick } from 'vue'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Party imports
import axios from 'axios'
import { message, Spin, Column, Empty, Descriptions, DescriptionsItem } from 'ant-design-vue' // Added Descriptions, DescriptionsItem
import { HomeOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons-vue'
import 'ant-design-vue/dist/reset.css'
import { Line } from '@antv/g2plot'

// Source image imports
import fnLogo from '@/assets/sourceLogos/fn.png'

const ranksData = ref([{}])
const isLoading = ref(false)
const rankType = ref('dynasty')
const currentPage = ref(1)
const perPage = ref(75)

const plainOptions = ['QB', 'RB', 'WR', 'TE']

const checkState = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: ['QB', 'RB', 'WR', 'TE'],
  showRookiesOnly: false
})

const onCheckAllChange = (e: any) => {
  Object.assign(checkState, {
    checkedList: e.target.checked ? plainOptions : [],
    indeterminate: false
  })
}
watch(
  () => checkState.checkedList,
  (val) => {
    checkState.indeterminate = !!val.length && val.length < plainOptions.length
    checkState.checkAll = val.length === plainOptions.length
  }
)

const state = reactive({
  checked1: true,
  checked2: true
})

onMounted(() => {
  fetchRanks()
})

watchEffect(() => {
  rankType.value = state.checked2 ? 'dynasty' : 'redraft'
})

const filteredData = computed(() => {
  const filtered = ranksData.value.filter((item) => {
    const rankTypeCondition = state.checked2
      ? item.rank_type === 'dynasty'
      : item.rank_type === 'redraft'
    const rosterTypeCondition = state.checked1
      ? item.roster_type === 'sf_value'
      : item.roster_type === 'one_qb_value'
    const positionCondition = checkState.checkedList.includes(item._position)
    const rookieCondition = !checkState.showRookiesOnly || item.is_rookie === 'true'

    return rankTypeCondition && rosterTypeCondition && positionCondition && rookieCondition
  })

  const grouped = filtered.reduce((acc, item) => {
    acc[item._position] = acc[item._position] || []
    acc[item._position].push(item)
    return acc
  }, {})

  Object.keys(grouped).forEach((position) => {
    grouped[position].sort((a, b) => b.player_value - a.player_value)
    grouped[position].forEach((item, index) => {
      item.pos_ranked = index + 1
    })
  })

  return Object.values(grouped)
    .flat()
    .sort((a, b) => b.player_value - a.player_value)
})

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

function getTierClass(value: number) {
  if (value >= 8000) return 'tier-elite'
  if (value >= 5000) return 'tier-1'
  if (value >= 3000) return 'tier-2'
  if (value >= 1500) return 'tier-3'
  if (value >= 800) return 'tier-4'
  return 'tier-depth'
}

function getTierLabel(value: number) {
  if (value >= 8000) return 'Elite'
  if (value >= 5000) return 'Tier 1'
  if (value >= 3000) return 'Tier 2'
  if (value >= 1500) return 'Tier 3'
  if (value >= 800) return 'Depth'
  return 'Waiver'
}

async function fetchRanks() {
  isLoading.value = true
  const apiUrl = import.meta.env.VITE_API_URL
  try {
    const response = await axios.get(`${apiUrl}/ranks`, {
      params: {
        platform: 'sf'
      }
    })
    console.log('Pulling Player Values...')
    ranksData.value = response.data
  } catch (error) {
    console.log('There was an error pulling values...')
  } finally {
    isLoading.value = false
  }
}

function downloadData() {
  const dataToDownload = filteredData.value

  let csvContent = 'data:text/csv;charset=utf-8,'

  if (dataToDownload.length > 0) {
    const headers = Object.keys(dataToDownload[0]).join(',')
    csvContent += headers + '\r\n'

    dataToDownload.forEach((row) => {
      const rowData = Object.values(row)
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(',')
      csvContent += rowData + '\r\n'
    })
  }

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  const fileName = `FantasyNavigator_ranks_data.csv`

  link.setAttribute('href', encodedUri)
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredData.value.slice(start, end)
})

function handlePageChange(page) {
  currentPage.value = page
}

// Modal State
const isPlayerModalVisible = ref(false)
const selectedPlayer = ref(null)
const playerValueHistory = ref([])
const isChartLoading = ref(false)
let chartInstance: Line | null = null

// Modal Functions
const showPlayerModal = async (player) => {
  selectedPlayer.value = player
  isPlayerModalVisible.value = true
  isChartLoading.value = true
  playerValueHistory.value = []

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  if (!player.ktc_player_id) {
    console.error('Player KTC ID is missing for:', player.player_full_name)
    message.error('Cannot load value history: Player ID missing.')
    isChartLoading.value = false
    await nextTick()
    const container = document.getElementById('player-value-chart-container')
    if (container) container.innerHTML = ''
    return
  }

  const apiUrl = import.meta.env.VITE_API_URL
  // Determine rank_type based on the switch state
  const currentRankType = state.checked2 ? 'dynasty' : 'redraft'
  try {
    console.log(
      `Fetching value history for player ID: ${player.ktc_player_id} with rank_type=${currentRankType}`
    )
    const response = await axios.get(`${apiUrl}/player_values`, {
      params: {
        player_id: player.ktc_player_id,
        rank_type: currentRankType // Use dynamic rank_type
      }
    })

    if (response.data && Array.isArray(response.data)) {
      playerValueHistory.value = response.data
      console.log(`Fetched ${response.data.length} history points.`)
    } else {
      console.warn('Received unexpected data format for player value history:', response.data)
      playerValueHistory.value = []
    }

    await nextTick()
    renderPlayerValueChart()
  } catch (error) {
    console.error('Error fetching player value history:', error)
    message.error('Could not load player value history.')
    playerValueHistory.value = []
    await nextTick()
    renderPlayerValueChart()
  } finally {
    isChartLoading.value = false
  }
}

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

  const valueField = state.checked1 ? 'superflex_player_value' : 'one_qb_player_value'

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
    padding: 'auto',
    xField: 'date',
    yField: 'value',
    xAxis: {
      type: 'time',
      tickCount: 5,
      title: { text: '', style: { fontSize: 10 } }
    },
    yAxis: {
      title: { text: '', style: { fontSize: 10 } },
      label: {
        formatter: (v) => `${Number(v).toLocaleString()}`
      },
      min: minValue,
      max: maxValue,
      nice: false
    },
    tooltip: {
      showCrosshairs: true,
      shared: true,
      title: (data) => (data[0]?.date ? new Date(data[0].date).toLocaleDateString() : 'Date'),
      formatter: (datum) => ({ name: 'Value', value: datum.value.toLocaleString() })
    },
    smooth: true,
    height: 180,
    autoFit: true,
    point: {
      size: 4, // <-- Make points larger (default is 4)
      shape: 'circle',
      style: {
        fill: '#43AA8B',
        stroke: '#8F9192',
        lineWidth: 1,
        shadowColor: '#277DA1',
        shadowBlur: 4
      }
    },
    lineStyle: {
      stroke: '#277DA1',
      lineWidth: 2,
      shadowColor: '#277DA1',
      shadowBlur: 2
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

const handlePlayerModalOk = () => {
  isPlayerModalVisible.value = false
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  playerValueHistory.value = []
  selectedPlayer.value = null
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: var(--color-background-soft);
  /* Define theme variables */
  --background-color: #f5f7fa;
  --text-color: #2d3142;
  --secondary-text-color: #4b5563;
  --muted-text-color: #6b7280;
  --card-background: #ffffff;
  --header-background: #f1f5f9;
  --border-color: #e0e0e0;
  --hover-background: #f0f5ff;
  --control-background: #f9fafb;
  --shadow-color: rgba(0, 0, 0, 0.06);
  --primary-color: #1e3a8a;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

:deep(.dark-theme) .layout {
  /* Dark theme overrides */
  --background-color: #1a202c;
  --text-color: #e2e8f0;
  --secondary-text-color: #a0aec0;
  --muted-text-color: #718096;
  --card-background: #2d3748;
  --header-background: #2c3e50;
  --border-color: #4a5568;
  --hover-background: #38465a;
  --control-background: #2d3748;
  --shadow-color: rgba(0, 0, 0, 0.2);
  --primary-color: #63b3ed;
}

.responsive-padding {
  padding: 0 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  margin: 24px 0;
}

.page-title h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.subtitle {
  color: var(--secondary-text-color);
  transition: color 0.3s ease;
}

.rank-logos {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
  margin-right: 5px;
}

.ranks-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  background: var(--color-background);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px var(--shadow-color);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}

.ranks-toggle-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch-label {
  font-weight: 500;
  color: var(--secondary-text-color);
  transition: color 0.3s ease;
}

.ranks-filter-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  color: var(--color-text);
  transition: color 0.3s ease;
}

.download-btn {
  margin-left: auto;
}

.rankings-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
  max-width: 100%;
}

.rankings-header {
  display: grid;
  grid-template-columns: 50px 80px minmax(250px, 2fr) 100px 80px 120px;
  padding: 12px 8px;
  font-weight: 600;
  color: var(--text-color);
  background: var(--color-background);
  position: sticky;
  top: 0;
  z-index: 10;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.rankings-row {
  display: grid;
  grid-template-columns: 50px 80px minmax(250px, 2fr) 100px 80px 120px;
  padding: 10px 8px;
  align-items: center;
  transition: background-color 0.2s;
  margin-bottom: 8px;
  background: var(--color-background);
  border-radius: 6px;
  cursor: pointer;
}

.rankings-row:last-child {
  margin-bottom: 0;
}

.cell {
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-color);
  transition: color 0.3s ease;
}

.cell-rank {
  font-weight: 600;
  color: var(--secondary-text-color);
  text-align: center;
}

.cell-value {
  font-weight: 700;
  color: var(--primary-color);
  text-align: right;
}

.cell-team {
  color: var(--secondary-text-color);
  font-weight: 500;
}

.cell-age {
  text-align: center;
  color: var(--muted-text-color);
}

.player-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-name {
  font-weight: 600;
  color: var(--primary-text-color);
  transition: color 0.3s ease;
}

/* The remaining styles may need similar updates */

.player-modal-content {
  padding: 10px;
}

.player-modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.player-image-placeholder {
  width: 60px;
  height: 60px;
  background-color: var(--control-background);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.player-modal-info h2 {
  margin-bottom: 4px;
  font-size: 1.3em;
  color: var(--text-color);
}

.player-modal-info p {
  margin: 0;
  color: var(--secondary-text-color);
}

.player-modal-details {
  margin-top: 16px;
}

.player-modal-details .ant-descriptions-item-label {
  font-weight: 600;
  color: var(--text-color);
}

.player-modal-chart {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.player-modal-chart h3 {
  margin-bottom: 12px;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text-color);
}

#player-value-chart-container .ant-spin-nested-loading {
  height: 100%;
}
#player-value-chart-container .ant-spin-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
#player-value-chart-container .ant-empty {
}

:deep(.dark-theme) .ant-modal-content {
  background-color: var(--card-background);
}

:deep(.dark-theme) .ant-modal-header {
  background-color: var(--card-background);
  border-bottom-color: var(--border-color);
}

:deep(.dark-theme) .ant-modal-title {
  color: var(--text-color);
}

:deep(.dark-theme) .ant-modal-close {
  color: var(--text-color);
}

:deep(.dark-theme) .ant-descriptions-item-label,
:deep(.dark-theme) .ant-descriptions-item-content {
  background-color: var(--card-background);
  border-color: var(--border-color);
  color: var(--text-color);
}

:deep(.dark-theme) .ant-empty-description {
  color: var(--muted-text-color);
}

:deep(.dark-theme) .ant-pagination-item a {
  color: var(--text-color);
}

:deep(.dark-theme) .ant-pagination-item-active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.dark-theme) .ant-pagination-item-active a {
  color: #fff;
}
.tier-indicator {
  font-size: 0.65rem;
  padding: 0 2px;
  max-width: 32px;
  color: var(--primary-text-color);
}
.tier-elite {
  border-left: 4px solid #277da1;
}
.tier-elite .tier-indicator {
  background-color: #277da1;
}

.tier-1 {
  border-left: 4px solid #43aa8b;
}
.tier-1 .tier-indicator {
  background-color: #43aa8b;
}

.tier-2 {
  border-left: 4px solid #90be6d;
}
.tier-2 .tier-indicator {
  background-color: #90be6d;
}

.tier-3 {
  border-left: 4px solid #f9c74f;
}
.tier-3 .tier-indicator {
  background-color: #f9c74f;
  color: #333;
}

.tier-4 {
  border-left: 4px solid #f9844a;
}
.tier-4 .tier-indicator {
  background-color: #f9844a;
}

.tier-depth {
  border-left: 4px solid #bdbdbd;
}
.tier-depth .tier-indicator {
  background-color: #bdbdbd;
}

@media (min-width: 1400px) {
  .responsive-padding {
    padding: 0 32px;
  }
}

@media (min-width: 768px) and (max-width: 1399px) {
  .responsive-padding {
    padding: 0 24px;
  }
}
.tier-indicator {
  font-size: 0.65rem;
  padding: 0 2px;
  max-width: 32px;
  color: var(--primary-text-color);
}
.tier-elite {
  border-left: 4px solid #277da1;
}
.tier-elite .tier-indicator {
  background-color: #277da1;
}

.tier-1 {
  border-left: 4px solid #43aa8b;
}
.tier-1 .tier-indicator {
  background-color: #43aa8b;
}

.tier-2 {
  border-left: 4px solid #90be6d;
}
.tier-2 .tier-indicator {
  background-color: #90be6d;
}

.tier-3 {
  border-left: 4px solid #f9c74f;
}
.tier-3 .tier-indicator {
  background-color: #f9c74f;
  color: #333;
}

.tier-4 {
  border-left: 4px solid #f9844a;
}
.tier-4 .tier-indicator {
  background-color: #f9844a;
}

.tier-depth {
  border-left: 4px solid #bdbdbd;
}
.tier-depth .tier-indicator {
  background-color: #bdbdbd;
}

@media (max-width: 767px) {
  .responsive-padding {
    max-width: 100%;
  }

  .rankings-header,
  .rankings-row {
    grid-template-columns: 24px 36px minmax(60px, 1fr) 34px 24px 54px;
    font-size: 0.85rem;
    padding: 2px 1px;
  }

  .rankings-row {
    margin-bottom: 4px;
    border-radius: 4px;
  }

  .cell {
    padding: 0 1px;
    font-size: 0.75rem;
  }

  .cell-value {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--primary-color);
    text-align: right;
    min-width: 48px;
    max-width: 54px;
    overflow: visible;
  }

  .player-container {
    gap: 2px;
  }

  .position-tag {
    padding: 0 2px;
    font-size: 0.65rem;
  }

  .tier-indicator {
    font-size: 0.65rem;
    padding: 0 2px;
    max-width: 32px;
    color: #ffff;
    border-radius: 5px;
  }
  .tier-elite {
    border-left: 4px solid #277da1;
  }
  .tier-elite .tier-indicator {
    background-color: #277da1;
  }

  .tier-1 {
    border-left: 4px solid #43aa8b;
  }
  .tier-1 .tier-indicator {
    background-color: #43aa8b;
  }

  .tier-2 {
    border-left: 4px solid #90be6d;
  }
  .tier-2 .tier-indicator {
    background-color: #90be6d;
  }

  .tier-3 {
    border-left: 4px solid #f9c74f;
  }
  .tier-3 .tier-indicator {
    background-color: #f9c74f;
    color: #333;
  }

  .tier-4 {
    border-left: 4px solid #f9844a;
  }
  .tier-4 .tier-indicator {
    background-color: #f9844a;
  }

  .tier-depth {
    border-left: 4px solid #bdbdbd;
  }
  .tier-depth .tier-indicator {
    background-color: #bdbdbd;
  }
  .player-modal-chart {
    margin-top: 16px;
    padding-top: 12px;
  }

  #player-value-chart-container {
    height: 180px;
  }
}

@media (max-width: 400px) {
  .rankings-header,
  .rankings-row {
    grid-template-columns: 18px 26px minmax(40px, 1fr) 24px 16px 38px;
    font-size: 0.7rem;
    padding: 2px 0;
  }
  .cell-value {
    min-width: 36px;
    max-width: 38px;
    font-size: 0.7rem;
  }
}

@media (max-width: 575px) {
  .rankings-header,
  .rankings-row {
    grid-template-columns: 30px 55px minmax(120px, 1fr) 50px 40px 70px;
    font-size: 0.8rem;
    padding: 6px 2px;
  }

  .player-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .cell-team,
  .cell-age {
    font-size: 0.75rem;
  }

  .page-title h1 {
    font-size: 24px;
    color: var(--color-text);
  }
}
</style>
