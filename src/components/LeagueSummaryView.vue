<template>
  <a-layout class="layout">
    <AppHeader />
    <a-layout-content class="responsive-padding" :style="{ marginTop: '64px' }">
      <a-breadcrumb style="padding-top: 10px">
        <a-breadcrumb-item
          ><a href="/username"><home-outlined /></a
        ></a-breadcrumb-item>
        <a-breadcrumb-item><a :href="leaguesUrl">Leagues</a></a-breadcrumb-item>
        <a-breadcrumb-item>{{ leagueInfo.leagueName }}</a-breadcrumb-item>
      </a-breadcrumb>
      <a-row>
        <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="14" style="text-align: right">
          <div style="margin-bottom: 25px" bordered>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px">
              <img
                class="league-logo"
                :src="`https://sleepercdn.com/avatars/thumbs/${leagueInfo.avatar}`"
                @error="(event) => (event.target.src = defaultimage)"
              />

              <span>{{ leagueInfo.leagueName }}</span
              >&bull;<span>{{ leagueInfo.userName }}</span>
            </div>
            <div style="text-align: left">
              <a-tag>{{ leagueInfo.leagueYear }}</a-tag>
              <a-tag>{{ leagueInfo.leagueType }}</a-tag>
              <a-tag>{{ leagueInfo.leagueSize }} Team</a-tag>
              <a-tag>{{ leagueInfo.rosterType }}</a-tag>
              <a-tag>{{ leagueInfo.leagueStarters }} Starters</a-tag>
            </div>
          </div>

          <div style="max-width: 100px; margin-bottom: 10px">
            <a-flex :gap="10" hotizontal>
              <a-button size="small" type="primary" @click="getLeagueDetail()"
                >League Details</a-button
              >
              <a-button
                size="small"
                type="default"
                @click="insertLeagueDetails(leagueInfo.leagueId)"
                :loading="isLoading"
                >Load League</a-button
              >
            </a-flex>
          </div>

          <a-card style="margin-bottom: 25px" title="Power Rankings" bordered>
            <a-tabs
              v-model:activeKey="activeKey"
              @change="fetchTabData"
              tab-position="top"
              :style="{ height: '300px' }"
              class="custom-tabs"
            >
              <a-tab-pane key="1" tab="Keep Trade Cut" data-metadata="ktc">
                <div class="scrollable-content">
                  <a-spin :spinning="isLoading">
                    <div class="tags-container" v-if="positionalRanks.length > 0">
                      <div
                        class="tag-group"
                        v-for="rankInfo in positionalRanks"
                        :key="rankInfo.position"
                      >
                        <a-tooltip :title="addOrdinalSuffix(rankInfo.rank)" placement="top">
                          <a-tag
                            :color="rankInfo.color"
                            :title="rankInfo.rank"
                            class="custom-position-tag"
                            >{{ rankInfo.position }}</a-tag
                          >
                        </a-tooltip>
                        <div class="tag-badges">
                          <a-tag
                            v-for="n in rankInfo.greenTags"
                            :key="`${rankInfo.position}-green-${n}`"
                            :class="getColorByRank(rankInfo.rank)"
                            >&nbsp;</a-tag
                          >
                          <a-tag
                            v-for="n in rankInfo.greyTags"
                            :key="`${rankInfo.position}-grey-${n}`"
                            class="grey-tag"
                            >&nbsp;</a-tag
                          ><a-tag class="summary-badge">{{
                            addOrdinalSuffix(rankInfo.rank)
                          }}</a-tag>
                        </div>
                      </div>
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                  </a-spin>
                </div>
              </a-tab-pane>

              <a-tab-pane key="2" tab="FantasyNavigator" data-metadata="sf">
                <a-spin :spinning="isLoading">
                  <div class="scrollable-content">
                    <div class="tags-container" v-if="positionalRanks.length > 0">
                      <div
                        class="tag-group"
                        v-for="rankInfo in positionalRanks"
                        :key="rankInfo.position"
                      >
                        <a-tooltip :title="addOrdinalSuffix(rankInfo.rank)" placement="top">
                          <a-tag
                            :color="rankInfo.color"
                            :title="rankInfo.rank"
                            class="custom-position-tag"
                            >{{ rankInfo.position }}</a-tag
                          >
                        </a-tooltip>
                        <div class="tag-badges">
                          <a-tag
                            v-for="n in rankInfo.greenTags"
                            :key="`${rankInfo.position}-green-${n}`"
                            :class="getColorByRank(rankInfo.rank)"
                            >&nbsp;</a-tag
                          >
                          <a-tag
                            v-for="n in rankInfo.greyTags"
                            :key="`${rankInfo.position}-grey-${n}`"
                            class="grey-tag"
                            >&nbsp;</a-tag
                          ><a-tag class="summary-badge">{{
                            addOrdinalSuffix(rankInfo.rank)
                          }}</a-tag>
                        </div>
                      </div>
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div></div></a-spin
              ></a-tab-pane>
              <a-tab-pane key="3" tab="FantasyCalc">
                <a-spin :spinning="isLoading">
                  <div class="scrollable-content">
                    <div class="tags-container" v-if="positionalRanks.length > 0">
                      <div
                        class="tag-group"
                        v-for="rankInfo in positionalRanks"
                        :key="rankInfo.position"
                      >
                        <a-tooltip :title="addOrdinalSuffix(rankInfo.rank)" placement="top">
                          <a-tag
                            :color="rankInfo.color"
                            :title="rankInfo.rank"
                            class="custom-position-tag"
                            >{{ rankInfo.position }}</a-tag
                          >
                        </a-tooltip>
                        <div class="tag-badges">
                          <a-tag
                            v-for="n in rankInfo.greenTags"
                            :key="`${rankInfo.position}-green-${n}`"
                            :class="getColorByRank(rankInfo.rank)"
                            >&nbsp;</a-tag
                          >
                          <a-tag
                            v-for="n in rankInfo.greyTags"
                            :key="`${rankInfo.position}-grey-${n}`"
                            class="grey-tag"
                            >&nbsp;</a-tag
                          ><a-tag class="summary-badge">{{
                            addOrdinalSuffix(rankInfo.rank)
                          }}</a-tag>
                        </div>
                      </div>
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                  </div> </a-spin
              ></a-tab-pane>
              <a-tab-pane key="4" tab="DynastyProcess">
                <a-spin :spinning="isLoading">
                  <div class="scrollable-content">
                    <div class="tags-container" v-if="positionalRanks.length > 0">
                      <div
                        class="tag-group"
                        v-for="rankInfo in positionalRanks"
                        :key="rankInfo.position"
                      >
                        <a-tooltip :title="addOrdinalSuffix(rankInfo.rank)" placement="top">
                          <a-tag
                            :color="rankInfo.color"
                            :title="rankInfo.rank"
                            class="custom-position-tag"
                            >{{ rankInfo.position }}</a-tag
                          >
                        </a-tooltip>
                        <div class="tag-badges">
                          <a-tag
                            v-for="n in rankInfo.greenTags"
                            :key="`${rankInfo.position}-green-${n}`"
                            :class="getColorByRank(rankInfo.rank)"
                            >&nbsp;</a-tag
                          >
                          <a-tag
                            v-for="n in rankInfo.greyTags"
                            :key="`${rankInfo.position}-grey-${n}`"
                            class="grey-tag"
                            >&nbsp;</a-tag
                          ><a-tag class="summary-badge">{{
                            addOrdinalSuffix(rankInfo.rank)
                          }}</a-tag>
                        </div>
                      </div>
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                  </div> </a-spin
              ></a-tab-pane>
              <a-tab-pane key="5" tab="DynastyDaddy">
                <a-spin :spinning="isLoading">
                  <div class="scrollable-content">
                    <div class="tags-container" v-if="positionalRanks.length > 0">
                      <div
                        class="tag-group"
                        v-for="rankInfo in positionalRanks"
                        :key="rankInfo.position"
                      >
                        <a-tooltip :title="addOrdinalSuffix(rankInfo.rank)" placement="top">
                          <a-tag
                            :color="rankInfo.color"
                            :title="rankInfo.rank"
                            class="custom-position-tag"
                            >{{ rankInfo.position }}</a-tag
                          >
                        </a-tooltip>
                        <div class="tag-badges">
                          <a-tag
                            v-for="n in rankInfo.greenTags"
                            :key="`${rankInfo.position}-green-${n}`"
                            :class="getColorByRank(rankInfo.rank)"
                            >&nbsp;</a-tag
                          >
                          <a-tag
                            v-for="n in rankInfo.greyTags"
                            :key="`${rankInfo.position}-grey-${n}`"
                            class="grey-tag"
                            >&nbsp;</a-tag
                          ><a-tag class="summary-badge">{{
                            addOrdinalSuffix(rankInfo.rank)
                          }}</a-tag>
                        </div>
                      </div>
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                  </div> </a-spin
              ></a-tab-pane>
            </a-tabs>
          </a-card>
          <a-card title="Projections" bordered>
            <a-tabs
              v-model:conActiveKey="conActiveKey"
              @change="contenderFetchTabData"
              tab-position="top"
              :style="{ height: '250px' }"
              class="custom-tabs"
            >
              <a-tab-pane key="5" tab="ESPN" force-render>
                <a-spin :spinning="contenderIsLoading">
                  <div class="scrollable-content">
                    <div class="tags-container" v-if="contenderPositionalRanks.length > 0">
                      <div
                        class="tag-group"
                        v-for="conRankInfo in contenderPositionalRanks"
                        :key="conRankInfo.conPosition"
                      >
                        <a-tooltip :title="addOrdinalSuffix(conRankInfo.conRank)" placement="top">
                          <a-tag
                            :color="conRankInfo.conColor"
                            :title="conRankInfo.conRank"
                            class="custom-position-tag"
                            >{{ conRankInfo.conPosition }}</a-tag
                          >
                        </a-tooltip>
                        <div class="tag-badges">
                          <!-- Render green tags if any -->
                          <a-tag
                            v-for="n in conRankInfo.conGreenTags"
                            :key="`${conRankInfo.conPosition}-green-${n}`"
                            :class="getColorByRank(conRankInfo.conRank)"
                            >&nbsp;</a-tag
                          >
                          <!-- Then render grey tags -->
                          <a-tag
                            v-for="n in conRankInfo.conGreyTags"
                            :key="`${conRankInfo.conPosition}-grey-${n}`"
                            class="grey-tag"
                            >&nbsp;</a-tag
                          ><a-tag class="summary-badge">{{
                            addOrdinalSuffix(conRankInfo.conRank)
                          }}</a-tag>
                        </div>
                      </div>
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                  </div> </a-spin
              ></a-tab-pane>
              <a-tab-pane key="6" tab="NFL" force-render>
                <a-spin :spinning="contenderIsLoading">
                  <div class="scrollable-content">
                    <div class="tags-container" v-if="contenderPositionalRanks.length > 0">
                      <div
                        class="tag-group"
                        v-for="conRankInfo in contenderPositionalRanks"
                        :key="conRankInfo.conPosition"
                      >
                        <a-tooltip :title="addOrdinalSuffix(conRankInfo.conRank)" placement="top">
                          <a-tag
                            :color="conRankInfo.conColor"
                            :title="conRankInfo.conRank"
                            class="custom-position-tag"
                            >{{ conRankInfo.conPosition }}</a-tag
                          >
                        </a-tooltip>
                        <div class="tag-badges">
                          <a-tag
                            v-for="n in conRankInfo.conGreenTags"
                            :key="`${conRankInfo.conPosition}-green-${n}`"
                            :class="getColorByRank(conRankInfo.conRank)"
                            >&nbsp;</a-tag
                          >
                          <a-tag
                            v-for="n in conRankInfo.conGreyTags"
                            :key="`${conRankInfo.conPosition}-grey-${n}`"
                            class="grey-tag"
                            >&nbsp;</a-tag
                          ><a-tag class="summary-badge">{{
                            addOrdinalSuffix(conRankInfo.conRank)
                          }}</a-tag>
                        </div>
                      </div>
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                  </div> </a-spin
              ></a-tab-pane>
              <a-tab-pane key="8" tab="CBS" force-render>
                <a-spin :spinning="contenderIsLoading">
                  <div class="scrollable-content">
                    <div class="tags-container" v-if="contenderPositionalRanks.length > 0">
                      <div
                        class="tag-group"
                        v-for="conrankInfo in contenderPositionalRanks"
                        :key="conrankInfo.conPosition"
                      >
                        <a-tooltip :title="addOrdinalSuffix(conrankInfo.conRank)" placement="top">
                          <a-tag
                            :color="conrankInfo.conColor"
                            :title="conrankInfo.conRank"
                            class="custom-position-tag"
                            >{{ conrankInfo.conPosition }}</a-tag
                          >
                        </a-tooltip>
                        <div class="tag-badges">
                          <a-tag
                            v-for="n in conrankInfo.conGreenTags"
                            :key="`${conrankInfo.conPosition}-green-${n}`"
                            :class="getColorByRank(conrankInfo.conRank)"
                            >&nbsp;</a-tag
                          >

                          <a-tag
                            v-for="n in conrankInfo.conGreyTags"
                            :key="`${conrankInfo.conPosition}-grey-${n}`"
                            class="grey-tag"
                            >&nbsp;</a-tag
                          ><a-tag class="summary-badge">{{
                            addOrdinalSuffix(conrankInfo.conRank)
                          }}</a-tag>
                        </div>
                      </div>
                    </div>
                    <div v-else style="text-align: center">
                      <a-empty />
                    </div>
                  </div> </a-spin
              ></a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
// Vue imports
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// 3rd Party imports
import axios from 'axios'

// Platform Utils
import type { TabsProps, message, Spin } from 'ant-design-vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import defaultimage from '@/assets/logo4.png'

// Custom Utils
import { addOrdinalSuffix } from '../utils/suffix'

const route = useRoute()
const router = useRouter()

const apiUrl = import.meta.env.VITE_API_URL

const conActiveKey = ref('5')
const activeKey = ref('1')
const isLoading = ref(false)
const contenderIsLoading = ref(false)
const data = ref({})
const conData = ref({})

const leagueName = route.params.leagueName
const leagueId = route.params.leagueId
const userId = route.params.userId
const userName = route.params.userName
// const leagueSetting = route.params.leagueSetting
const leagueType = route.params.leagueType
const leagueYear = route.params.leagueYear
const leagueStarters = route.params.leagueStarters
const leagueSize = route.params.leagueSize
const guid = route.params.guid
const rosterType = route.params.rosterType
const avatar = route.params.avatar
const rankType = route.params.rankType
const leaguesUrl = `/leagues/${leagueYear}/${userName}/${guid}`

const tabsMetadata = {
  '1': { id: '1', source: 'ktc', type: 'power' },
  '2': { id: '2', source: 'sf', type: 'power' },
  '3': { id: '3', source: 'fc', type: 'power' },
  '4': { id: '4', source: 'dp', type: 'power' },
  '5': { id: '5', source: 'dd', type: 'power' },
  '6': { id: '6', source: 'espn', type: 'contender' },
  '7': { id: '7', source: 'nfl', type: 'contender' },
  '8': { id: '8', source: 'fc', type: 'contender' },
  '9': { id: '9', source: 'cbs', type: 'contender' }
}

onMounted(() => {
  const platform = 'ktc'
  const contenderPlatform = 'espn'
  const contenderRankType = 'contender'
  const leagueId = route.params.leagueId as string
  const avatar = route.params.avatar as string
  const guid = route.params.guid as string
  const rosterType = route.params.rosterType as string
  const rankType = route.params.rankType as string

  if (leagueId && platform && rankType && guid) {
    fetchLeagueData(leagueId, platform, rankType, guid, rosterType)
    contenderFetchLeagueData(leagueId, contenderPlatform, contenderRankType, guid, rosterType)
  }
})

// league information
const leagueInfo = reactive({
  leagueName: leagueName,
  leagueId: leagueId as string,
  leagueSize: leagueSize as string,
  userId: userId,
  userName: userName,
  // leagueSetting: leagueSetting,
  leagueType: leagueType,
  leagueYear: leagueYear,
  leagueStarters: leagueStarters,
  guid: guid as string,
  rosterType: rosterType,
  rankType: rankType as string,
  avatar: avatar as string
})

const callback: TabsProps['onTabScroll'] = (val) => {
  console.log(val)
}

const insertLeagueDetails = async (values: any) => {
  isLoading.value = true
  contenderIsLoading.value = true
  console.log('trying insert rosters')
  console.log(leagueId)
  console.log(userId)
  console.log(guid)
  console.log(leagueYear)
  try {
    const response = await axios.post(`${apiUrl}/roster`, {
      league_id: leagueId,
      user_id: userId,
      guid: guid,
      league_year: leagueYear
    })

    console.log('League details fetched successfully')
  } catch (error) {
    console.error('Failed to load league details:', error)
  } finally {
    isLoading.value = false // Update loading state
    contenderIsLoading.value = false
    const platform = 'ktc'
    const contenderPlatform = 'espn'
    const rankType = 'power'
    const contenderRankType = 'contender'
    const leagueId = route.params.leagueId as string
    const guid = route.params.guid as string
    const rosterType = route.params.rosterType as string

    fetchLeagueData(leagueId, platform, rankType, guid, rosterType)
    contenderFetchLeagueData(leagueId, contenderPlatform, contenderRankType, guid, rosterType)
  }
}

const getLeagueDetail = async (values: any) => {
  try {
    console.log('attempt get league')

    router.push(
      `/league/${leagueId}/sf/${rankType}/${guid}/${leagueYear}/${userName}/${leagueName}/${rosterType}/${userId}/${avatar}/${leagueStarters}/${leagueSize}`
    )
  } catch (error) {
    console.error('Failed to load league details:', error)
  } finally {
    console.log('complete')
  }
}

const fetchTabData = async (tabKey) => {
  isLoading.value = true
  const tabData = tabsMetadata[tabKey]
  if (tabData) {
    console.log('Fetching data for:', tabData.source)

    try {
      const response = await axios.get(`${apiUrl}/league_summary`, {
        params: {
          league_id: leagueInfo.leagueId,
          platform: tabData.source,
          rank_type: tabData.type,
          guid: guid,
          roster_type: leagueInfo.rosterType
        }
      })
      console.log('calling ', tabData.source)
      const filteredData = response.data.filter((record) => record.user_id === leagueInfo.userId)
      data.value = filteredData.length > 0 ? filteredData[0] : {}
    } catch (error) {
      console.error('Failed to load league details:', error)
    } finally {
      isLoading.value = false
    }
  }
}

const contenderFetchTabData = async (tabKey) => {
  contenderIsLoading.value = true
  const tabData = tabsMetadata[tabKey]
  if (tabData) {
    console.log('Contender Fetching data for:', tabData.source)

    try {
      const response = await axios.get(`${apiUrl}/league_summary`, {
        params: {
          league_id: leagueInfo.leagueId,
          platform: tabData.source,
          rank_type: tabData.type,
          guid: guid,
          roster_type: leagueInfo.rosterType
        }
      })
      console.log('contender calling ', tabData.source)
      const contenderFilteredData = response.data.filter(
        (record) => record.user_id === leagueInfo.userId
      )
      conData.value = contenderFilteredData.length > 0 ? contenderFilteredData[0] : {}
    } catch (error) {
      console.error('Failed to load league details:', error)
    } finally {
      contenderIsLoading.value = false // Update loading state
    }
  }
}

const getPositionalRanks = (data, leagueInfo) => {
  return computed(() => {
    isLoading.value = true
    if (!data.value || Object.keys(data.value).length === 0 || !leagueInfo.leagueSize) {
      isLoading.value = false
      return []
    }

    const leagueSize = parseInt(leagueInfo.leagueSize, 10)

    const positionColors = {
      QB: '#277DA1',
      RB: '#90BE6D',
      WR: '#43AA8B',
      TE: '#F9844A'
    }

    const ranks = ['total', 'starters', 'qb', 'rb', 'wr', 'te', 'flex', 'bench', 'picks'].map(
      (position) => {
        const rankKey = `${position}_rank`
        const rank = data.value[rankKey]

        let greenTags = 0
        let greyTags = leagueSize

        if (rank <= leagueSize) {
          greenTags = leagueSize - rank
          greyTags = rank - 1
        }

        const formattedPosition =
          position.length <= 2
            ? position.toUpperCase()
            : position[0].toUpperCase() + position.slice(1)
        const color = positionColors[formattedPosition.toUpperCase()] || '#108ee9'

        return {
          position: formattedPosition,
          greyTags: Math.round(greyTags * 1.5),
          greenTags: Math.round(greenTags * 1.5),
          color: color,
          rank: rank
        }
      }
    )

    isLoading.value = false
    return ranks
  })
}

const positionalRanks = getPositionalRanks(data, leagueInfo)

const contenderGetPositionalRanks = (conData, leagueInfo) => {
  return computed(() => {
    contenderIsLoading.value = true
    if (!conData.value || Object.keys(conData.value).length === 0 || !leagueInfo.leagueSize) {
      contenderIsLoading.value = false
      return []
    }

    const leagueSize = parseInt(leagueInfo.leagueSize, 10)

    const positionColors = {
      QB: '#277DA1',
      RB: '#90BE6D',
      WR: '#43AA8B',
      TE: '#F9844A'
    }

    const ranks = ['total', 'starters', 'qb', 'rb', 'wr', 'te', 'flex', 'bench'].map((position) => {
      const rankKey = `${position}_rank`
      const rank = conData.value[rankKey]

      let greenTags = 0
      let greyTags = leagueSize

      if (rank <= leagueSize) {
        greenTags = leagueSize - rank
        greyTags = rank - 1
      }

      const formattedPosition =
        position.length <= 2
          ? position.toUpperCase()
          : position[0].toUpperCase() + position.slice(1)
      const color = positionColors[formattedPosition.toUpperCase()] || '#108ee9'

      return {
        conPosition: formattedPosition,
        conGreyTags: Math.round(greyTags * 1.5),
        conGreenTags: Math.round(greenTags * 1.5),
        conColor: color,
        conRank: rank
      }
    })

    contenderIsLoading.value = false
    return ranks
  })
}

// Usage
const contenderPositionalRanks = contenderGetPositionalRanks(conData, leagueInfo)

async function fetchLeagueData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string
) {
  isLoading.value = true
  console.log('starting league fetch')
  try {
    const response = await axios.get(`${apiUrl}/league_summary`, {
      params: {
        league_id: leagueId,
        platform: platform,
        rank_type: rankType,
        guid: guid,
        roster_type: rosterType
      }
    })
    const filteredData = response.data.filter((record) => record.user_id === leagueInfo.userId)
    data.value = filteredData.length > 0 ? filteredData[0] : {}

    console.log(data.value)
  } catch (error) {
    console.error('There was an error fetching the leagues data:', error)
  } finally {
    isLoading.value = false
  }
}
async function contenderFetchLeagueData(
  leagueId: string,
  platform: string,
  rankType: string,
  guid: string,
  rosterType: string
) {
  contenderIsLoading.value = true
  console.log('starting contender league fetch')
  try {
    const response = await axios.get(`${apiUrl}/league_summary`, {
      params: {
        league_id: leagueId,
        platform: platform,
        rank_type: rankType,
        guid: guid,
        roster_type: rosterType
      }
    })
    const filteredData = response.data.filter((record) => record.user_id === leagueInfo.userId)
    conData.value = filteredData.length > 0 ? filteredData[0] : {}

    console.log(conData.value)
  } catch (error) {
    console.error('There was an error fetching the leagues data:', error)
  } finally {
    isLoading.value = false
  }
}

function getColorByRank(rank) {
  if (rank >= 0 && rank <= 3) {
    return 'green-tag'
  } else if (rank >= 4 && rank <= 6) {
    return 'yellow-tag'
  } else if (rank >= 7 && rank <= 9) {
    return 'gray-tag'
  } else {
    return 'red-tag'
  }
}
</script>

<style>
.layout {
  min-height: 100vh;
}

.tags-vertical {
  flex-direction: column;
  gap: 8px;
}
.custom-position-tag {
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  margin-right: 8px;
  min-width: 75px;
  font-weight: bold;
}

.tag-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.grey-tag {
  background-color: #f0f0f0;
  border: 0.5px solid gray;
  margin-right: 2px;
  max-width: 5px;
}
.green-tag {
  background-color: #22de6a;
  border: 0.5px solid gray;
  margin-right: 2px;
  max-width: 5px;
}
.gray-tag {
  background-color: rgb(146, 152, 156);
  border: 0.5px solid gray;
  margin-right: 2px;
  max-width: 5px;
}
.yellow-tag {
  background-color: rgb(223, 234, 13);
  border: 0.5px solid gray;
  margin-right: 2px;
  max-width: 5px;
}
.red-tag {
  background-color: #e55050;
  border: 0.5px solid gray;
  margin-right: 2px;
  max-width: 5px;
}
.tag-group {
  display: flex;
  align-items: flex-start;
  margin-right: 16px;
}

.tag-hover:hover {
  background-color: #f0f0f0;
}
.summary-badge {
  margin-left: 15px;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  display: inline-flex;
}

@media (max-width: 390px) {
  .responsive-padding {
    padding: 0 10px;
  }
}

@media (min-width: 391px) {
  .responsive-padding {
    padding: 0 200px;
  }
}

.scrollable-content {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  display: flex;
  flex-wrap: nowrap;
}

.league-logo {
  width: 38px;
  height: 38px;
  border-radius: 7px;
  border: 1px solid gray;
}

:where(.css-dev-only-do-not-override-iwmiiu) .ant-card .ant-card-head-title {
  flex: none;
}
</style>
