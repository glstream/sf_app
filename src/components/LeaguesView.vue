<template>
  <a-layout class="layout">
    <AppHeader />

    <a-layout-content class="responsive-padding" :style="{ marginTop: '64px' }">
      <a-breadcrumb style="padding-top: 10px">
        <a-breadcrumb-item
          ><a href="/username"><home-outlined /></a
        ></a-breadcrumb-item>
        <a-breadcrumb-item>Leagues</a-breadcrumb-item>
        <a-breadcrumb-item>
          {{ leagueYear }}
          <template #overlay>
            <a-menu>
              <a-menu-item @click="getCurrentYear">
                <a>{{ leagueInfo.leagueYear }}</a>
              </a-menu-item>
              <a-menu-item @click="getPrevYear">
                <a>Change Year</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-breadcrumb-item>
      </a-breadcrumb>
      <div style="padding-top: 30px">
        <a-flex :gap="20">
          <a-select
            placeholder="Select League Type"
            :options="leagueOptions"
            style="width: 175px"
            @change="handleLeagueChange"
            v-model="selectedLeagueType"
            mode="multiple"
            :max-tag-count="3"
          >
          </a-select>
          <a-select
            placeholder="Select Roster Type"
            :options="rosterOptions"
            style="width: 175px"
            @change="handleRosterChange"
            v-model="selectedRosterType"
            mode="multiple"
            :max-tag-count="3"
          >
          </a-select>
        </a-flex>
      </div>
      <a-spin :spinning="isLoading">
        <div>
          <div class="leagues-container" v-for="league in filteredData" :key="league.league_id">
            <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
              <a-col class="gutter-row" :span="24">
                <div class="gutter-box-header">
                  <div>
                    <img
                      class="league-logo"
                      :src="`https://sleepercdn.com/avatars/thumbs/${league.avatar}`"
                      style="vertical-align: middle"
                      @error="(event) => (event.target.src = defaultimage)"
                    />
                    <span style="font-size: larger; padding-left: 5px">{{
                      league.league_name
                    }}</span>
                  </div>
                </div>
              </a-col>
            </a-row>
            <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
              <a-col class="gutter-row" :span="10">
                <div class="gutter-box-header">
                  <a-tag
                    :color="
                      league.league_type === 'Dynasty'
                        ? 'cyan'
                        : league.league_type === 'Redraft'
                          ? 'green'
                          : 'red'
                    "
                  >
                    {{ league.league_type }}</a-tag
                  >
                  <a-tag> {{ league.roster_type }}</a-tag>
                </div>
              </a-col>
              <a-col class="gutter-row" :span="14">
                <div class="gutter-box-search">
                  <a-flex :gap="8">
                    <a-tooltip>
                      <template #title>League Details</template>
                      <a-button size="default" type="primary" @click="getLeagueDetail(league)"
                        >Detail <BarChartOutlined
                      /></a-button>
                    </a-tooltip>
                    <a-tooltip>
                      <template #title>League Summary</template>
                      <a-button size="default" type="primary" @click="getLeagueSummary(league)"
                        >Summary<FileSearchOutlined
                      /></a-button>
                    </a-tooltip>
                  </a-flex>
                </div>
              </a-col>
            </a-row>
            <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
              <a-col class="gutter-row" :span="24">
                <div class="gutter-box">
                  <span style="padding-right: 5px">League Size</span>
                  <a-tag class="standard-tag">{{ league.total_rosters }}</a-tag>
                  <span style="padding-right: 5px">Starters</span>
                  <a-tag class="standard-tag">{{ league.starter_cnt }}</a-tag>
                  <span style="padding-right: 5px">Roster Size</span>
                  <a-tag class="standard-tag">{{ league.total_roster_cnt }}</a-tag>
                </div>
              </a-col>
            </a-row>
            <div class="leagues-stats-container">
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="12">
                  <div class="gutter-box-stats-top-header" style="font-weight: bold">
                    Rankings
                  </div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats-top" style="font-weight: bold">Power</div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats-top" style="font-weight: bold">Starters</div></a-col
                >
              </a-row>
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="12">
                  <div class="gutter-box-stats-header">FantasyNavigator</div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats">
                    <a-tag :style="getCellStyle(league.sf_power_rank)">{{
                      addOrdinalSuffix(league.sf_power_rank)
                    }}</a-tag>
                  </div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats">
                    <a-tag :style="getCellStyle(Number(league.sf_starters_rank))">{{
                      addOrdinalSuffix(league.sf_starters_rank)
                    }}</a-tag>
                  </div></a-col
                >
              </a-row>
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="12">
                  <div class="gutter-box-stats-header">KeepTradeCut</div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats">
                    <a-tag :style="getCellStyle(league.ktc_power_rank)">{{
                      addOrdinalSuffix(league.ktc_power_rank)
                    }}</a-tag>
                  </div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats">
                    <a-tag :style="getCellStyle(Number(league.ktc_starters_rank))">{{
                      addOrdinalSuffix(league.ktc_starters_rank)
                    }}</a-tag>
                  </div></a-col
                >
              </a-row>
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="12">
                  <div class="gutter-box-stats-header">DynastyProcess</div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats">
                    <a-tag :style="getCellStyle(league.dp_power_rank)">{{
                      addOrdinalSuffix(league.dp_power_rank)
                    }}</a-tag>
                  </div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats">
                    <a-tag :style="getCellStyle(Number(league.dp_starters_rank))">{{
                      addOrdinalSuffix(league.dp_starters_rank)
                    }}</a-tag>
                  </div></a-col
                >
              </a-row>
              <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="12">
                  <div class="gutter-box-stats-header">FantasyCalc</div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats">
                    <a-tag :style="getCellStyle(league.fc_power_rank)">{{
                      addOrdinalSuffix(league.fc_power_rank)
                    }}</a-tag>
                  </div></a-col
                >
                <a-col class="gutter-row" :span="6">
                  <div class="gutter-box-stats">
                    <a-tag :style="getCellStyle(Number(league.fc_starters_rank))">{{
                      addOrdinalSuffix(league.fc_starters_rank)
                    }}</a-tag>
                  </div></a-col
                >
              </a-row>
            </div>
          </div>
        </div>
      </a-spin>
    </a-layout-content>

    <AppFooter />
  </a-layout>
</template>
<script lang="ts" setup>
// Vue Imports
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// 3rd Party imports
import { HomeOutlined, FileSearchOutlined, BarChartOutlined } from '@ant-design/icons-vue'
import type { SelectProps } from 'ant-design-vue'

import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'
import { getCellStyle } from '../utils/dynamicColorTable'

// Custom Utils imports
import defaultimage from '@/assets/logo4.png'

// configs
const leaguesData = ref([])
const route = useRoute()
const isLoading = ref(false)
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL

const userName = route.params.userName as string
const leagueYear = route.params.leagueYear as string
const guid = route.params.guid as string
const leagueName = route.params.leagueName as string

const selectedLeagueType = ref('')
const selectedRosterType = ref('')

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

const filteredData = computed(() => {
  return leaguesData.value.filter((league) => {
    const matchesLeagueType =
      selectedLeagueType.value.length === 0 || selectedLeagueType.value.includes(league.league_type)
    const matchesRosterType =
      selectedRosterType.value.length === 0 || selectedRosterType.value.includes(league.roster_type)
    return matchesLeagueType && matchesRosterType
  })
})

const handleLeagueChange = (value: string) => {
  console.log(value)
  selectedLeagueType.value = value
}

const handleRosterChange = (value: string) => {
  selectedRosterType.value = value
}

const leagueOptions = ref<SelectProps['options']>([
  {
    value: 'Dynasty',
    label: 'Dynasty'
  },
  {
    value: 'Keeper',
    label: 'Keeper'
  },
  {
    value: 'Redraft',
    label: 'Redraft'
  }
])

const rosterOptions = ref<SelectProps['options']>([
  {
    value: 'Superflex',
    label: 'Superflex'
  },
  {
    value: 'Single QB',
    label: 'Single QB'
  }
])

async function fetchData(leagueYear: string, userName: string, guid: string) {
  isLoading.value = true
  try {
    const response = await axios.get(`${apiUrl}/leagues`, {
      params: {
        league_year: leagueYear,
        user_name: userName,
        guid: guid
      }
    })
    leaguesData.value = response.data // Assuming the server response format matches your table data format
    console.log(leaguesData.value)
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
      `/league/${leagueId}/${platform}/${rankType}/${guid}/${leagueYear}/${userName}/${leagueName}/${rosterType}/${userId}/${avatar}/${record.starter_cnt}/${record.total_rosters}`
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

  const url = `/leaguesummary/${userName}/${userId}/${leagueId}/${leagueName}/${leagueYear}/${record.starter_cnt}/${record.total_rosters}/${record.league_type}/${guid}/${rosterType}/${avatar}/${rankType}`

  router.push(url)
}

const getPrevYear = async () => {
  router.push(`/username/`)
}

const getCurrentYear = async () => {
  isLoading.value = true
  const leagueYear = leagueInfo.leagueYear
  console.log(leagueYear, userName, guid)
  try {
    console.log(`/leagues/${leagueYear}/${userName}/${guid}`)
    await axios.post(`${apiUrl}/user_details`, {
      league_year: `${leagueYear}`,
      user_name: `${userName}`,
      guid: `${guid}`
    })
  } catch (error) {
    console.error('Error performing the action:', error)
  } finally {
    fetchData(leagueYear, userName, guid)
  }
}
</script>
<style scoped>
/* Additional styles for layout */
.layout {
  min-height: 100vh;
}
.table-section {
  display: flex;
  justify-content: left;
}
.league-logo {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  border: 1px solid gray;
}

@media (max-width: 390px) {
  .responsive-padding {
    padding: 0 10px; /* Larger padding for larger screens */
  }
}

/* Media query for screens wider than 768px */
@media (min-width: 391px) {
  .responsive-padding {
    padding: 0 200px; /* Larger padding for larger screens */
  }
}
.gutter-box {
  padding: 8px 0;
}
.gutter-box-search {
  padding: 8px 0;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  display: flex;
}

.leagues-container {
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  margin-top: 15px;
}
.leagues-stats-container {
  border-radius: 5px;
  margin-top: 15px;
  margin: 5px 5px;
}
.gutter-box {
  padding: 8px 5px;
}

.gutter-box-panel {
  padding: 8px 5px;
  padding-right: 45px;
}
.gutter-box-header {
  padding: 8px 5px;
}
.gutter-box-detail {
  padding: 8px 5px;
  display: flex;
  justify-content: center;
}
.standard-tag {
  color: black;
  border: 1px solid gray;
}

.gutter-box-stats {
  padding: 1px 1px;
  display: flex;
  justify-content: center;
}
.gutter-box-stats-header {
  padding: 1px 10px;
}
.gutter-box-stats-top {
  padding: 1px 10px;
  font-size: 1em;
  display: flex;
  justify-content: center;
}
.gutter-box-stats-top-header {
  padding: 1px 10px;
  font-size: 1em;
  display: flex;
  justify-content: left;
}
</style>
