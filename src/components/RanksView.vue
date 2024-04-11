<template>
  <a-layout class="layout">
    <AppHeader />
    <a-breadcrumb style="padding-top: 10px">
      <a-breadcrumb-item
        ><a href="/username"><home-outlined /></a
      ></a-breadcrumb-item>
      <a-breadcrumb-item>Ranks</a-breadcrumb-item>
    </a-breadcrumb>
    <a-layout-content class="responsive-padding" :style="{ marginTop: '64px' }">
      <div
        style="
          padding-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div class="switch-container">
          <div title="Settings">
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
        </div>

        <div>
          <a-flex :gap="10">
            <a-dropdown-button :loading="isLoading">
              <img style="padding-right: 5px" class="rank-logos" :src="selectedSource.logo" />
              {{ selectedSource.name }}
              <template #overlay>
                <a-menu @click="handleMenuClick">
                  <a-menu-item v-for="source in filteredSources" :key="source.key">
                    <UserOutlined />
                    <img style="padding-right: 5px" class="rank-logos" :src="source.logo" />{{
                      source.name
                    }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown-button>
            <a-button @click="downloadData"><DownloadOutlined /></a-button>
          </a-flex>
        </div>
      </div>
      <a-spin :spinning="isLoading">
        <div class="card-list">
          <a-row :gutter="{ xs: 2, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="16">
              <div class="gutter-box-playername">RANK</div>
            </a-col>
            <a-col class="gutter-row" :span="2">
              <div class="gutter-box"></div>
            </a-col>
            <a-col class="gutter-row" :span="2">
              <div class="gutter-box">AGE</div>
            </a-col>
            <a-col class="gutter-row" :span="4">
              <div class="gutter-box">VALUE</div>
            </a-col>
          </a-row>

          <div v-for="(asset, index) in paginatedData" :key="asset._rownum">
            <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }" class="ranks-row">
              <a-col class="gutter-row" :span="16">
                <div class="gutter-box-playername">
                  <a-avatar shape="square" class="avatar">{{
                    (currentPage - 1) * perPage + index + 1
                  }}</a-avatar>

                  <div class="player-name">{{ asset.player_full_name }}</div>
                  <a-tag class="position-tag" :style="getPositionTag(asset._position)"
                    >{{ asset._position }} {{ asset.pos_ranked }}</a-tag
                  >
                </div>
              </a-col>
              <a-col class="gutter-row" :span="2">
                <div v-if="asset.team" class="gutter-box">{{ asset.team }}</div>
                <div v-else class="gutter-box">N/A</div>
              </a-col>
              <a-col class="gutter-row" :span="2">
                <div v-if="asset.age" class="gutter-box">{{ asset.age }}</div>
                <div v-else class="gutter-box">N/A</div>
              </a-col>
              <a-col class="gutter-row" :span="4">
                <div class="gutter-box-value">{{ asset.player_value.toLocaleString() }}</div>
              </a-col>
            </a-row>
          </div>
        </div>
        <a-pagination
          :current="currentPage"
          :total="filteredData.length"
          :pageSize="perPage"
          @change="handlePageChange"
        ></a-pagination>
      </a-spin>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

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
const perPage = ref(100)

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
    const rankTypeCondition = state.checked2
      ? item.rank_type === 'dynasty'
      : item.rank_type === 'redraft'
    const rosterTypeCondition = state.checked1
      ? item.roster_type === 'sf_value'
      : item.roster_type === 'one_qb_value'
    return rankTypeCondition && rosterTypeCondition
  })

  // Group by _position
  const grouped = filtered.reduce((acc, item) => {
    acc[item._position] = acc[item._position] || []
    acc[item._position].push(item)
    return acc
  }, {})

  // Sort each group in descending order and assign pos_ranked
  Object.keys(grouped).forEach((position) => {
    grouped[position].sort((a, b) => b.player_value - a.player_value) // Sort in descending order
    grouped[position].forEach((item, index) => {
      item.pos_ranked = index + 1 // Rank within the position
    })
  })

  // Flatten the grouped object back into an array
  return Object.values(grouped)
    .flat()
    .sort((a, b) => b.player_value - a.player_value)
})

const handleMenuClick: MenuProps['onClick'] = (e) => {
  console.log(e.key)
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
    console.log(ranksData.value)
  } catch (error) {
    console.log('There was an error pulling values...')
  } finally {
    isLoading.value = false
  }
}

function downloadData() {
  const dataToDownload = filteredData.value // Assuming this is your table's data source
  let csvContent = 'data:text/csv;charset=utf-8,'

  // Add the header row
  const headers = playerColumns.map((col) => col.title).join(',')
  csvContent += headers + '\r\n'

  // Add the data rows
  dataToDownload.forEach((row) => {
    const rowData = playerColumns.map((col) => `"${row[col.dataIndex]}"`).join(',')
    csvContent += rowData + '\r\n'
  })

  // Create a link and trigger the download
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')

  // Use the selected source name for the file name
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

// Method to handle page change
function handlePageChange(page) {
  currentPage.value = page
}
</script>
<style scoped>
.rank-logos {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
}

/* This is the base style, for mobile screens */
.responsive-padding {
  padding: 0 16px; /* Small padding for small screens */
}

/* Media query for screens wider than 768px */
@media (min-width: 768px) {
  .responsive-padding {
    padding: 0 300px; /* Larger padding for larger screens */
  }
}
.switch-container > div[title='Settings'] {
  display: flex;
  justify-content: start; /* Align items to the start of the container */
  align-items: center; /* Align items vertically in the center */
  gap: 10px; /* Adds space between the switches */
}

.setting-item {
  display: flex; /* This makes sure the content of each setting item aligns correctly */
  align-items: center; /* Aligns the switch vertically in the middle */
}
.card-list {
  display: flex;
  flex-direction: column;
  padding: 1em;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 5px;
}

.avatar {
  background-color: rgb(87, 117, 144);
}

.player-name {
  margin-right: 5px; /* Space between name and tag */
}

.gutter-box {
  padding: 12px 0;
  text-align: center;
  align-items: center;
  gap: 0.5rem;
  align-items: center;
  gap: 0.5rem;
}
.gutter-box-value {
  padding: 12px 0;
  text-align: center;
  font-weight: bold;
  align-items: center;
  gap: 0.5rem;
  align-items: center;
  gap: 0.5rem;
}
.gutter-box-playername {
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ranks-row {
  border: 1px solid lightgray;
  border-radius: 8px;
  margin-bottom: 5px;
}
</style>
