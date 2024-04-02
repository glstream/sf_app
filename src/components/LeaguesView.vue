<template>
  <a-layout class="layout">
    <AppHeader />

    <a-layout-content style="padding: 0 100px">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item><a href="/userName">Home</a></a-breadcrumb-item>
        <a-breadcrumb-item>Leagues</a-breadcrumb-item>
      </a-breadcrumb>

      <div class="table-section" style="flex: 2">
        <a-table
          :columns="columns"
          :data-source="data"
          :loading="isLoading"
          :expand-column-width="100"
        >
          <template v-slot:[`actionSlot`]="{ record }">
            <a-space>
              <a-button type="primary" @click="getLeagueDetail(record)">Details</a-button>
              <a-button type="primary" @click="getLeagueSummary(record)">Sumary</a-button>
            </a-space>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'league_type'">
              <span>
                <a-tag
                  :color="
                    record.league_type === 'Dynasty'
                      ? 'cyan'
                      : record.league_type === 'Redraft'
                        ? 'green'
                        : 'red'
                  "
                  >{{ record.league_type }}</a-tag
                >
              </span>
            </template>
          </template>
          <template v-slot:avatarRender="{ record }">
            <div>
              <img
                class="league-logo"
                :src="`https://sleepercdn.com/avatars/thumbs/${record.avatar}`"
                style="width: 30px; height: 30px; margin-right: 10px; vertical-align: middle"
              />
              {{ record.league_name }}
            </div></template
          >
        </a-table>
      </div>
    </a-layout-content>

    <AppFooter />
  </a-layout>
</template>
<script lang="ts" setup>
// Vue Imports
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// 3rd Party imports
import axios from 'axios'

// Custom Utils imports

type TableDataType = {
  key: number
  league_name: string
  league_type: string
  total_rosters: number
  roster_type: string
  starter_cnt: number
}

const columns = [
  {
    title: 'League',
    dataIndex: 'league_name',
    key: 'league_name',
    slots: { customRender: 'avatarRender' }
  },
  {
    title: 'Type',
    dataIndex: 'league_type',
    key: 'league_type',
    width: 150,
    filters: [
      {
        text: 'Redraft',
        value: 'Redraft'
      },
      {
        text: 'Keeper',
        value: 'Keeper'
      },
      {
        text: 'Dynasty',
        value: 'Dynasty'
      }
    ],
    onFilter: (value: string, record: TableDataType) => record.league_type.indexOf(value) === 0,
    sorter: (a: TableDataType, b: TableDataType) => a.league_type.length - b.league_type.length,
    sortDirections: ['descend']
  },
  {
    title: 'Size',
    dataIndex: 'total_rosters',
    key: 'total_rosters',
    width: 100,
    sorter: {
      compare: (a, b) => a.total_rosters - b.total_rosters,
      multiple: 1
    }
  },
  {
    title: 'Roster',
    dataIndex: 'roster_type',
    key: 'roster_type',
    width: 150,
    filters: [
      {
        text: 'SingleQB',
        value: 'SingleQB'
      },
      {
        text: 'Superflex',
        value: 'Superflex'
      }
    ],
    onFilter: (value: string, record: TableDataType) => record.roster_type.indexOf(value) === 0,
    sorter: (a: TableDataType, b: TableDataType) => a.roster_type.length - b.roster_type.length,
    sortDirections: ['descend']
  },
  {
    title: 'Starters',
    dataIndex: 'starter_cnt',
    key: 'starter_cnt',
    align: 'center',
    width: 100,
    sorter: {
      compare: (a, b) => a.starter_cnt - b.starter_cnt,
      multiple: 2
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    width: 150,
    slots: { customRender: 'actionSlot' }
  }
]

// configs
const activeKey = ref([])
// Assuming 'data' is the property used as the data source for your table
const data = ref([])
const route = useRoute()
const isLoading = ref(false)
const router = useRouter() // Use the useRouter composable to get access to the router instance

const userName = route.params.userName as string
const leagueYear = route.params.leagueYear
const guid = route.params.guid as string
const leagueName = route.params.leagueName as string

const leagueInfo = reactive({
  userName: userName,
  leagueYear: leagueYear,
  guid: guid as string
})

onMounted(() => {
  const userName = route.params.userName as string
  const leagueYear = route.params.leagueYear as string
  const guid = route.params.guid as string
  if (leagueYear && userName && guid) {
    fetchData(leagueYear, userName, guid)
  }
})

async function fetchData(leagueYear: string, userName: string, guid: string) {
  isLoading.value = true
  try {
    const response = await axios.get('http://20.242.213.253:3100/leagues', {
      params: {
        league_year: leagueYear,
        user_name: userName,
        guid: guid
      }
    })
    data.value = response.data // Assuming the server response format matches your table data format
    console.log(data.value)
  } catch (error) {
    console.error('There was an error fetching the leagues data:', error)
  } finally {
    isLoading.value = false
  }
}
const getLeagueDetail = async (record) => {
  try {
    const leagueId = record.league_id
    const guid = record.session_id
    const leagueYear = record.league_year
    const userName = record.user_name
    const leagueName = record.league_name
    const userId = record.user_id
    const avatar = record.avatar
    const rankType = record.league_type
    const rosterType = record.roster_type

    // Determine the path segment based on rankType
    const platform = rankType !== 'Dynasty' ? 'ktc' : 'sf'

    router.push(
      `/league/${leagueId}/${platform}/${rankType}/${guid}/${leagueYear}/${userName}/${leagueName}/${rosterType}/${userId}/${avatar}/`
    )

    console.log('Sending to League details')
  } catch (error) {
    console.error('Failed to load league details:', error)
    // Optionally, update leagueDetails to indicate an error or show an error message
  } finally {
    console.log('complete')
  }
}

// Function to handle click event
const getLeagueSummary = (record) => {
  const leagueId = record.league_id
  const guid = record.session_id
  const leagueYear = record.league_year
  const userName = record.user_name
  const leagueName = record.league_name
  const rosterType = record.roster_type
  const userId = record.user_id
  const avatar = record.avatar
  const rankType = record.league_type

  const url = `/leaguesummary/${userName}/${userId}/${leagueId}/${leagueName}/${rosterType}/${leagueYear}/${record.starter_cnt}/${record.total_rosters}/${record.league_type}/${guid}/${rosterType}/${avatar}/${rankType}`

  router.push(url)
}
</script>
<style>
/* Additional styles for layout */
.layout {
  min-height: 100vh;
  min-width: 1000px;
}
.table-section {
  display: flex;
  justify-content: left;
}
.league-logo {
  width: 38px;
  height: 38px;
  border-radius: 7px;
  border: 1px solid gray;
}
</style>
