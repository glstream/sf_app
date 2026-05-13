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
        <div class="controls-top">
          <div class="ranks-toggle-section">
            <div class="toggle-pill" :class="{ active: state.checked1 }" @click="state.checked1 = !state.checked1">
              <span class="toggle-label">{{ state.checked1 ? 'Superflex' : 'OneQB' }}</span>
            </div>
            <div class="toggle-pill" :class="{ active: state.checked2 }" @click="state.checked2 = !state.checked2">
              <span class="toggle-label">{{ state.checked2 ? 'Dynasty' : 'Redraft' }}</span>
            </div>
            <div class="toggle-pill toggle-rookie" :class="{ active: checkState.showRookiesOnly }" @click="checkState.showRookiesOnly = !checkState.showRookiesOnly">
              <span class="toggle-label">{{ checkState.showRookiesOnly ? 'Rookies Only' : 'All Players' }}</span>
            </div>
          </div>

          <div class="position-chips">
            <button
              class="pos-chip pos-chip-all"
              :class="{ active: checkState.checkAll }"
              @click="onCheckAllChange({ target: { checked: !checkState.checkAll } })"
            >ALL</button>
            <button
              v-for="pos in plainOptions"
              :key="pos"
              class="pos-chip"
              :class="[`pos-chip-${pos.toLowerCase()}`, { active: checkState.checkedList.includes(pos) }]"
              @click="togglePosition(pos)"
            >{{ pos }}</button>
          </div>
        </div>

        <div class="controls-bottom">
          <div class="search-area">
            <a-auto-complete
              v-model:value="playerSearchInput"
              :options="searchOptions"
              :allow-clear="true"
              placeholder="Search players..."
              @select="selectPlayer"
              @search="searchPlayers"
              @keydown.enter="selectPlayerByEnter"
              class="player-search"
            >
              <template #prefix>
                <SearchOutlined style="color: rgba(0, 0, 0, 0.25)" />
              </template>
            </a-auto-complete>
            <a-button
              v-if="selectedPlayerFilter"
              @click="clearPlayerFilter"
              type="default"
              class="clear-filter-btn"
            >Clear</a-button>
          </div>
          <a-button type="default" @click="downloadData" class="download-btn">
            <DownloadOutlined /> Export
          </a-button>
        </div>
      </div>

      <!-- Tier Legend -->
      <div class="tier-bar">
        <button
          v-for="tier in tierConfig"
          :key="tier.key"
          class="tier-chip"
          :class="{ active: tierFilters.includes(tier.key) }"
          :style="tierFilters.includes(tier.key) ? { '--chip-color': tier.color } : {}"
          @click="toggleTierFilter(tier.key)"
        >
          <span class="tier-dot" :style="{ background: tier.color }"></span>
          {{ tier.label }}
        </button>
      </div>

      <!-- Rankings table -->
      <a-spin :spinning="isLoading">
        <div class="rankings-table">
          <div class="rankings-header">
            <div class="cell cell-rank">#</div>
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
                <div class="position-tag" :class="`pos-${asset._position?.toLowerCase()}`">
                  {{ asset._position }}<span class="pos-rank">{{ asset.pos_ranked }}</span>
                </div>
                <span class="player-name">{{ asset.player_full_name }}</span>
              </div>
            </div>
            <div class="cell cell-team">{{ asset.team || '—' }}</div>
            <div class="cell cell-age">{{ asset.age || '—' }}</div>
            <div class="cell cell-value">
              <span class="value-number">{{ asset.player_value.toLocaleString() }}</span>
            </div>
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

const tierConfig = [
  { key: 'tier-elite', label: 'Elite', color: '#277DA1' },
  { key: 'tier-1', label: 'Tier 1', color: '#43AA8B' },
  { key: 'tier-2', label: 'Tier 2', color: '#90BE6D' },
  { key: 'tier-3', label: 'Tier 3', color: '#F9C74F' },
  { key: 'tier-4', label: 'Tier 4', color: '#F9844A' },
  { key: 'tier-depth', label: 'Depth', color: '#9CA3AF' },
]

const plainOptions = ['QB', 'RB', 'WR', 'TE']

const checkState = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: ['QB', 'RB', 'WR', 'TE'],
  showRookiesOnly: false
})

function togglePosition(pos) {
  const idx = checkState.checkedList.indexOf(pos)
  if (idx > -1) {
    checkState.checkedList.splice(idx, 1)
  } else {
    checkState.checkedList.push(pos)
  }
}

const onCheckAllChange = (e) => {
  Object.assign(checkState, {
    checkedList: e.target.checked ? [...plainOptions] : [],
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

  const matchingPlayers = ranksData.value.filter((item) =>
    item.player_full_name.toLowerCase().includes(searchText.toLowerCase())
  )

  const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'
  matchingPlayers.sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0))

  const uniquePlayerMap = new Map()

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

function selectPlayerByEnter() {
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

  return Object.values(grouped)
    .flat()
    .sort((a, b) => b.player_value - a.player_value)
    .map((player, index) => ({
      ...player,
      _rownum: index + 1
    }))
})

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
  background: var(--color-background);
}

.responsive-padding {
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Page Title ── */
.page-title {
  text-align: center;
  margin: 40px 0 32px;
}

.page-title h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--color-primary);
  letter-spacing: -0.03em;
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.5;
  max-width: 540px;
  margin: 0 auto;
}

/* ── Controls Panel ── */
.ranks-controls {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.controls-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.controls-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* ── Toggle Pills ── */
.ranks-toggle-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toggle-pill {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
  user-select: none;
}

.toggle-pill:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.toggle-pill.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.toggle-pill.toggle-rookie.active {
  background: #F9844A;
  border-color: #F9844A;
}

/* ── Position Chips ── */
.position-chips {
  display: flex;
  gap: 6px;
}

.pos-chip {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  border: 1.5px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.pos-chip:hover { opacity: 0.85; }

.pos-chip.active.pos-chip-all {
  background: var(--color-text);
  border-color: var(--color-text);
  color: var(--color-background);
}

.pos-chip.active.pos-chip-qb {
  background: rgba(39, 125, 161, 0.12);
  border-color: #277DA1;
  color: #277DA1;
}

.pos-chip.active.pos-chip-rb {
  background: rgba(144, 190, 109, 0.12);
  border-color: #90BE6D;
  color: #6a9a47;
}

.pos-chip.active.pos-chip-wr {
  background: rgba(67, 170, 139, 0.12);
  border-color: #43AA8B;
  color: #35886e;
}

.pos-chip.active.pos-chip-te {
  background: rgba(249, 132, 74, 0.12);
  border-color: #F9844A;
  color: #d8642e;
}

/* ── Search ── */
.search-area {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  max-width: 400px;
  position: relative;
  z-index: 100;
}

.player-search {
  flex: 1;
}

.player-search :deep(.ant-select-selector) {
  border-radius: 6px !important;
  border-width: 1.5px !important;
  height: 36px !important;
}

.player-search :deep(.ant-input) {
  height: 32px !important;
  font-size: 13px !important;
}

.clear-filter-btn {
  border-radius: 6px;
  height: 36px;
  font-size: 13px;
  font-weight: 600;
}

.download-btn {
  border-radius: 6px;
  height: 36px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* ── Tier Bar ── */
.tier-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tier-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.tier-chip:hover {
  border-color: var(--chip-color, var(--color-border-hover));
}

.tier-chip.active {
  border-color: var(--chip-color);
  color: var(--chip-color);
  background: color-mix(in srgb, var(--chip-color) 8%, var(--color-background));
}

.tier-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ── Rankings Table ── */
.rankings-table {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-background);
}

.rankings-header {
  display: grid;
  grid-template-columns: 56px 1fr 100px 64px 120px;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
}

.rankings-row {
  display: grid;
  grid-template-columns: 56px 1fr 100px 64px 120px;
  padding: 0 16px;
  height: 52px;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.12s ease;
  position: relative;
}

.rankings-row:last-child {
  border-bottom: none;
}

.rankings-row:hover {
  background: color-mix(in srgb, var(--color-primary) 5%, var(--color-background));
}

/* ── Tier Heat Strips ── */
.rankings-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.tier-elite::before { background: #277DA1; }
.tier-1::before { background: #43AA8B; }
.tier-2::before { background: #90BE6D; }
.tier-3::before { background: #F9C74F; }
.tier-4::before { background: #F9844A; }
.tier-depth::before { background: #9CA3AF; }

/* ── Cells ── */
.cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: var(--color-text);
}

.cell-rank {
  font-weight: 700;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
}

.cell-team {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.cell-age {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.cell-value {
  text-align: right;
  padding-right: 4px;
}

.value-number {
  font-weight: 700;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
}

/* ── Player Cell ── */
.player-container {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.player-name {
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.position-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  border: 1px solid transparent;
}

.pos-qb {
  color: #277DA1;
  background: rgba(39, 125, 161, 0.1);
  border-color: rgba(39, 125, 161, 0.25);
}

.pos-rb {
  color: #6a9a47;
  background: rgba(144, 190, 109, 0.1);
  border-color: rgba(144, 190, 109, 0.25);
}

.pos-wr {
  color: #35886e;
  background: rgba(67, 170, 139, 0.1);
  border-color: rgba(67, 170, 139, 0.25);
}

.pos-te {
  color: #d8642e;
  background: rgba(249, 132, 74, 0.1);
  border-color: rgba(249, 132, 74, 0.25);
}

.pos-pick, .pos-picks {
  color: #6B7280;
  background: rgba(107, 114, 128, 0.1);
  border-color: rgba(107, 114, 128, 0.25);
}

.pos-rank {
  margin-left: 3px;
  opacity: 0.7;
}

/* ── Pagination ── */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 28px 0;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .responsive-padding {
    padding: 0 12px;
  }

  .page-title {
    margin: 24px 0 20px;
  }

  .page-title h1 {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }

  .ranks-controls {
    padding: 14px;
    gap: 12px;
  }

  .controls-top {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .ranks-toggle-section {
    justify-content: center;
  }

  .position-chips {
    justify-content: center;
  }

  .controls-bottom {
    flex-direction: column;
    gap: 10px;
  }

  .search-area {
    max-width: none;
    width: 100%;
  }

  .download-btn {
    width: 100%;
  }

  .tier-bar {
    justify-content: center;
  }

  .rankings-header,
  .rankings-row {
    grid-template-columns: 40px 1fr 56px 40px 72px;
    padding: 0 8px;
    height: 48px;
    font-size: 13px;
  }

  .rankings-header {
    padding: 10px 8px;
    height: auto;
    font-size: 10px;
  }

  .player-name {
    font-size: 13px;
  }

  .position-tag {
    font-size: 8px;
    padding: 1px 4px;
  }

  .pos-rank {
    display: none;
  }

  .value-number {
    font-size: 13px;
  }

  .cell-rank {
    font-size: 12px;
  }

  .cell-team, .cell-age {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .rankings-header,
  .rankings-row {
    grid-template-columns: 36px 1fr 48px 36px 64px;
    font-size: 12px;
  }

  .toggle-pill {
    padding: 5px 12px;
    font-size: 12px;
  }

  .pos-chip {
    padding: 5px 10px;
    font-size: 11px;
  }

  .player-name {
    font-size: 12px;
  }

  .value-number {
    font-size: 12px;
  }
}
</style>

<style>
/* ── Autocomplete Dropdown ── */
.ant-select-dropdown {
  border-radius: 8px !important;
}

.ant-select-item-option {
  padding: 10px 14px !important;
  font-size: 13px !important;
}

.ant-select-item-option-selected {
  background: rgba(39, 125, 161, 0.1) !important;
}

.ant-select-item-option:hover {
  background: rgba(39, 125, 161, 0.06) !important;
}
</style>
