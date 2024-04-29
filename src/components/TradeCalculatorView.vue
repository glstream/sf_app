<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <a-layout-content class="responsive-padding" :style="{ marginTop: '48px' }">
      <div class="trade-calculator" style="">
        <div>
          <a-row :gutter="{ xs: 10, sm: 12, md: 24, lg: 32 }">
            <a-col class="gutter-box-options-left" :xs="12" :sm="12" :md="12" :lg="12"
              ><a-radio-group v-model:value="rankType" button-style="solid" size="small">
                <a-radio-button value="dynasty">Dynasty</a-radio-button>
                <a-radio-button value="redraft">Redraft</a-radio-button>
              </a-radio-group></a-col
            >
            <a-col class="gutter-box-refresh" :xs="12" :sm="12" :md="12" :lg="12"
              ><a-dropdown-button>
                Share
                <template #overlay>
                  <a-menu @click="handleShareClick">
                    <a-menu-item v-for="source in shareTradeSources" :key="source.key">
                      <img class="social-logos" :src="source.logo" />
                    </a-menu-item>
                  </a-menu>
                </template>
                <template #icon><ShareAltOutlined /></template>
              </a-dropdown-button>
              <a-button type="text" @click="showModal"><QuestionCircleOutlined /> </a-button>
              <a-modal v-model:open="open" @ok="handleOk">
                <p>
                  Fantasy Navigator Rankings are derived from an extensive array of sources,
                  including millions of crowd-sourced data points, expert consensus rankings, and
                  real trade analyses. This comprehensive approach ensures that our rankings are not
                  only well-informed but also reflect the most current trends and insights in
                  fantasy sports.
                </p>
              </a-modal></a-col
            >
          </a-row>
          <a-row :gutter="{ xs: 10, sm: 12, md: 24, lg: 32 }">
            <a-col :xs="24" :sm="12" :md="12" :lg="12" class="gutter-box-options-left">
              <a-flex :gap="10" :wrap="true" style="align-items: center">
                <a-switch
                  size="large"
                  v-model:checked="state.checked1"
                  checked-children="Superflex"
                  un-checked-children="OneQB"
                />
                <div>
                  <a-select
                    ref="select"
                    v-model:value="dropDownValue1"
                    :options="dropDownOptions1"
                    @focus="dropDownfocus"
                    @change="dropDownHandleChange"
                  ></a-select>

                  <span style="font-size: 16px; margin-left: 5px">Team</span>
                </div>
                <a-checkbox v-model:checked="tepCheck" @change="onCheckTepChange">
                  <span style="font-size: 16px">TE Premium</span>
                </a-checkbox>
              </a-flex>
            </a-col>
            <a-col :xs="24" :sm="12" :md="12" :lg="12" class="gutter-box-options-right">
              <a-flex :gap="0"> </a-flex>
            </a-col>
          </a-row>
        </div>
        <a-divider></a-divider>
        <a-row :gutter="100" class="teams">
          <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <div>
              <div class="search-bar-container">
                <a-auto-complete
                  v-model:value="value1"
                  :options="options1"
                  :allow-clear="true"
                  style="width: 100%"
                  placeholder="Team A..."
                  @select="selectPlayer1"
                  @search="searchPlayer1"
                />
              </div>
              <div
                v-for="(player, index) in selectedPlayers1"
                :key="player.player_full_name"
                class="player-card"
              >
                <a-badge-ribbon
                  :text="player._position"
                  :color="getPositionColor(player._position)"
                >
                  <a-card
                    size="small"
                    :bordered="true"
                    :style="{
                      backgroundColor: getCardPositionColor(player._position),
                      borderColor: getPositionColor(player._position)
                    }"
                  >
                    <a-row justify="space-between">
                      <a-col :span="12" class="gutter-box-player">
                        <span>{{ player.player_full_name }}</span>
                      </a-col>
                      <a-col :span="6" class="gutter-box">
                        <span class="age-value" v-if="player.age !== null"
                          >Age {{ player.age }}</span
                        >
                      </a-col>

                      <a-col :span="4" class="gutter-box-value">
                        <span class="player-value">{{
                          state.checked1 ? player.sf_value : player.one_qb_value
                        }}</span>
                      </a-col>

                      <MinusCircleTwoTone
                        class="close-icon"
                        two-tone-color="darkgray"
                        :style="{ fontSize: '22px' }"
                        @click.stop="removePlayer1(index)"
                      />
                    </a-row>
                  </a-card>
                </a-badge-ribbon>
              </div>
              <div v-if="addAdjustmentA">
                <a-card size="small" :bordered="true" class="va-card">
                  <div class="card-content">
                    <span> Value Adjustment </span>
                    <span class="player-value">+{{ Math.round(fuzzedValueDifferenceA) }}</span>
                  </div>
                </a-card>

                <div class="total-assets-container">
                  <div class="total-value">{{ selectedPlayers1.length }} Piece(s)</div>
                  <div class="total-value">
                    Total Value:
                    {{ Math.round(totalValue1 + fuzzedValueDifferenceA).toLocaleString() }}
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="total-assets-container">
                  <div class="total-value">{{ selectedPlayers1.length }} Piece(s)</div>
                  <div class="total-value">Total Value: {{ totalValue1.toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </a-col>
          <a-divider class="mobile-divider" :style="{ display: 'none' }"></a-divider>
          <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <div>
              <div class="search-bar-container">
                <a-auto-complete
                  v-model:value="value2"
                  :options="options2"
                  :allow-clear="true"
                  style="width: 100%"
                  placeholder="Team B..."
                  @select="selectPlayer2"
                  @search="searchPlayer2"
                />
              </div>
              <div
                v-for="(player, index) in selectedPlayers2"
                :key="player.player_full_name"
                class="player-card"
              >
                <a-badge-ribbon
                  :text="player._position"
                  :color="getPositionColor(player._position)"
                >
                  <a-card
                    size="small"
                    :bordered="true"
                    :style="{
                      backgroundColor: getCardPositionColor(player._position),
                      borderColor: getPositionColor(player._position)
                    }"
                    ><a-row justify="space-between">
                      <a-col :span="12" class="gutter-box-player">
                        <span>{{ player.player_full_name }}</span>
                      </a-col>
                      <a-col :span="6" class="gutter-box">
                        <span class="age-value" v-if="player.age !== null"
                          >Age {{ player.age }}</span
                        >
                      </a-col>

                      <a-col :span="4" class="gutter-box-value">
                        <span class="player-value">{{
                          state.checked1 ? player.sf_value : player.one_qb_value
                        }}</span>
                      </a-col>

                      <MinusCircleTwoTone
                        class="close-icon"
                        two-tone-color="darkgray"
                        :style="{ fontSize: '22px' }"
                        @click.stop="removePlayer2(index)"
                      />
                    </a-row>
                  </a-card>
                </a-badge-ribbon>
              </div>
              <div v-if="showCardB">
                <a-card size="small" :bordered="true" class="va-card">
                  <div class="card-content">
                    <span> Value Adjustment </span>
                    <span class="player-value">+{{ Math.round(fuzzedValueDifferenceB) }}</span>
                  </div>
                </a-card>

                <div class="total-assets-container">
                  <div class="total-value">{{ selectedPlayers2.length }} Piece(s)</div>
                  <div class="total-value">
                    Total Value:
                    {{ Math.round(totalValue2 + fuzzedValueDifferenceB).toLocaleString() }}
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="total-assets-container">
                  <div class="total-value">{{ selectedPlayers2.length }} Piece(s)</div>
                  <div class="total-value">Total Value: {{ totalValue2.toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
        <div class="trade-comparison" style="padding-top: 10px">
          <a-row type="flex" justify="center" style="padding-bottom: 10px">
            <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="12">
              <div v-if="selectedPlayers1.length > 0 || selectedPlayers2.length > 0">
                <a-card
                  v-if="aFavoredTrade"
                  style="
                    background: rgb(249, 65, 68, 0.1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    font-size: 18px;
                  "
                  size="small"
                >
                  <div>
                    <ArrowLeftOutlined style="padding-right: 20px" class="arrow-icon" />
                    <span>Favors Team A</span>
                  </div>
                  <div>
                    Add
                    <span style="font-weight: bold">{{
                      Math.round(balancingPlayerValue).toLocaleString()
                    }}</span>
                    to balance trade
                    <ArrowRightOutlined style="padding-left: 15px" class="arrow-icon" />
                  </div>
                </a-card>
                <a-card
                  v-if="bFavoredTrade"
                  style="
                    background: rgb(249, 65, 68, 0.1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    font-size: 18px;
                  "
                  size="small"
                >
                  <div>
                    <span>Favors Team B</span>
                    <ArrowRightOutlined style="padding-left: 20px" class="arrow-icon" />
                  </div>

                  <div>
                    <ArrowLeftOutlined style="padding-right: 15px" class="arrow-icon" />
                    Add
                    <span style="font-weight: bold">{{
                      Math.round(balancingPlayerValue).toLocaleString()
                    }}</span>
                    to balance trade
                  </div>
                </a-card>
                <a-card
                  v-if="isFairTrade"
                  style="
                    background: rgb(144, 190, 109, 0.3);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    font-size: 20px;
                  "
                  ><DoubleLeftOutlined style="padding-right: 25px" />Balanced
                  <DoubleRightOutlined style="padding-left: 25px"
                /></a-card>
              </div>
            </a-col>
          </a-row>
          <a-collapse :bordered="false">
            <a-collapse-panel key="1" header="Options">
              <a-row type="flex" justify="left">
                <a-col :xs="24" :sm="12" :md="8" :lg="8" :xl="12">
                  <div class="slider-label">Acceptable Variance</div>
                  <a-slider max="25" v-model:value="percentThreshold" />
                  <span> {{ percentThreshold }}%</span>
                </a-col>
              </a-row>
            </a-collapse-panel>
          </a-collapse>
          <div
            v-if="
              tradeAnalysis.percentageDifference > percentThreshold &&
              closestBalancingPlayers.length > 0
            "
            class="nearest-players"
          >
            <div>
              <h3>Players to Help Balance</h3>
              <div
                v-for="player in closestBalancingPlayers"
                :key="player.player_full_name"
                class="player-card-nearest"
              >
                <a-badge-ribbon
                  :text="player._position"
                  :color="getPositionColor(player._position)"
                >
                  <a-card
                    size="small"
                    :bordered="true"
                    :style="{
                      backgroundColor: getCardPositionColor(player._position),
                      borderColor: getPositionColor(player._position)
                    }"
                    style="border-radius: 3px"
                  >
                    <div class="card-content">
                      <span>{{ player.player_full_name }}</span>
                      <span class="player-value">{{
                        state.checked1 ? player.sf_value : player.one_qb_value
                      }}</span>
                      <PlusCircleTwoTone
                        class="close-icon"
                        two-tone-color="#90BE6D"
                        :style="{ fontSize: '22px' }"
                        @click.stop="addPlayerToTrade(player)"
                      />
                    </div>
                  </a-card>
                </a-badge-ribbon>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <a-space :xs="12" :sm="12" :md="24" :lg="48" :xl="48">
            <a-button @click="clearCalculator" danger>Clear Calculator</a-button>
          </a-space>
        </div>
      </div>
      <AppFooter />
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

//  Custom Utils

// 3rd Party imports
import axios from 'axios'
import { message, Spin, Column, Empty, MenuProps, SelectProps, Checkbox } from 'ant-design-vue'
import {
  PlusCircleTwoTone,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  MinusCircleTwoTone,
  ShareAltOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  HomeOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons-vue'

// Sourec image imports
import fnLogo from '@/assets/sourceLogos/fn.png'
// import ktcLogo from '@/assets/sourceLogos/ktc.png'
// import dpLogo from '@/assets/sourceLogos/dp.png'
// import fcLogo from '@/assets/sourceLogos/fc.png'
import xLogo from '@/assets/socialLogos/x.png'
import redditLogo from '@/assets/socialLogos/reddit.png'

const apiUrl = import.meta.env.VITE_API_URL
const percentThreshold = ref<number>(5)
const value1 = ref('')
const value2 = ref('')
const options1 = ref<TeamA[]>([])
const options2 = ref<TeamB[]>([])
const selectedPlayers1 = ref([])
const selectedPlayers2 = ref([])
const isLoading = ref(false)
const ranksData = ref([{}])
const platform = ref('sf')
const rankType = ref('dynasty')
const tepCheck = ref(false)
const dropDownValue1 = ref('12')
const open = ref<boolean>(false)

// interfaces
interface TeamA {
  value: string
}
interface TeamB {
  value: string
}

const dropDownOptions1 = ref<SelectProps['options']>([
  {
    value: '8',
    label: '8'
  },
  {
    value: '10',
    label: '10'
  },
  {
    value: '12',
    label: '12'
  },
  {
    value: '14',
    label: '14'
  },
  {
    value: '16',
    label: '16'
  }
])

const dropDownfocus = () => {
  console.log('focus')
}

const calculateIndex = (value) => {
  return rankType.value === 'redraft' ? parseInt(value) * 15 : parseInt(value) * 25
}

const dropDownHandleChange = (value: string) => {
  // Convert the selected value to an integer and multiply by 25 to get the index
  const index = calculateIndex(value)

  if (ranksData.value && index < ranksData.value.length) {
    bpv_value = ranksData.value[index].sf_value // Adjust 'sf_value' as per your data structure
    // console.log(`BPV recalculated to: ${bpv_value}`)
  } else {
    console.warn('Calculated index is out of bounds of the ranks data array')
    bpv_value = null // Handle the case where the index is not valid
  }

  clearCalculator()
}

const sources = [
  { key: 'sf', name: 'FantasyNavigator', logo: fnLogo }
  // { key: 'ktc', name: 'KeepTradeCut', logo: ktcLogo },
  // { key: 'dp', name: 'DynastyProcess', logo: dpLogo },
  // { key: 'fc', name: 'FantasyCalc', logo: fcLogo }
]

const selectedSource = ref(sources[0])

const shareTradeSources = [
  { key: 'x', name: 'X', logo: xLogo },
  { key: 'reddit', name: 'Reddit', logo: redditLogo }
]

const filteredSources = computed(() => {
  if (rankType.value !== 'dynasty') {
    return sources.filter(
      (source) => source.key === 'fc' || source.key === 'ktc' || source.key === 'sf'
    )
  }
  return sources
})
// watch(rankType, (newVal, oldVal) => {
//   console.log(`Rank type changed from ${oldVal} to ${newVal}`)
//   if (newVal !== oldVal) {
//     clearCalculator()
//   }
// })

const tweetPlayers = () => {
  const playerNames1 = selectedPlayers1.value.map((p) => p.player_full_name).join(', ')
  const playerNames2 = selectedPlayers2.value.map((p) => p.player_full_name).join(', ')
  const currentDropDownLabel = dropDownOptions1.value.find(
    (option) => option.value === dropDownValue1.value
  )?.label
  const tepText = tepCheck.value ? 'TEP' : ''
  const tweetText = `${currentDropDownLabel} Team ${tepText}\n${rankType.value.charAt(0).toUpperCase() + rankType.value.slice(1)} ${state.checked1 ? 'Superflex' : 'OneQB'}\nWhich side wins?\nTeam A: ${playerNames1}\nTeam B: ${playerNames2} \n Powered by @superflex_app\n www.superflex.app`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
  window.open(tweetUrl, '_blank')
}

const redditPlayers = () => {
  const playerNames1 = selectedPlayers1.value.map((p) => p.player_full_name).join(', ')
  const playerNames2 = selectedPlayers2.value.map((p) => p.player_full_name).join(', ')
  const currentDropDownLabel = dropDownOptions1.value.find(
    (option) => option.value === dropDownValue1.value
  )?.label
  const dynastySubReddit = 'DynastyFFTradeAdvice'
  const redraftSubReddit = 'fantasyfootballadvice'
  const subReddit = rankType.value === 'dynasty' ? dynastySubReddit : redraftSubReddit
  const tepText = tepCheck.value ? 'TEP' : ''
  const redditTitle = 'Which Side Wins?'
  const redditText = `${currentDropDownLabel} Team ${tepText}\n${rankType.value.charAt(0).toUpperCase() + rankType.value.slice(1)} ${state.checked1 ? 'Superflex' : 'OneQB'}\nWhich side wins?\nTeam A: ${playerNames1}\nTeam B: ${playerNames2}`
  const redditUrl = `https://www.reddit.com/r/${subReddit}/submit?title=${encodeURIComponent(redditTitle)}&text=${encodeURIComponent(redditText)}`
  window.open(redditUrl, '_blank')
}

const handleShareClick = (item) => {
  if (item.key === 'x') {
    tweetPlayers()
  }
  if (item.key === 'reddit') {
    redditPlayers()
  }
}
const showModal = () => {
  open.value = true
}
const handleOk = (e: MouseEvent) => {
  open.value = false
}
async function onCheckTepChange(event: Event): Promise<void> {
  const checked = (event.target as HTMLInputElement).checked
  // console.log('TEP checked:', checked)

  ranksData.value.forEach((player) => {
    if (player._position === 'TE') {
      if (checked) {
        player.sf_value = Math.round(player.sf_value * 1.1)
        player.one_qb_value = Math.round(player.one_qb_value * 1.1)
      } else {
        player.sf_value = Math.round(player.sf_value / 1.1)
        player.one_qb_value = Math.round(player.one_qb_value / 1.1)
      }
    }
  })
}

function consistentHash(value) {
  let hash = 0
  const stringVal = value.toString()
  for (let i = 0; i < stringVal.length; i++) {
    const char = stringVal.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return (hash % 1000) / 1000 // Normalize to 0-1
}

// Fuzzing function that uses the hash for consistency
function fuzzValue(value) {
  const minFuzz = 0.02
  const maxFuzz = 0.05
  const fuzzFactor = consistentHash(value) * (maxFuzz - minFuzz) + minFuzz
  return value + value * fuzzFactor * (consistentHash(value) > 0.5 ? 1 : -1)
}
// Original values
const valueDifferenceA = computed(() => totalValue2.value - totalValue1.value)
const valueDifferenceB = computed(() => totalValue1.value - totalValue2.value)

// Fuzzed values for UI display
const fuzzedValueDifferenceA = computed(() => fuzzValue(valueDifferenceA.value))
const fuzzedValueDifferenceB = computed(() => fuzzValue(valueDifferenceB.value))

const addAdjustmentA = computed(() => {
  return (
    tradeAnalysis.value.percentageDifference <= percentThreshold.value &&
    valueDifferenceA.value > 0 &&
    (selectedPlayers1.value.length > 1 || selectedPlayers2.value.length > 1)
  )
})

const showCardB = computed(() => {
  return (
    tradeAnalysis.value.percentageDifference <= percentThreshold.value &&
    valueDifferenceB.value > 0 &&
    (selectedPlayers1.value.length > 1 || selectedPlayers2.value.length > 1)
  )
})

const totalValue1 = computed(() => {
  return selectedPlayers1.value.reduce((sum, player) => {
    const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'
    return sum + (player[valueKey] || 0)
  }, 0)
})

const totalValue2 = computed(() => {
  return selectedPlayers2.value.reduce((sum, player) => {
    return sum + (state.checked1 ? player.sf_value : player.one_qb_value)
  }, 0)
})

const searchPlayer1 = (searchText: string) => {
  const filteredData = ranksData.value
    .filter((item) => item.player_full_name.toLowerCase().includes(searchText.toLowerCase()))
    .map((item) => ({
      label: `${item.player_full_name} - ${item._position}`, // display name
      value: item.player_id, // unique identifier
      data: item // keep the full player data
    }))

  options1.value = filteredData
}

const searchPlayer2 = (searchText: string) => {
  const filteredData = ranksData.value
    .filter((item) => item.player_full_name.toLowerCase().includes(searchText.toLowerCase()))
    .map((item) => ({
      label: `${item.player_full_name} - ${item._position}`, // display name
      value: item.player_id, // unique identifier
      data: item // keep the full player data
    }))

  options2.value = filteredData
}

const selectPlayer1 = (playerId: string) => {
  const player = ranksData.value.find((item) => item.player_id === playerId)

  const isAlreadySelected = selectedPlayers1.value.some((p) => p.player_id === player?.player_id)
  const hasSpecialYear =
    player?.player_full_name.includes('2024') ||
    player?.player_full_name.includes('2025') ||
    player?.player_full_name.includes('2026')

  if (player && (!isAlreadySelected || hasSpecialYear)) {
    selectedPlayers1.value.push(player)
  }
  value1.value = ''
}

const selectPlayer2 = (playerId: string) => {
  const player = ranksData.value.find((item) => item.player_id === playerId)

  const isAlreadySelected = selectedPlayers2.value.some((p) => p.player_id === player?.player_id)
  const hasSpecialYear =
    player?.player_full_name.includes('2024') ||
    player?.player_full_name.includes('2025') ||
    player?.player_full_name.includes('2026')

  if (player && (!isAlreadySelected || hasSpecialYear)) {
    selectedPlayers2.value.push(player)
  }

  value2.value = ''
}

const removePlayer1 = (index) => {
  selectedPlayers1.value.splice(index, 1)
}

const removePlayer2 = (index) => {
  selectedPlayers2.value.splice(index, 1)
}

const clearCalculator = () => {
  selectedPlayers1.value = []
  selectedPlayers2.value = []
}

const clearCalcMemory = () => {
  value1.value = ''
  options1.value = []
  value2.value = ''
  options2.value = []
}

const addPlayerToTrade = (player) => {
  const sideToAdd =
    totalValueSideA.value <= totalValueSideB.value ? selectedPlayers1 : selectedPlayers2

  // Add the player to the appropriate list if they're not already included
  const existingPlayer = sideToAdd.value.find((p) => p.player_full_name === player.player_full_name)
  if (!existingPlayer) {
    sideToAdd.value.push(player)
  }
}

const totalValueSideA = computed(() => {
  console.log('selectedPlayers1.value', selectedPlayers1.value)
  const playerValues = selectedPlayers1.value.map((player) => {
    // Convert the values to integers using parseInt or the unary plus operator (+)
    const value = state.checked1 ? parseInt(player.sf_value, 10) : parseInt(player.one_qb_value, 10)
    return value
  })

  console.log('playerValues', playerValues)

  // Sort the values after making sure they are integers
  const sortedPlayerValues = [...playerValues].sort((a, b) => b - a)

  console.log('Sorted Player Values:', sortedPlayerValues)

  // Calculate the trade value with the new function
  return calculateTradeValue(sortedPlayerValues) // Assuming you might want to use the sorted values
})

const totalValueSideB = computed(() => {
  // Extract the relevant player values based on the current switch state
  const playerValues = selectedPlayers2.value.map((player) =>
    state.checked1 ? player.sf_value : player.one_qb_value
  )
  // Calculate the trade value with the new function
  return calculateTradeValue(playerValues) // You can adjust k if needed
})

// const k_value = 1.005
// const bpv_value = 35
let bpv_value: number | null = null

function calculateTradeValue(playerValues, BPV = bpv_value) {
  console.log('Test Player Value:', playerValues)
  console.log('BPV Value:', BPV)

  // Validate input
  if (
    !Array.isArray(playerValues) ||
    playerValues.some((value) => typeof value !== 'number' || !isFinite(value))
  ) {
    console.error('Invalid input: playerValues must be an array of finite numbers.')
    return 0
  }

  const sortedPlayerValues = [...playerValues].sort((a, b) => b - a)

  const tradeValue = sortedPlayerValues.reduce((total, value) => {
    // Dynamic k value based on player value
    let k
    if (value >= BPV * 1.5) {
      k = 1.02 // Top tier
    } else if (value >= BPV * 1.2) {
      k = 1.01 // High mid tier
    } else if (value >= BPV) {
      k = 1.0 // Mid tier
    } else {
      k = 0.9 // Lower tier
    }

    const powerCurveValue = Math.pow(value, k)
    console.log('PowerCurveValue for value:', value, 'is:', powerCurveValue)

    const DRSValue = BPV + Math.pow((powerCurveValue - BPV) / Math.max(1, BPV), 2) * BPV
    console.log('DRSValue for value:', value, 'is:', DRSValue)

    const adjustedValue = Math.max(0, DRSValue)
    return total + adjustedValue
  }, 0)

  console.log('Calculated Trade Value:', tradeValue)
  return tradeValue
}

const tradeAnalysis = computed(() => {
  const valueA = findTeamValue(totalValueSideA.value)
  const valueB = findTeamValue(totalValueSideB.value)
  const averageValue = (valueA + valueB) / 2

  if (averageValue === 0) {
    return {
      percentageDifference: 0,
      valueA: valueA,
      valueB: valueB
    }
  }

  const difference = Math.abs(valueA - valueB)
  const percentageDiff = (difference / averageValue) * 100

  return {
    percentageDifference: parseFloat(percentageDiff.toFixed(2)), // Ensure it's a number with two decimal places
    valueA: valueA,
    valueB: valueB
  }
})

function findBalancingPlayerValue(
  totalValueSideA: number,
  totalValueSideB: number,
  BPV: number
): number {
  const targetValue = Math.max(totalValueSideA, totalValueSideB)
  let difference = Math.abs(totalValueSideA - totalValueSideB)

  // If the trade is already even, or the difference is very small, return 0
  if (difference < 0.01) {
    return 0
  }

  let estimateValue = difference
  let estimatedTradeValue = 0
  let iterations = 0
  let adjustment = difference / 2

  while (iterations < 100) {
    // Limit iterations to prevent infinite loops
    estimatedTradeValue = calculateTradeValue([estimateValue])

    const currentDifference = Math.abs(
      (totalValueSideA < totalValueSideB
        ? totalValueSideA + estimatedTradeValue
        : totalValueSideB + estimatedTradeValue) - targetValue
    )

    if (currentDifference <= 0.01) {
      // If the estimated trade value is within an acceptable range, break the loop
      break
    } else if (
      (totalValueSideA < totalValueSideB && totalValueSideA + estimatedTradeValue < targetValue) ||
      (totalValueSideB < totalValueSideA && totalValueSideB + estimatedTradeValue < targetValue)
    ) {
      // If the estimated total is less than the target, increase the estimate
      estimateValue += adjustment
    } else {
      // If the estimated total is greater than the target, decrease the estimate
      estimateValue -= adjustment
    }

    // Decrease the adjustment each time to hone in on the correct value
    adjustment /= 2
    iterations++
  }

  // Return the estimated player value that would balance the trade
  return estimateValue
}

const balancingPlayerValue = computed(() => {
  console.log('starting bvp')
  const valueA = totalValueSideA.value
  const valueB = totalValueSideB.value
  const BPV = bpv_value // The baseline player value for the DRS formula

  console.log(valueA, valueB, BPV)

  // Notice we're no longer passing k, as it is now managed inside the calculateTradeValue function
  return findBalancingPlayerValue(valueA, valueB, BPV)
})

function findTeamValue(totalValueSide: number): number {
  // Define the target value or some logic to determine what the adjusted value should be
  const targetValue = totalValueSide // This might need more logic based on your requirements

  let estimateValue = totalValueSide // Start with the current total value
  let estimatedTradeValue = 0
  let iterations = 0
  let adjustment = estimateValue / 2 // Initial adjustment

  while (iterations < 100) {
    estimatedTradeValue = calculateTradeValue([estimateValue])
    const currentDifference = Math.abs(estimatedTradeValue - targetValue)

    if (currentDifference <= 0.01) {
      break
    } else if (estimatedTradeValue < targetValue) {
      estimateValue += adjustment
    } else {
      estimateValue -= adjustment
    }

    adjustment /= 2
    iterations++
  }

  return estimateValue
}

function findClosestPlayers(
  balancingValue,
  playersData,
  valueKey,
  selectedPlayers1,
  selectedPlayers2
) {
  // Create a combined array of selected player names for exclusion
  const selectedPlayerNames = [
    ...selectedPlayers1.map((player) => player.player_full_name),
    ...selectedPlayers2.map((player) => player.player_full_name)
  ]

  // Find the highest value among the selected players
  const highestSelectedValue = Math.max(
    ...selectedPlayers1.map((player) => player[valueKey]),
    ...selectedPlayers2.map((player) => player[valueKey])
  )

  // Determine the value limit based on balancingValue
  const valueLimit = balancingValue !== 0 ? balancingValue : highestSelectedValue

  // Filter the playersData to exclude already selected players and
  // ensure the player's value is less than or equal to the valueLimit
  const filteredPlayersData = playersData.filter(
    (player) =>
      !selectedPlayerNames.includes(player.player_full_name) && player[valueKey] <= valueLimit
  )

  // Sort the remaining players by the absolute difference from the balancing value
  const sortedPlayers = filteredPlayersData.sort(
    (a, b) => Math.abs(a[valueKey] - balancingValue) - Math.abs(b[valueKey] - balancingValue)
  )

  // Get the closest players based on the balancing value
  const closestPlayers = sortedPlayers.slice(0, 20)

  return closestPlayers
}

const closestBalancingPlayers = computed(() => {
  if (selectedPlayers1.value.length === 0 && selectedPlayers2.value.length === 0) {
    return []
  }

  const balancingValue = balancingPlayerValue.value
  if (balancingValue === 0) {
    return []
  }

  const playersData = ranksData.value
  const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'

  // Get the closest players first
  let closestPlayers = findClosestPlayers(
    balancingValue,
    playersData,
    valueKey,
    selectedPlayers1.value,
    selectedPlayers2.value
  )

  // Then sort them in descending order based on their value
  closestPlayers.sort((a, b) => b[valueKey] - a[valueKey])

  return closestPlayers
})

const aFavored = computed(() => {
  return (
    tradeAnalysis.value.percentageDifference < percentThreshold.value &&
    valueDifferenceA.value > 0 &&
    (selectedPlayers1.value.length > 1 || selectedPlayers2.value.length > 1)
  )
})

const bFavored = computed(() => {
  return (
    tradeAnalysis.value.percentageDifference < percentThreshold.value &&
    valueDifferenceA.value > 0 &&
    (selectedPlayers1.value.length > 1 || selectedPlayers2.value.length > 1)
  )
})

const fairTrade = computed(() => {
  const percentageDifference = tradeAnalysis.value.percentageDifference
  return percentageDifference <= percentThreshold.value
})

const tradeStatus = computed(() => {
  if (selectedPlayers1.value.length === 0 && selectedPlayers2.value.length === 0) {
    return {
      message: 'Please select players',
      isFair: false,
      isFavored: false,
      aFavored: false,
      bFavored: false
    }
  }

  // Use the computed percentageDifference from tradeAnalysis
  const percentageDifference = tradeAnalysis.value.percentageDifference

  if (percentageDifference <= percentThreshold.value) {
    return {
      message: 'Fair Trade',
      isFair: true,
      isFavored: false,
      aFavored: false,
      bFavored: false
    }
  }

  const balancingValue = Math.round(balancingPlayerValue.value) // Round the balancing value to the nearest whole number
  if (totalValueSideA.value > totalValueSideB.value) {
    return {
      message: `Team A favored; add ~${balancingValue.toLocaleString()} to balance.`,
      isFair: false,
      isFavored: true,
      aFavored: true,
      bFavored: false
    }
  } else if (totalValueSideA.value < totalValueSideB.value) {
    return {
      message: `Team B favored; add ~${balancingValue.toLocaleString()} to balance.`,
      isFair: false,
      isFavored: true,
      aFavored: false,
      bFavored: true
    }
  } else {
    return {
      message: 'The trade is balanced',
      isFair: true,
      isFavored: false,
      aFavored: false,
      bFavored: false
    }
  }
})

const isFairTrade = computed(() => tradeStatus.value.isFair)
const aFavoredTrade = computed(() => tradeStatus.value.aFavored)
const bFavoredTrade = computed(() => tradeStatus.value.bFavored)

function valueState(teamValue, compareToValue, percentThreshold) {
  const percDiff = tradeAnalysis.value.percentageDifference

  if (percDiff < percentThreshold) {
    return 'fair'
  } else if (teamValue < compareToValue) {
    return 'behind'
  } else if (teamValue > compareToValue) {
    return 'ahead'
  } else {
    return 'none'
  }
}

const teamAState = computed(() => valueState(totalValue1.value, totalValue2.value))
const teamBState = computed(() => valueState(totalValue2.value, totalValue1.value))
const state = reactive({
  checked1: true,
  checked2: true
})

async function fetchRanks(platform: string, rankType: string) {
  isLoading.value = true
  tepCheck.value = false
  ranksData.value = []

  try {
    const response = await axios.get(`${apiUrl}/trade_calculator`, {
      params: {
        platform: platform,
        rank_type: rankType
      }
    })
    console.log('Pulling Player Values...')
    ranksData.value = response.data
    console.log('ranksData', ranksData)

    options1.value = ranksData.value.map((player) => ({
      label: `${player.player_full_name} - ${player._position}`, // display name with value
      value: player.player_id,
      data: player
    }))

    options2.value = ranksData.value.map((player) => ({
      label: `${player.player_full_name} - ${player._position}`, // display name with value
      value: player.player_id,
      data: player
    }))

    // Usage in your function or method
    const index = calculateIndex(dropDownValue1.value)

    if (ranksData.value.length > 0) {
      bpv_value = ranksData.value[index].sf_value
    } else {
      console.warn('No data available to set bpv_value')
      bpv_value = null // Or set a default value that makes sense in your context
    }
  } catch (error) {
    console.error('There was an error pulling values...', error)
  } finally {
    isLoading.value = false
  }
}
onMounted(() => {
  fetchRanks(platform.value, rankType.value)
})

watch(
  () => rankType.value,
  (newVal) => {
    clearCalculator()
    fetchRanks(platform.value, newVal)
  }
)

watch(ranksData, () => {
  selectedPlayers1.value = selectedPlayers1.value.map((selectedPlayer) => {
    // Find the updated player data in the fetched ranks
    const updatedPlayer = ranksData.value.find(
      (player) => player.player_full_name === selectedPlayer.player_full_name
    )
    return updatedPlayer || selectedPlayer
  })
})

watch(ranksData, () => {
  selectedPlayers2.value = selectedPlayers2.value.map((selectedPlayer) => {
    const updatedPlayer = ranksData.value.find(
      (player) => player.player_full_name === selectedPlayer.player_full_name
    )
    return updatedPlayer || selectedPlayer // Return the updated player or the original if not found
  })
})

const handleMenuClick: MenuProps['onClick'] = (e) => {
  platform.value = e.key
  try {
    clearCalculator()
    clearCalcMemory()
    fetchRanks(platform.value, rankType.value) // Ensure fetchRanks is awaited if it's asynchronous
    selectedSource.value = sources.find((source) => source.key === platform.value) || sources[0]
  } catch {
    console.log('error loading leagues')
  } finally {
  }
}

function getPositionColor(position: string): string {
  if (position === 'QB') {
    return 'rgb(39, 125, 161)'
  } else if (position === 'RB') {
    return 'rgb(144, 190, 109)'
  } else if (position === 'WR') {
    return 'rgb(67, 170, 139)'
  } else if (position === 'TE') {
    return 'rgb(249, 132, 74)'
  } else if (position.toUpperCase() === 'PICK') {
    return 'rgb(189, 195, 199)'
  } else {
    return 'rgb(0, 0, 0, .00)'
  }
}

function getCardPositionColor(position: string): string {
  if (position === 'QB') {
    return 'rgb(39, 125, 161, .08)'
  } else if (position === 'RB') {
    return 'rgb(144, 190, 109, .08)'
  } else if (position === 'WR') {
    return 'rgb(67, 170, 139, .08)'
  } else if (position === 'TE') {
    return 'rgb(249, 132, 74,.08)'
  } else if (position.toUpperCase() === 'PICK') {
    return 'rgb(189, 195, 199, 0.15)'
  } else {
    return 'rgb(0, 0, 0, .08)'
  }
}
</script>

<style scoped>
.trade-calculator {
  padding: 40px;
  border: 1px solid rgb(39, 125, 161);
  border-radius: 3px;
  min-width: 500px;
}
.layout {
  min-height: 100vh;
}

.switches {
  margin-bottom: 24px;
  text-align: left;
}

.team-box {
  padding: 24px;
  border-radius: 2px;
}

.team-box h3 {
  margin-bottom: 16px;
}

.total-pieces {
  margin-top: 16px;
  text-align: center;
  font-weight: bold;
}

.actions {
  margin-top: 24px;
  text-align: center;
}

.rank-logos {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
}
.social-logos {
  width: 24px;
  height: 22px;
  vertical-align: middle;
  border-radius: 3px;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 24px;
  padding-left: 10px;
}

.player-value {
  font-weight: bold;
  margin-left: auto;
  padding-right: 8px;
}
.age-value {
  margin-left: auto;
  padding-right: 8px;
}

.player-card {
  margin-bottom: 5px;
  position: relative;
  width: 100%;
}

.player-card .close-icon {
  position: absolute;
  top: 11px;
  left: -11px;
  cursor: pointer;
  z-index: 10;
}

.player-card .close-icon:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.player-card .a-card {
  padding-left: 24px;
}

.player-card-nearest {
  margin-bottom: 5px;
  position: relative;
  width: 100%;
  padding-left: 10px;
  padding-bottom: 6px;
}

.player-card-nearest .close-icon {
  position: absolute;
  top: 11px;
  left: -11px;
  cursor: pointer;
  z-index: 10;
}

.player-card-nearest .close-icon:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.player-card-nearest .a-card {
  padding-left: 24px;
  transition: box-shadow 0.3s;
}

.player-card-nearest .a-card:hover {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.total-value {
  margin-top: 24px;
  text-align: center;
  font-weight: bold;
}
.search-bar-container {
  margin-bottom: 20px;
}
.trade-comparison .a-alert {
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.slider-container {
  margin: 20px 0;
}

.slider-label {
  text-align: center;
  margin-bottom: 10px;
  font-weight: bold;
}
.nearest-players {
  max-width: 450px;
  width: 100%;
  margin: 0 auto;
  padding: 5px;
}

@media (max-width: 440px) {
  .nearest-players {
    width: auto;
    padding: 5px;
  }
  .trade-comparison .trade-status {
    font-size: 14px;
  }
  /* some work here on the divider */
  .mobile-divider {
    display: block !important;
  }
  .trade-calculator {
    padding: 6px;
    width: 100%;
    min-width: auto;
  }
  .team-heading {
    text-align: center;
  }
  .responsive-padding {
    padding: 0 10px;
  }
}

.status-message {
  padding: 16px;
  border-radius: 4px;
  text-align: center;
  font-size: 1.2em;
}

.fair-trade {
  color: #90be6d;
  border: 1px solid #90be6d;
}

.favored-trade {
  background-color: #ffedede6;
  color: #f94144;
  border: 1px solid #f94144;
}

.total-assets-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (min-width: 768px) {
  .responsive-padding {
    padding: 0 300px;
  }
}

.team-heading {
  padding: 2px;
  border: 1px solid rgba(87, 117, 144, 0.5);
  border-radius: 5px;
  font-weight: bolder;
}

.nearest-players {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 5px;
  width: 100%;
  margin-top: 20px;
  box-sizing: border-box;
}
.team-heading.none {
  border: none;
}
.team-heading.behind {
  border: 1px solid rgba(249, 65, 68, 0.6);
}

.team-heading.ahead {
  border: 1px solid rgba(144, 190, 109, 0.6);
}
.team-heading.fair {
  border: 1px solid rgba(30, 144, 255, 0.6);
}
.va-card {
  border: 1px solid rgb(70, 70, 70, 0.55);
  border-radius: 4px;
  background: rgb(70, 70, 70, 0.15);
}
.a-auto-complete input {
  font-size: 16px;
}
@media (max-width: 4400px) {
  .ant-modal {
    top: 52% !important;
    transform: translateY(-90%) !important;
  }
}
.gutter-box-refresh {
  margin-bottom: 10px;
  display: flex;
  justify-content: right;
  align-items: baseline;
}
.gutter-box-options-left {
  display: flex;
  justify-content: left;
  align-items: center;
}
.gutter-box-options-right {
  display: flex;
  justify-content: right;
  align-items: center;
}
.gutter-box {
  display: flex;
  justify-content: center;
  align-items: baseline;
}
.gutter-box-player {
  display: flex;
  justify-content: left;
  align-items: baseline;
}
.gutter-box-value {
  justify-content: left;

  align-items: baseline;
}
</style>
