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

      <!-- Tier Legend -->
      <div class="tier-legend">
        <div class="legend-items">
          <a-button
            class="tier-filter-btn tier-elite-legend"
            :class="{ active: tierFilters.includes('tier-elite') }"
            @click="toggleTierFilter('tier-elite')"
          >
            Elite
          </a-button>
          <a-button
            class="tier-filter-btn tier-1-legend"
            :class="{ active: tierFilters.includes('tier-1') }"
            @click="toggleTierFilter('tier-1')"
          >
            Tier 1
          </a-button>
          <a-button
            class="tier-filter-btn tier-2-legend"
            :class="{ active: tierFilters.includes('tier-2') }"
            @click="toggleTierFilter('tier-2')"
          >
            Tier 2
          </a-button>
          <a-button
            class="tier-filter-btn tier-3-legend"
            :class="{ active: tierFilters.includes('tier-3') }"
            @click="toggleTierFilter('tier-3')"
          >
            Tier 3
          </a-button>
          <a-button
            class="tier-filter-btn tier-4-legend"
            :class="{ active: tierFilters.includes('tier-4') }"
            @click="toggleTierFilter('tier-4')"
          >
            Tier 4
          </a-button>
          <a-button
            class="tier-filter-btn tier-depth-legend"
            :class="{ active: tierFilters.includes('tier-depth') }"
            @click="toggleTierFilter('tier-depth')"
          >
            Depth
          </a-button>
        </div>
        <div class="legend-search-container">
          <a-auto-complete
            v-model:value="playerSearchInput"
            :options="searchOptions"
            :allow-clear="true"
            placeholder="Search and filter by player..."
            @select="selectPlayer"
            @search="searchPlayers"
            @keydown.enter="selectPlayerByEnter"
            size="large"
          >
            <template #prefix>
              <SearchOutlined style="color: rgba(0, 0, 0, 0.25)" />
            </template>
          </a-auto-complete>
          <a-button
            v-if="selectedPlayerFilter"
            @click="clearPlayerFilter"
            type="default"
            size="large"
            class="clear-filter-btn"
          >
            Clear Filter
          </a-button>
        </div>
      </div>

      <!-- Rankings table -->
      <a-spin :spinning="isLoading">
        <div class="rankings-table">
          <div class="rankings-header">
            <div class="cell cell-rank"></div>
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

      <!-- Player History Modal -->
      <PlayerHistoryModal
        ref="playerHistoryModalRef"
        :is-superflex="state.checked1"
        :is-dynasty="state.checked2"
        platform="sleeper"
        @close="handlePlayerModalClose"
      />
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watchEffect, watch } from 'vue'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import PlayerHistoryModal from '@/components/PlayerHistoryModal.vue'

// 3rd Party imports
import axios from 'axios'
import { message } from 'ant-design-vue'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import 'ant-design-vue/dist/reset.css'


const ranksData = ref([])
const isLoading = ref(false)
const rankType = ref('dynasty')
const currentPage = ref(1)
const perPage = ref(75)
const tierFilters = ref(['tier-elite', 'tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-depth'])
const playerSearchInput = ref('')
const searchOptions = ref([])
const selectedPlayerFilter = ref('')


const plainOptions = ['QB', 'RB', 'WR', 'TE']

const checkState = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: ['QB', 'RB', 'WR', 'TE'],
  showRookiesOnly: false
})

const onCheckAllChange = (e) => {
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

function toggleTierFilter(tier) {
  const index = tierFilters.value.indexOf(tier)
  if (index > -1) {
    tierFilters.value.splice(index, 1)
  } else {
    tierFilters.value.push(tier)
  }
  currentPage.value = 1
}

function searchPlayers(searchText) {
  if (!searchText || searchText.trim().length === 0) {
    // Show top 3 value players when search is empty
    const topPlayers = ranksData.value.slice(0, 3)
    const uniquePlayerMap = new Map()

    topPlayers.forEach((player) => {
      const uniqueKey = `${player.player_id}`
      const teamInfo = player.team ? ` - ${player.team}` : ''
      const ageInfo = player.age ? ` (${player.age})` : ''
      const positionInfo = player._position || ''
      const label = `${player.player_full_name} - ${positionInfo}${teamInfo}${ageInfo}`
      uniquePlayerMap.set(uniqueKey, {
        label: label,
        value: player.player_full_name,
        data: player
      })
    })

    searchOptions.value = Array.from(uniquePlayerMap.values())
    return
  }

  // Get filtered players that match the search text
  const matchingPlayers = ranksData.value.filter((item) =>
    item.player_full_name.toLowerCase().includes(searchText.toLowerCase())
  )

  // Sort by player value (highest first)
  const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'
  matchingPlayers.sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0))

  // Create a Map to ensure unique player selection
  const uniquePlayerMap = new Map()

  // Limit to top 3 matches
  matchingPlayers.slice(0, 3).forEach((player) => {
    const uniqueKey = `${player.player_id}`
    const teamInfo = player.team ? ` - ${player.team}` : ''
    const ageInfo = player.age ? ` (${player.age})` : ''
    const positionInfo = player._position || ''
    const label = `${player.player_full_name} - ${positionInfo}${teamInfo}${ageInfo}`

    uniquePlayerMap.set(uniqueKey, {
      label: label,
      value: player.player_full_name,
      data: player
    })
  })

  searchOptions.value = Array.from(uniquePlayerMap.values())
}

function selectPlayer(playerName) {
  selectedPlayerFilter.value = playerName
  playerSearchInput.value = ''
  searchOptions.value = []
  currentPage.value = 1
}

function selectPlayerByEnter(event) {
  const inputValue = playerSearchInput.value
  if (inputValue && inputValue.trim().length > 0) {
    selectedPlayerFilter.value = inputValue
    playerSearchInput.value = ''
    searchOptions.value = []
    currentPage.value = 1
  }
}

function clearPlayerFilter() {
  selectedPlayerFilter.value = ''
  playerSearchInput.value = ''
  searchOptions.value = []
  currentPage.value = 1
}

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
    const tierCondition = tierFilters.value.includes(getTierClass(item.player_value))
    const searchCondition = selectedPlayerFilter.value === '' ||
      item.player_full_name.toLowerCase() === selectedPlayerFilter.value.toLowerCase()

    return rankTypeCondition && rosterTypeCondition && positionCondition && rookieCondition && tierCondition && searchCondition
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

  // Sort all filtered players by value and recalculate overall rankings
  return Object.values(grouped)
    .flat()
    .sort((a, b) => b.player_value - a.player_value)
    .map((player, index) => ({
      ...player,
      _rownum: index + 1  // Recalculate overall rank within this specific league configuration
    }))
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

function getTierClass(value) {
  if (value >= 8000) return 'tier-elite'
  if (value >= 5000) return 'tier-1'
  if (value >= 3000) return 'tier-2'
  if (value >= 1500) return 'tier-3'
  if (value >= 800) return 'tier-4'
  return 'tier-depth'
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
const playerHistoryModalRef = ref(null)

// Modal Functions
const showPlayerModal = async (player) => {
  if (!player.ktc_player_id) {
    console.error('Player KTC ID is missing for:', player.player_full_name)
    message.error('Cannot load value history: Player ID missing.')
    return
  }

  // Use the PlayerHistoryModal component
  if (playerHistoryModalRef.value) {
    playerHistoryModalRef.value.showModal(player.ktc_player_id)
  }
}

const handlePlayerModalClose = () => {
  // Handle any cleanup if needed
}


</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
}


.responsive-padding {
  padding: 0 16px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  margin: 32px 0;
}

.page-title h1 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #277DA1;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.ranks-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
  background: var(--color-background);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border);
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
  background: var(--color-background);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border);
}


.rankings-header {
  display: grid;
  grid-template-columns: 80px 3fr 160px 130px 180px;
  padding: 18px 20px;
  font-weight: 600;
  color: var(--color-text);
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}


.rankings-row {
  display: grid;
  grid-template-columns: 80px 3fr 160px 130px 180px;
  padding: 16px 20px;
  align-items: center;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  position: relative;
}


.rankings-row:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateX(2px);
}


.rankings-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text);
}

.cell-rank {
  font-weight: 600;
  text-align: center;
  color: var(--color-text-secondary);
  min-width: 0;
  overflow: visible;
}

.cell-value {
  font-weight: 700;
  color: var(--color-primary);
  text-align: right;
}

.cell-team {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.cell-age {
  text-align: center;
  color: var(--color-text-secondary);
}

.player-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-name {
  font-weight: 600;
  color: var(--color-text);
}

/* Tier Legend */
.tier-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.legend-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
}

.tier-filter-btn {
  cursor: pointer;
  transition: all 0.2s ease;
  border-width: 2px !important;
  font-weight: 600;
  background: #d3d3d3 !important;
  border-color: #d3d3d3 !important;
  color: #666 !important;
}

.tier-filter-btn:hover {
  background: #c0c0c0 !important;
  border-color: #c0c0c0 !important;
}

.tier-filter-btn.active {
  font-weight: 700;
  background: transparent !important;
  color: var(--tier-color) !important;
  border-color: var(--tier-color) !important;
}


.tier-filter-btn.tier-elite-legend.active {
  --tier-color: #60a5fa;
}

.tier-filter-btn.tier-1-legend.active {
  --tier-color: #4ade80;
}

.tier-filter-btn.tier-2-legend.active {
  --tier-color: #2dd4bf;
}

.tier-filter-btn.tier-3-legend.active {
  --tier-color: #facc15;
}

.tier-filter-btn.tier-4-legend.active {
  --tier-color: #fb923c;
}

.tier-filter-btn.tier-depth-legend.active {
  --tier-color: #fdba74;
}

.legend-search-container {
  display: flex;
  gap: 8px;
  align-items: center;
  position: relative;
  z-index: 100;
  flex: 0 1 auto;
}

.legend-search-container :deep(.ant-input) {
  padding: 8px 12px !important;
  font-size: 14px !important;
  height: 40px !important;
}

.legend-search-container :deep(.ant-select-selector) {
  border-width: 2px !important;
  width: 100% !important;
  height: 40px !important;
}

.legend-search-container :deep(.ant-select) {
  width: 350px !important;
  min-width: 350px !important;
  flex-shrink: 0;
}

.legend-search-container :deep(.ant-select-dropdown) {
  z-index: 1000 !important;
  width: 350px !important;
}

.clear-filter-btn {
  white-space: nowrap;
  flex-shrink: 0;
  height: 40px;
}

/* Autocomplete Dropdown Styling */
:global(.ant-select-dropdown.legend-search-dropdown) {
  width: 350px !important;
  min-width: 350px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
  max-height: 200px !important;
  overflow-y: auto !important;
}

:global(.legend-search-container .ant-select-dropdown) {
  width: 350px !important;
  min-width: 350px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
  max-height: 200px !important;
  overflow-y: auto !important;
}

:global(.legend-search-container .ant-select-selector) {
  width: 100% !important;
}

:global(.legend-search-container .ant-select-item-option-content) {
  font-size: 14px !important;
  padding: 0 !important;
  white-space: normal !important;
}

:global(.legend-search-container .ant-select-item) {
  padding: 12px 16px !important;
  min-height: 40px !important;
  line-height: 1.5 !important;
}

:global(.legend-search-container .ant-select-item-option) {
  padding: 12px 16px !important;
  min-height: 40px !important;
}

:global(.legend-search-container .ant-select-item-option-selected) {
  background: rgba(59, 130, 246, 0.15) !important;
}

:global(.legend-search-container .ant-select-item-option:hover) {
  background: rgba(59, 130, 246, 0.1) !important;
}

:global(.legend-search-container .ant-select-dropdown-list) {
  max-height: 160px !important;
  overflow-y: auto !important;
}

/* Tier System - Row Backgrounds */

/* Elite Tier - Blue */
.tier-elite {
  background: linear-gradient(90deg, rgba(96, 165, 250, 0.05), transparent);
  border-left: 3px solid #60a5fa;
}

/* Tier 1 - Darker Green */
.tier-1 {
  background: linear-gradient(90deg, rgba(74, 222, 128, 0.05), transparent);
  border-left: 3px solid #4ade80;
}

/* Tier 2 - Green */
.tier-2 {
  background: linear-gradient(90deg, rgba(45, 212, 191, 0.05), transparent);
  border-left: 3px solid #2dd4bf;
}

/* Tier 3 - Yellow */
.tier-3 {
  background: linear-gradient(90deg, rgba(250, 204, 21, 0.05), transparent);
  border-left: 3px solid #facc15;
}

/* Tier 4 - Orange */
.tier-4 {
  background: linear-gradient(90deg, rgba(251, 146, 60, 0.05), transparent);
  border-left: 3px solid #fb923c;
}

/* Depth Tier - Orangish */
.tier-depth {
  background: linear-gradient(90deg, rgba(253, 186, 116, 0.05), transparent);
  border-left: 3px solid #fdba74;
}

.position-tag {
  padding: 1px 3px;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 900;
  border: 1px solid currentColor;
}

.pos-rank {
  margin-left: 4px;
  opacity: 0.8;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}



/* Mobile Responsive */
@media (max-width: 768px) {
  .tier-legend {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
  }

  .legend-items {
    width: 100%;
    justify-content: center;
  }

  .legend-search-container {
    width: 100%;
    flex-direction: column;
  }

  .legend-search-container :deep(.ant-select) {
    width: 100% !important;
    min-width: unset !important;
  }

  .clear-filter-btn {
    width: 100%;
  }

  .responsive-padding {
    padding: 0 12px;
  }

  .page-title h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .ranks-controls {
    padding: 16px;
  }

  .ranks-toggle-section {
    flex-direction: column;
    gap: 12px;
  }

  .ranks-filter-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .download-btn {
    margin-left: 0;
    width: 100%;
  }

  .rankings-header,
  .rankings-row {
    grid-template-columns: 45px 1fr 70px 45px 85px;
    padding: 8px 4px;
    font-size: 14px;
  }

  .player-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .position-tag {
    font-size: 8px;
    padding: 1px 3px;
  }

  .pos-rank {
    display: none;
  }
}

@media (max-width: 480px) {
  .rankings-header,
  .rankings-row {
    grid-template-columns: 42px 1fr 55px 38px 75px;
    font-size: 12px;
  }

  .player-name {
    font-size: 14px;
  }

  .cell-rank {
    padding: 0 2px;
    font-size: 12px;
    min-width: 0;
  }

  .cell {
    padding: 0 2px;
  }
}
</style>

<style>
/* Global light theme overrides to ensure proper text colors */
html.light .layout {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

html.light .ranks-controls {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

html.light .rankings-table {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

html.light .rankings-header {
  background: rgba(248, 250, 252, 0.8) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

html.light .rankings-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

html.light .rankings-row:hover {
  background: rgba(59, 130, 246, 0.05) !important;
}

/* Global dark theme overrides for rankings table */
html.dark .layout {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
}

html.dark .ranks-controls {
  background: rgba(34, 34, 34, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

html.dark .rankings-table {
  background: rgba(34, 34, 34, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
}

html.dark .rankings-header {
  background: rgba(31, 41, 55, 0.8) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

html.dark .rankings-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

html.dark .rankings-row:hover {
  background: rgba(59, 130, 246, 0.15) !important;
}

</style>
