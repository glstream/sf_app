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

      <a-table
        :columns="playerColumns"
        :data-source="filteredData"
        :loading="isLoading"
        :expand-column-width="100"
        :pagination="{ pageSize: 75 }"
        :scroll="{ x: '850px' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'pos_rank'">
            <span>
              <a-tag :style="getPositionTag(record._position)">{{ record.pos_rank }}</a-tag>
            </span>
          </template>
        </template>
      </a-table>
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

const platform = ref('fn')
const ranksData = ref([{}])
const isLoading = ref(false)
const rankType = ref('dynasty')

const sources = [
  { key: 'fn', name: 'FantasyNavigator', logo: fnLogo },
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

interface Column {
  title: string
  dataIndex: string
  key: string
  width: number
}

type TableDataType = {
  key: number
  player_rank: number
  _position: string
  player_full_name: string
  pos_rank: string
  team: string
  age: number
  player_value: number
}

const playerColumns: Column[] = [
  {
    title: 'Rank',
    dataIndex: 'player_rank',
    key: 'player_rank',
    width: 50,
    sorter: {
      compare: (a, b) => a.rank - b.rank,
      multiple: 1
    }
  },
  {
    title: 'Position',
    dataIndex: '_position',
    key: '_position',
    width: 50,
    filters: [
      {
        text: 'QB',
        value: 'QB'
      },
      {
        text: 'RB',
        value: 'RB'
      },
      {
        text: 'WR',
        value: 'WR'
      },
      {
        text: 'TE',
        value: 'TE'
      },
      {
        text: 'Pick',
        value: 'Pick'
      }
    ],
    onFilter: (value: string, record: TableDataType) => record._position.indexOf(value) === 0
  },
  {
    title: 'Player',
    dataIndex: 'player_full_name',
    key: 'player_full_name',
    width: 250
  },
  {
    title: 'Pos Rank',
    dataIndex: 'pos_rank',
    key: 'pos_rank',
    width: 100
  },
  {
    title: 'Team',
    dataIndex: 'team',
    key: 'team',
    width: 100
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 100,
    sorter: {
      compare: (a, b) => a.age - b.age,
      multiple: 1
    }
  },
  {
    title: 'Value',
    dataIndex: 'player_value',
    key: 'player_value',
    width: 100,
    sorter: {
      compare: (a, b) => a.player_value - b.player_value,
      multiple: 1
    }
  }
]

onMounted(() => {
  fetchRanks(platform.value)
})

watchEffect(() => {
  rankType.value = state.checked2 ? 'dynasty' : 'redraft'
})

const filteredData = computed(() => {
  return ranksData.value.filter((item) => {
    const rankTypeCondition = state.checked2
      ? item.rank_type === 'dynasty'
      : item.rank_type === 'redraft'
    const rosterTypeCondition = state.checked1
      ? item.roster_type === 'sf_value'
      : item.roster_type === 'one_qb_value'
    return rankTypeCondition && rosterTypeCondition
  })
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
</style>
