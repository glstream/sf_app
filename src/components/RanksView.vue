<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <a-layout-content class="responsive-padding" :style="{ marginTop: '48px' }">
      <!-- Controls section -->
      <div class="ranks-controls">
        <div class="ranks-source-selector">
          <a-dropdown-button :loading="isLoading">
            <img class="rank-logos" :src="selectedSource.logo" alt="Source logo" />
            {{ selectedSource.name }}
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item v-for="source in filteredSources" :key="source.key">
                  <img class="rank-logos" :src="source.logo" />
                  {{ source.name }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown-button>
        </div>

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
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watchEffect, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Party imports
import axios from 'axios'
import { message, Spin, Column, Empty, MenuProps } from 'ant-design-vue'
import { HomeOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import 'ant-design-vue/dist/reset.css'

// Source image imports
import fnLogo from '@/assets/sourceLogos/fn.png'
import ktcLogo from '@/assets/sourceLogos/ktc.png'
import dpLogo from '@/assets/sourceLogos/dp.png'
import fcLogo from '@/assets/sourceLogos/fc.png'

const platform = ref('sf')
const ranksData = ref([{}])
const isLoading = ref(false)
const rankType = ref('dynasty')
const currentPage = ref(1)
const perPage = ref(75)

const plainOptions = ['QB', 'RB', 'WR', 'TE', 'PICK']

const checkState = reactive({
  indeterminate: true,
  checkAll: false,
  checkedList: ['QB', 'RB', 'WR', 'TE', 'PICK']
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

const sources = [
  { key: 'sf', name: 'FantasyNavigator', logo: fnLogo },
  { key: 'ktc', name: 'KeepTradeCut', logo: ktcLogo },
  { key: 'dp', name: 'DynastyProcess', logo: dpLogo },
  { key: 'fc', name: 'FantasyCalc', logo: fcLogo }
]

const selectedSource = ref(sources[0])

const filteredSources = computed(() => {
  if (rankType.value !== 'dynasty') {
    return sources.filter(
      (source) => source.key === 'fc' || source.key === 'ktc' || source.key === 'sf'
    )
  }
  return sources
})

const state = reactive({
  checked1: true,
  checked2: true
})

onMounted(() => {
  fetchRanks(platform.value)
})

watchEffect(() => {
  rankType.value = state.checked2 ? 'dynasty' : 'redraft'
})

const filteredData = computed(() => {
  const filtered = ranksData.value.filter((item) => {
    // Maintain existing conditions based on rank type and roster type
    const rankTypeCondition = state.checked2
      ? item.rank_type === 'dynasty'
      : item.rank_type === 'redraft'
    const rosterTypeCondition = state.checked1
      ? item.roster_type === 'sf_value'
      : item.roster_type === 'one_qb_value'

    // New condition for QB visibility based on checkedList
    const positionCondition = checkState.checkedList.includes(item._position)

    return rankTypeCondition && rosterTypeCondition && positionCondition
  })

  // Group and sort logic remains unchanged
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

const handleMenuClick: MenuProps['onClick'] = (e) => {
  const platform = e.key
  try {
    fetchRanks(platform)
    selectedSource.value = sources.find((source) => source.key === platform) || sources[0]
  } catch {
    console.log('error loading leagues')
  } finally {
    console.log('league ranks pull complete')
  }
}
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

// Tier logic: adjusted with your preferred thresholds
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

async function fetchRanks(platform: string) {
  isLoading.value = true
  const apiUrl = import.meta.env.VITE_API_URL
  try {
    const response = await axios.get(`${apiUrl}/ranks`, {
      params: {
        platform
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
  // Ensuring data to download is actually the paginated data
  const dataToDownload = filteredData.value // Now correctly points to paginated data

  let csvContent = 'data:text/csv;charset=utf-8,'

  // Assuming each data entry is an object, we take headers from the first entry if available
  if (dataToDownload.length > 0) {
    const headers = Object.keys(dataToDownload[0]).join(',') // Adjust this if you have specific headers
    csvContent += headers + '\r\n'

    // Add the data rows
    dataToDownload.forEach((row) => {
      const rowData = Object.values(row)
        .map((field) => `"${field}"`)
        .join(',')
      csvContent += rowData + '\r\n'
    })
  }

  // Create a link and trigger the download
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')

  // Assuming selectedSource.value.name is defined and provides a meaningful name
  const fileName = `${selectedSource.value.name.replace(/\s+/g, '_')}_ranks_data.csv`

  link.setAttribute('href', encodedUri)
  link.setAttribute('download', fileName)
  document.body.appendChild(link) // Required for FF
  link.click()
  document.body.removeChild(link)
}

// Computed property to get the current page's data
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredData.value.slice(start, end)
})

const checkedFilteredData = computed(() => {
  return ranksData.value.filter((rank) => checkState.checkedList.includes(rank.position))
})

// Method to handle page change
function handlePageChange(page) {
  currentPage.value = page
}
</script>

<style scoped>
/* General layout */
.responsive-padding {
  padding: 0 16px;
  max-width: 100%; /* Allow table to fill more screen space */
  margin: 0; /* Align to left instead of center */
}

.rank-logos {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
  margin-right: 5px;
}

/* Controls styling */
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

.ranks-source-selector {
  display: flex;
  justify-content: flex-end;
}

.ranks-toggle-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.ranks-filter-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.download-btn {
  margin-left: auto;
}

.setting-item {
  display: flex;
  align-items: center;
}

/* Table styling */
.rankings-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eaeaea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  background: white;
  max-width: 100%; /* Allow table to expand on desktop */
}

.rankings-header {
  display: grid;
  grid-template-columns: 50px 80px minmax(250px, 2fr) 100px 80px 120px; /* Wider columns for desktop */
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
  grid-template-columns: 50px 80px minmax(250px, 2fr) 100px 80px 120px; /* Match header columns */
  padding: 10px 8px;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.rankings-row:last-child {
  border-bottom: none;
}

.rankings-row:hover {
  background-color: #f9fafb;
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

/* Player cell styling */
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

/* Tier styling */
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

/* Responsive adjustments */
@media (min-width: 1400px) {
  .responsive-padding {
    padding: 0 32px;
    max-width: 90%; /* Cap width on very large screens */
  }
}

@media (min-width: 768px) and (max-width: 1399px) {
  .responsive-padding {
    padding: 0 24px;
  }
}

@media (max-width: 767px) {
  .rankings-header,
  .rankings-row {
    grid-template-columns: 40px 70px minmax(150px, 1fr) 70px 50px 80px;
    font-size: 0.9rem;
    padding: 8px 4px;
  }

  .cell {
    padding: 0 4px;
  }

  .player-container {
    gap: 8px;
  }

  .position-tag {
    padding: 2px 6px;
    font-size: 0.75rem;
  }

  .tier-indicator {
    font-size: 0.75rem;
    padding: 2px 4px;
    max-width: 50px;
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
}
</style>
