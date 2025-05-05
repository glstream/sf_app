<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <a-layout-content class="responsive-padding">
      <div class="page-title">
        <h1>Fantasy Football Trade Calculator</h1>
        <p class="subtitle">
          Evaluate dynasty and redraft trades with precision using our advanced fantasy football
          trade calculator
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
            <p>
              <strong>Value:</strong>
              {{
                selectedPlayer.player_value === -1
                  ? 'N/A'
                  : selectedPlayer.player_value?.toLocaleString()
              }}
            </p>
            <p><strong>Rank:</strong> {{ selectedPlayer._rownum }}</p>
            <p><strong>Pos Rank:</strong> {{ selectedPlayer.pos_ranked }}</p>
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
import { ref, reactive, onMounted, computed, watchEffect, watch } from 'vue'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Party imports
import axios from 'axios'
import { message, Spin, Column, Empty } from 'ant-design-vue'
import { HomeOutlined, DownloadOutlined, UserOutlined } from '@ant-design/icons-vue'
import 'ant-design-vue/dist/reset.css'

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

// Modal Functions
const showPlayerModal = (player) => {
  selectedPlayer.value = player
  isPlayerModalVisible.value = true
}

const handlePlayerModalOk = () => {
  isPlayerModalVisible.value = false
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: #f5f7fa;
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
  color: #2d3142;
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
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.ranks-toggle-section {
  display: flex;
  gap: 16px; /* Increased gap slightly */
  flex-wrap: wrap;
  align-items: center; /* Align items vertically */
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px; /* Add gap between label and switch */
}

.switch-label {
  font-weight: 500;
  color: #4b5563; /* Adjust color as needed */
}

.ranks-filter-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px; /* Adjusted gap */
}

.download-btn {
  margin-left: auto;
}

.rankings-table {
  width: 100%;
  border-radius: 12px; /* Keep radius if desired */
  overflow: hidden; /* Keep overflow */
  background: transparent; /* Make container transparent */
  max-width: 100%;
}

.rankings-header {
  display: grid;
  grid-template-columns: 50px 80px minmax(250px, 2fr) 100px 80px 120px;
  padding: 12px 8px;
  font-weight: 600;
  color: #1f2937;
  background: #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}

.rankings-row {
  display: grid;
  grid-template-columns: 50px 80px minmax(250px, 2fr) 100px 80px 120px;
  padding: 10px 8px;
  align-items: center;
  transition: background-color 0.2s;
  margin-bottom: 8px; /* Increased margin slightly for spacing */
  background: white; /* Keep row background white */
  border-radius: 6px; /* Slightly increased radius */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); /* Add shadow to rows */
  cursor: pointer; /* Add cursor pointer */
}

.rankings-row:last-child {
  margin-bottom: 0;
}

.cell {
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-rank {
  font-weight: 600;
  color: #4b5563;
  text-align: center;
}

.cell-value {
  font-weight: 700;
  color: #1e3a8a;
  text-align: right;
}

.cell-team {
  color: #4b5563;
  font-weight: 500;
}

.cell-age {
  text-align: center;
  color: #6b7280;
}

.player-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-name {
  font-weight: 600;
  color: #1f2937;
}

.position-tag {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.pos-rank {
  font-size: 0.75rem;
  opacity: 0.85;
}

.tier-indicator {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
  color: white;
  max-width: 60px;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 32px;
}

/* Styles for Player Modal */
.player-modal-content {
  padding: 10px;
}

.player-modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.player-image-placeholder {
  width: 60px;
  height: 60px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
}

.player-modal-info h2 {
  margin-bottom: 4px;
  font-size: 1.3em;
}

.player-modal-info p {
  margin: 0;
  color: #555;
}

.player-modal-details p {
  margin-bottom: 8px;
  font-size: 14px;
}

.player-modal-details strong {
  margin-right: 5px;
  color: #333;
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
    color: #1e3a8a;
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
  }
}
</style>
