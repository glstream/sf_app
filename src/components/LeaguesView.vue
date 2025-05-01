<template>
  <a-layout class="layout">
    <AppHeader />
    <theme-toggle-button />

    <a-layout-content class="responsive-padding" :style="{ marginTop: '12px' }">
      <a-breadcrumb style="padding-top: 10px">
        <a-breadcrumb-item
          ><a href="/"><home-outlined /></a
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
        <a-breadcrumb-item>{{ leagueInfo.userName }}</a-breadcrumb-item>
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
        <div v-if="!isLoading && filteredData.length === 0">
          <div class="no-leagues-card">No complete leagues found for this year...</div>
        </div>
        <div>
          <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
            <div
              class="leagues-container max-width-container"
              v-for="league in filteredData"
              :key="league.league_id"
            >
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
              <a-row justify="space-between" :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                <a-col class="gutter-row" :span="12">
                  <div class="gutter-box">
                    <a-tag> {{ league.roster_type }}</a-tag>
                    <a-tag
                      style="margin-left: 10px"
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
                  </div>
                </a-col>
                <a-col :span="8">
                  <div class="gutter-box-refresh">
                    <a-tooltip>
                      <template #title>League Details</template>
                      <a-dropdown-button size="default" type="primary">
                        Power Ranks
                        <template #overlay>
                          <a-menu @click="(e) => handleMenuClick(e, league)">
                            <a-menu-item v-for="source in sources" :key="source.key">
                              <UserOutlined />
                              <img
                                style="padding-right: 5px"
                                class="rank-logos"
                                :src="source.logo"
                              />{{ source.name }}
                            </a-menu-item>
                            <a-menu-divider />
                            <a-menu-item key="summary"> <FileSearchOutlined /> Summary</a-menu-item>
                          </a-menu>
                        </template>
                        <template #icon><DownOutlined /></template>
                      </a-dropdown-button>
                    </a-tooltip>
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
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-top-header" style="font-weight: bold">
                      Rankings
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">Power</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">Starters</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">Bench</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">Picks</div></a-col
                  >
                </a-row>
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header">FantasyNavigator</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.sf_power_rank)">{{
                        addOrdinalSuffix(league.sf_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.sf_starters_rank))">{{
                        addOrdinalSuffix(league.sf_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.sf_bench_rank))">{{
                        addOrdinalSuffix(league.sf_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.sf_picks_rank))">{{
                        addOrdinalSuffix(league.sf_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header">KeepTradeCut</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.ktc_power_rank)">{{
                        addOrdinalSuffix(league.ktc_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.ktc_starters_rank))">{{
                        addOrdinalSuffix(league.ktc_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.ktc_bench_rank))">{{
                        addOrdinalSuffix(league.ktc_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.ktc_picks_rank))">{{
                        addOrdinalSuffix(league.ktc_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header">DynastyProcess</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.dp_power_rank)">{{
                        addOrdinalSuffix(league.dp_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dp_starters_rank))">{{
                        addOrdinalSuffix(league.dp_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dp_bench_rank))">{{
                        addOrdinalSuffix(league.dp_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dp_picks_rank))">{{
                        addOrdinalSuffix(league.dp_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header">FantasyCalc</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.fc_power_rank)">{{
                        addOrdinalSuffix(league.fc_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.fc_starters_rank))">{{
                        addOrdinalSuffix(league.fc_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.fc_bench_rank))">{{
                        addOrdinalSuffix(league.fc_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.fc_picks_rank))">{{
                        addOrdinalSuffix(league.fc_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
                <a-row :gutter="{ xs: 2, sm: 8, md: 24, lg: 32 }">
                  <a-col class="gutter-row" :span="8">
                    <div class="gutter-box-stats-header">DynastyDaddy</div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(league.dd_power_rank)">{{
                        addOrdinalSuffix(league.dd_power_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dd_starters_rank))">{{
                        addOrdinalSuffix(league.dd_starters_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dd_bench_rank))">{{
                        addOrdinalSuffix(league.dd_bench_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                  <a-col class="gutter-row" :span="4">
                    <div class="gutter-box-stats">
                      <a-tag :style="getCellStyle(Number(league.dd_picks_rank))">{{
                        addOrdinalSuffix(league.dd_picks_rank)
                      }}</a-tag>
                    </div></a-col
                  >
                </a-row>
              </div>
            </div>
          </a-row>
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
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Party imports
import {
  HomeOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import type { SelectProps, MenuProps } from 'ant-design-vue'

import 'primeicons/primeicons.css'

import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'
import { getCellStyle } from '../utils/dynamicColorTable'

// Source image imports
import defaultimage from '@/assets/logo4.png'
import fnLogo from '@/assets/sourceLogos/fn.png'
import ktcLogo from '@/assets/sourceLogos/ktc.png'
import dpLogo from '@/assets/sourceLogos/dp.png'
import fcLogo from '@/assets/sourceLogos/fc.png'
import ddLogo from '@/assets/sourceLogos/dd.svg'

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

const sources = [
  { key: 'sf', name: 'FantasyNavigator', logo: fnLogo },
  { key: 'ktc', name: 'KeepTradeCut', logo: ktcLogo },
  { key: 'dp', name: 'DynastyProcess', logo: dpLogo },
  { key: 'fc', name: 'FantasyCalc', logo: fcLogo },
  { key: 'dd', name: 'DynastyDaddy', logo: ddLogo }
]

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
  } catch (error) {
    console.error('There was an error fetching the leagues data:', error)
  } finally {
    isLoading.value = false
  }
}

const handleMenuClick = (e, league) => {
  console.log('e', e)
  console.log('league', league)
  if (e.key === 'summary') {
    getLeagueSummary(league)
  } else {
    getLeagueDetail(e, league)
  }
}

const getLeagueDetail: MenuProps['onClick'] = (e, league) => {
  try {
    const leagueId = league.league_id
    const guid = league.session_id
    const leagueYear = league.league_year
    const userName = encodeURIComponent(league.user_name)
    const leagueName = encodeURIComponent(league.league_name)
    const userId = league.user_id
    const avatar = league.avatar
    const rankType = league.league_type
    const rosterType = league.roster_type
    const platform = e.key
    const starterCnt = league.starter_cnt
    const totalRosters = league.total_rosters
    console.log('e', e)
    router.push(
      `/league/${leagueId}/${platform}/${rankType}/${guid}/${leagueYear}/${userName}/${leagueName}/${rosterType}/${userId}/${avatar}/${starterCnt}/${totalRosters}`
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
const getLeagueSummary = async (record) => {
  const leagueId = record.league_id
  const guid = record.session_id
  const leagueYear = record.league_year
  const userName = encodeURIComponent(record.user_name)
  const leagueName = encodeURIComponent(record.league_name)
  const rosterType = record.roster_type
  const userId = record.user_id
  const avatar = record.avatar
  const rankType = record.league_type

  const url = `/leaguesummary/${userName}/${userId}/${leagueId}/${leagueName}/${leagueYear}/${record.starter_cnt}/${record.total_rosters}/${record.league_type}/${guid}/${rosterType}/${avatar}/${rankType}`

  router.push(url)
}

const getPrevYear = async () => {
  router.push(`/`)
}

const getCurrentYear = async () => {
  isLoading.value = true
  const leagueYear = leagueInfo.leagueYear
  try {
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
  background-color: #f5f7fa;
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
  object-fit: cover; /* Ensures the logo fits well */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

@media (max-width: 440px) {
  .responsive-padding {
    padding: 0 12px; /* Slightly more padding */
  }
}

@media (min-width: 440px) {
  .responsive-padding {
    padding: 0 100px;
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
  border: 1px solid rgb(39, 125, 161);
  border-radius: 8px; /* Slightly rounder corners */
  margin-top: 15px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.8); /* Semi-transparent background */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); /* Default subtle shadow */
  overflow: hidden; /* Ensures the rounded corners apply to children */
}

.leagues-container:hover {
  border-color: #43aa8b;
  transform: translateY(-2px); /* Slight lift effect */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* Enhanced shadow on hover */
}

.leagues-stats-container {
  border-radius: 5px;
  margin: 5px 5px 10px; /* Added bottom margin */
  background-color: rgba(249, 249, 250, 0.7); /* Very subtle background */
  padding: 5px;
}

.gutter-box {
  padding: 8px 5px;
}

.gutter-box-panel {
  padding: 8px 5px;
  padding-right: 45px;
}

.gutter-box-header {
  padding: 12px 10px; /* More padding */
  background: linear-gradient(to right, rgba(39, 125, 161, 0.1), transparent); /* Subtle gradient */
  border-bottom: 1px solid rgba(39, 125, 161, 0.2); /* Subtle bottom border */
  display: flex;
  align-items: center;
}

.gutter-box-detail {
  padding: 8px 5px;
  display: flex;
  justify-content: center;
}

.standard-tag {
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 2px 8px;
  background-color: #f5f5f5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.gutter-box-stats {
  padding: 3px 2px; /* Slightly more padding */
  display: flex;
  justify-content: center;
}

.gutter-box-stats-header {
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 500; /* Medium weight */
  color: #555; /* Darker text for headers */
}

.gutter-box-stats-top {
  padding: 1px 10px;
  font-size: 1em;
  display: flex;
  justify-content: center;
}

.gutter-box-stats-top-header {
  padding: 8px 10px; /* More top/bottom padding */
  font-size: 1.05em;
  font-weight: 600;
  color: #333;
  display: flex;
  justify-content: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1); /* Subtle separator */
  margin-bottom: 5px;
}

.rank-logos {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
  margin-right: 3px; /* Small spacing after logo */
}

.max-width-container {
  max-width: 400px; /* Slightly wider for better spacing */
  width: 100%;
  margin: 15px 10px; /* More top/bottom margin */
}

.no-leagues-card {
  padding: 30px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 25px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-size: 1.1em;
  color: #666;
}

.gutter-box-refresh {
  display: flex;
  justify-content: right;
  margin-right: 5px;
  align-items: baseline;
}

/* New styles for better appearance */
a-tag {
  margin-bottom: 3px; /* Spacing between tags when they wrap */
  transition: all 0.2s ease;
}

a-tag:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.a-breadcrumb {
  margin-bottom: 15px; /* Add space after breadcrumb */
}

/* Animation for league container appearance */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.leagues-container {
  animation: fadeIn 0.4s ease-out;
}
</style>
