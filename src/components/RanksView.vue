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
import { ref, reactive, onMounted, computed, watchEffect, watch, nextTick } from 'vue'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import PlayerHistoryModal from '@/components/PlayerHistoryModal.vue'

// 3rd Party imports
import axios from 'axios'
import { message } from 'ant-design-vue'
import { DownloadOutlined, UserOutlined } from '@ant-design/icons-vue'
import 'ant-design-vue/dist/reset.css'


const ranksData = ref([])
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

function getTierLabel(value) {
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
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
}


.rankings-header {
  display: grid;
  grid-template-columns: 80px 130px 3fr 160px 130px 180px;
  padding: 18px 20px;
  font-weight: 600;
  color: var(--color-text);
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}


.rankings-row {
  display: grid;
  grid-template-columns: 80px 130px 3fr 160px 130px 180px;
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

/* The remaining styles may need similar updates */


/* Tier System - Subtle Design */
.tier-indicator {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  min-width: 45px;
  letter-spacing: 0.3px;
  border: 1px solid;
}

/* Elite Tier - Blue */
.tier-elite .tier-indicator {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.3);
}

.tier-elite {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.03), transparent);
  border-left: 3px solid #3b82f6;
}

/* Tier 1 - Darker Green */
.tier-1 .tier-indicator {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.3);
}

.tier-1 {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.03), transparent);
  border-left: 3px solid #22c55e;
}

/* Tier 2 - Green */
.tier-2 .tier-indicator {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.3);
}

.tier-2 {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.03), transparent);
  border-left: 3px solid #10b981;
}

/* Tier 3 - Yellow */
.tier-3 .tier-indicator {
  background: rgba(234, 179, 8, 0.1);
  color: #a16207;
  border-color: rgba(234, 179, 8, 0.3);
}

.tier-3 {
  background: linear-gradient(90deg, rgba(234, 179, 8, 0.03), transparent);
  border-left: 3px solid #eab308;
}

/* Tier 4 - Orange */
.tier-4 .tier-indicator {
  background: rgba(249, 115, 22, 0.1);
  color: #ea580c;
  border-color: rgba(249, 115, 22, 0.3);
}

.tier-4 {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), transparent);
  border-left: 3px solid #f97316;
}

/* Depth Tier - Orangish */
.tier-depth .tier-indicator {
  background: rgba(251, 146, 60, 0.1);
  color: #c2410c;
  border-color: rgba(251, 146, 60, 0.3);
}

.tier-depth {
  background: linear-gradient(90deg, rgba(251, 146, 60, 0.03), transparent);
  border-left: 3px solid #fb923c;
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
    grid-template-columns: 45px 65px 1fr 70px 45px 85px;
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

  .tier-indicator {
    font-size: 10px;
    padding: 2px 6px;
    min-width: 40px;
  }
}

@media (max-width: 480px) {
  .rankings-header,
  .rankings-row {
    grid-template-columns: 42px 55px 1fr 55px 38px 75px;
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
