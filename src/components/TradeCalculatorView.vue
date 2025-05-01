<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <a-layout-content class="responsive-padding">
      <div class="page-title">
        <h1>Trade Calculator</h1>
        <p class="subtitle">Evaluate trades with precision using our advanced calculator</p>
      </div>

      <div class="trade-calculator-container">
        <!-- Settings Panel -->
        <a-card class="settings-card">
          <div class="settings-row">
            <div class="settings-group">
              <a-radio-group v-model:value="rankType" button-style="solid" size="middle">
                <a-radio-button value="dynasty">Dynasty</a-radio-button>
                <a-radio-button value="redraft">Redraft</a-radio-button>
              </a-radio-group>

              <a-switch
                size="default"
                v-model:checked="state.checked1"
                checked-children="Superflex"
                un-checked-children="OneQB"
                class="format-switch"
              />
            </div>

            <div class="settings-group">
              <div class="team-size-selector">
                <a-select
                  v-model:value="dropDownValue1"
                  :options="dropDownOptions1"
                  @change="dropDownHandleChange"
                  size="middle"
                  style="width: 70px"
                />
                <span class="team-label">Team</span>
              </div>

              <a-checkbox v-model:checked="tepCheck" @change="onCheckTepChange" class="tep-check">
                TE Premium
              </a-checkbox>
            </div>
          </div>

          <div class="action-buttons">
            <a-dropdown-button type="primary" size="middle">
              Share
              <template #overlay>
                <a-menu @click="handleShareClick">
                  <a-menu-item v-for="source in shareTradeSources" :key="source.key">
                    <img class="social-logos" :src="source.logo" />
                    <span style="margin-left: 8px">{{ source.name }}</span>
                  </a-menu-item>
                </a-menu>
              </template>
              <template #icon><ShareAltOutlined /></template>
            </a-dropdown-button>

            <a-button type="text" @click="showModal" class="help-button">
              <QuestionCircleOutlined />
              <span class="help-text">How it works</span>
            </a-button>
          </div>
        </a-card>

        <!-- Trade Teams Section -->
        <div class="trade-teams">
          <!-- Team A -->
          <a-card class="team-card" :bordered="false">
            <template #title>
              <div class="team-header">
                <h2>Team A</h2>
                <div
                  class="team-value"
                  :class="{ 'value-favorable': aFavoredTrade, 'value-balanced': isFairTrade }"
                >
                  <span v-if="selectedPlayers1.length > 0">{{ totalValue1.toLocaleString() }}</span>
                </div>
              </div>
            </template>

            <div class="search-bar-container">
              <a-auto-complete
                v-model:value="value1"
                :options="options1"
                :allow-clear="true"
                style="width: 100%"
                placeholder="Search for players and picks..."
                @select="selectPlayer1"
                @search="searchPlayer1"
                size="large"
              >
                <template #prefix>
                  <SearchOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
              </a-auto-complete>
            </div>

            <div class="players-container">
              <div
                v-for="(player, index) in selectedPlayers1"
                :key="player.player_full_name + index"
                class="player-card"
              >
                <a-card
                  size="small"
                  :bordered="false"
                  class="player-item"
                  :style="{ borderLeft: `4px solid ${getPositionColor(player._position)}` }"
                >
                  <div class="player-details-wrapper">
                    <div class="player-name-info">
                      <div class="player-name">{{ player.player_full_name }}</div>
                      <div class="player-meta">
                        <span
                          class="player-position"
                          :style="{ color: getPositionColor(player._position) }"
                        >
                          {{ player._position }}
                        </span>
                        <span class="player-age" v-if="player.age">Age: {{ player.age }}</span>
                      </div>
                    </div>
                    <div class="player-value-container">
                      <div class="player-value">
                        {{ state.checked1 ? player.sf_value : player.one_qb_value }}
                      </div>
                      <button class="remove-player" @click="removePlayer1(index)">
                        <MinusCircleTwoTone two-tone-color="#f5222d" />
                      </button>
                    </div>
                  </div>
                </a-card>
              </div>

              <!-- Value Adjustment Card -->
              <div v-if="addAdjustmentA" class="adjustment-card">
                <a-card size="small" :bordered="true" class="va-card">
                  <div class="card-content">
                    <span>Value Adjustment</span>
                    <span class="player-value">+{{ Math.round(fuzzedValueDifferenceA) }}</span>
                  </div>
                </a-card>
              </div>
            </div>

            <div class="team-summary">
              <div class="asset-count">
                {{ selectedPlayers1.length }} Asset{{ selectedPlayers1.length !== 1 ? 's' : '' }}
              </div>
              <div class="total-value-display">
                Total:
                <strong>{{
                  addAdjustmentA
                    ? Math.round(totalValue1 + fuzzedValueDifferenceA).toLocaleString()
                    : totalValue1.toLocaleString()
                }}</strong>
              </div>
            </div>
          </a-card>

          <!-- Trade Evaluation -->
          <div class="trade-evaluation">
            <a-card
              v-if="selectedPlayers1.length > 0 || selectedPlayers2.length > 0"
              :class="{
                'evaluation-balanced': isFairTrade,
                'evaluation-favors-a': aFavoredTrade,
                'evaluation-favors-b': bFavoredTrade
              }"
            >
              <template v-if="isFairTrade">
                <CheckCircleFilled class="eval-icon" />
                <div class="eval-message">Balanced Trade</div>
              </template>

              <template v-else-if="aFavoredTrade">
                <div class="eval-heading">Favors Team A</div>
                <div class="eval-message">
                  Team B needs
                  <strong>{{ Math.round(balancingPlayerValue).toLocaleString() }}</strong> more
                  value
                </div>
                <ArrowLeftOutlined class="direction-arrow" />
              </template>

              <template v-else-if="bFavoredTrade">
                <div class="eval-heading">Favors Team B</div>
                <div class="eval-message">
                  Team A needs
                  <strong>{{ Math.round(balancingPlayerValue).toLocaleString() }}</strong> more
                  value
                </div>
                <ArrowRightOutlined class="direction-arrow" />
              </template>
            </a-card>
          </div>

          <!-- Team B -->
          <a-card class="team-card" :bordered="false">
            <template #title>
              <div class="team-header">
                <h2>Team B</h2>
                <div
                  class="team-value"
                  :class="{ 'value-favorable': bFavoredTrade, 'value-balanced': isFairTrade }"
                >
                  <span v-if="selectedPlayers2.length > 0">{{ totalValue2.toLocaleString() }}</span>
                </div>
              </div>
            </template>

            <div class="search-bar-container">
              <a-auto-complete
                v-model:value="value2"
                :options="options2"
                :allow-clear="true"
                style="width: 100%"
                placeholder="Search for players and picks..."
                @select="selectPlayer2"
                @search="searchPlayer2"
                size="large"
              >
                <template #prefix>
                  <SearchOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
              </a-auto-complete>
            </div>

            <div class="players-container">
              <div
                v-for="(player, index) in selectedPlayers2"
                :key="player.player_full_name + index"
                class="player-card"
              >
                <a-card
                  size="small"
                  :bordered="false"
                  class="player-item"
                  :style="{ borderLeft: `4px solid ${getPositionColor(player._position)}` }"
                >
                  <div class="player-details-wrapper">
                    <div class="player-name-info">
                      <div class="player-name">{{ player.player_full_name }}</div>
                      <div class="player-meta">
                        <span
                          class="player-position"
                          :style="{ color: getPositionColor(player._position) }"
                        >
                          {{ player._position }}
                        </span>
                        <span class="player-age" v-if="player.age">Age: {{ player.age }}</span>
                      </div>
                    </div>
                    <div class="player-value-container">
                      <div class="player-value">
                        {{ state.checked1 ? player.sf_value : player.one_qb_value }}
                      </div>
                      <button class="remove-player" @click="removePlayer2(index)">
                        <MinusCircleTwoTone two-tone-color="#f5222d" />
                      </button>
                    </div>
                  </div>
                </a-card>
              </div>

              <!-- Value Adjustment Card -->
              <div v-if="showCardB" class="adjustment-card">
                <a-card size="small" :bordered="true" class="va-card">
                  <div class="card-content">
                    <span>Value Adjustment</span>
                    <span class="player-value">+{{ Math.round(fuzzedValueDifferenceB) }}</span>
                  </div>
                </a-card>
              </div>
            </div>

            <div class="team-summary">
              <div class="asset-count">
                {{ selectedPlayers2.length }} Asset{{ selectedPlayers2.length !== 1 ? 's' : '' }}
              </div>
              <div class="total-value-display">
                Total:
                <strong>{{
                  showCardB
                    ? Math.round(totalValue2 + fuzzedValueDifferenceB).toLocaleString()
                    : totalValue2.toLocaleString()
                }}</strong>
              </div>
            </div>
          </a-card>
        </div>

        <!-- Balancing Players Suggestions -->
        <a-card
          v-if="
            tradeAnalysis.percentageDifference > percentThreshold &&
            closestBalancingPlayers.length > 0
          "
          class="balancing-players-card"
        >
          <template #title>
            <div class="balancing-title">
              <h3>Balance the Trade</h3>
              <a-tooltip title="These players could help balance the trade">
                <InfoCircleOutlined style="margin-left: 8px" />
              </a-tooltip>
            </div>
          </template>

          <div class="balancing-players-container">
            <div
              v-for="player in closestBalancingPlayers.slice(0, 6)"
              :key="player.player_full_name"
              class="balancing-player-card"
            >
              <a-card
                size="small"
                :bordered="false"
                class="player-item"
                :style="{ borderLeft: `4px solid ${getPositionColor(player._position)}` }"
                hoverable
                @click="addPlayerToTrade(player)"
              >
                <div class="player-details-wrapper">
                  <div class="player-name-info">
                    <div class="player-name">{{ player.player_full_name }}</div>
                    <div class="player-meta">
                      <span
                        class="player-position"
                        :style="{ color: getPositionColor(player._position) }"
                      >
                        {{ player._position }}
                      </span>
                      <span class="player-age" v-if="player.age">Age: {{ player.age }}</span>
                    </div>
                  </div>
                  <div class="player-value-container">
                    <div class="player-value">
                      {{ state.checked1 ? player.sf_value : player.one_qb_value }}
                    </div>
                    <PlusCircleTwoTone class="add-player-icon" two-tone-color="#52c41a" />
                  </div>
                </div>
              </a-card>
            </div>
          </div>

          <div class="view-more" v-if="closestBalancingPlayers.length > 6">
            <a-button type="link">View More Players</a-button>
          </div>
        </a-card>

        <!-- Options Panel -->
        <a-card class="options-card">
          <a-row>
            <a-col :xs="24" :sm="16" :md="16">
              <div class="slider-container">
                <div class="slider-label">Acceptable Trade Variance: {{ percentThreshold }}%</div>
                <a-slider v-model:value="percentThreshold" :min="1" :max="25" :step="1" />
              </div>
            </a-col>
            <a-col :xs="24" :sm="8" :md="8" class="clear-button-container">
              <a-button @click="clearCalculator" danger>Clear Calculator</a-button>
            </a-col>
          </a-row>
        </a-card>
      </div>

      <!-- Help Modal -->
      <a-modal v-model:open="open" @ok="handleOk" title="How the Trade Calculator Works">
        <p>
          Fantasy Navigator Rankings are derived from an extensive array of sources, including
          millions of crowd-sourced data points, expert consensus rankings, and real trade analyses.
          This comprehensive approach ensures that our rankings are not only well-informed but also
          reflect the most current trends and insights in fantasy sports.
        </p>
        <p>
          The calculator accounts for value consolidation, meaning that higher-valued players are
          worth more than the sum of multiple lower-valued players. This provides a more realistic
          assessment of fantasy football trades.
        </p>
      </a-modal>

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
  QuestionCircleOutlined,
  SearchOutlined,
  CheckCircleFilled,
  InfoCircleOutlined
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
  const tweetText = `${currentDropDownLabel} Team ${tepText}\n${rankType.value.charAt(0).toUpperCase() + rankType.value.slice(1)} ${state.checked1 ? 'Superflex' : 'OneQB'}\nWhich side wins?\nTeam A: ${playerNames1}\nTeam B: ${playerNames2} \n Powered by @fantasynav1\n www.fantasynavigator.com`
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
  const redditText = `${currentDropDownLabel} Team ${tepText}\n${rankType.value.charAt(0).toUpperCase() + rankType.value.slice(1)} ${state.checked1 ? 'Superflex' : 'OneQB'}\nWhich side wins?\nTeam A: ${playerNames1}\nTeam B: ${playerNames2} \n Powered by @fantasynav1\n www.fantasynavigator.com`
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
  const playerValues = selectedPlayers1.value.map((player) => {
    // Convert the values to integers using parseInt or the unary plus operator (+)
    const value = state.checked1 ? parseInt(player.sf_value, 10) : parseInt(player.one_qb_value, 10)
    return value
  })

  // Sort the values after making sure they are integers
  const sortedPlayerValues = [...playerValues].sort((a, b) => b - a)

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

    const DRSValue = BPV + Math.pow((powerCurveValue - BPV) / Math.max(1, BPV), 2) * BPV

    const adjustedValue = Math.max(0, DRSValue)
    return total + adjustedValue
  }, 0)

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
/* General Layout */
.layout {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.responsive-padding {
  padding: 0 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  margin: 24px 0;
}

.page-title h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #2d3142;
}

.subtitle {
  color: #5c5f6b;
  font-size: 16px;
}

.trade-calculator-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

/* Settings Card */
.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.settings-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.format-switch {
  margin-left: 8px;
}

.team-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-label {
  font-size: 14px;
  color: #5c5f6b;
}

.tep-check {
  margin-left: 8px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.help-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-text {
  font-size: 14px;
}

.social-logos {
  width: 20px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
}

/* Trade Teams */
.trade-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
}

.team-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.team-value {
  font-size: 18px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 16px;
  background-color: #f0f2f5;
}

.value-favorable {
  color: #52c41a;
  background-color: rgba(82, 196, 26, 0.1);
}

.value-balanced {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

.search-bar-container {
  margin-bottom: 16px;
}

.players-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
}

/* Player Cards - New Style */
.player-card {
  margin-bottom: 8px;
}

.player-item {
  border-radius: 4px;
  background-color: var(--background-color, #fff);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.player-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.player-details-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
}

.player-name-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0; /* Required for text truncation */
  flex: 1;
}

.player-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  color: var(--text-color, #2d3142);
  line-height: 1.2;
}

.player-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-position {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1;
}

.player-age {
  font-size: 11px;
  color: #8c8c8c;
  line-height: 1;
}

.player-value-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-value {
  font-size: 16px;
  font-weight: 700;
  color: #1890ff;
  padding: 2px 8px;
  background-color: rgba(24, 144, 255, 0.1);
  border-radius: 12px;
  white-space: nowrap;
}

.remove-player {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Balancing Player Cards - Updated Style */
.balancing-player-card {
  margin-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.balancing-player-card:hover {
  transform: translateY(-2px);
}

/* Adjustment Card */
.adjustment-card {
  margin-top: 8px;
}

.va-card {
  background-color: rgba(24, 144, 255, 0.05);
  border-color: rgba(24, 144, 255, 0.2);
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Responsive Design adjustments for the new card design */
@media (max-width: 767px) {
  .player-name {
    max-width: 140px;
  }

  .player-details-wrapper {
    padding: 6px 10px;
  }

  .player-value {
    font-size: 14px;
    padding: 2px 6px;
  }
}

@media (max-width: 576px) {
  .player-name {
    max-width: 120px;
  }
}

/* Trade Evaluation */
.trade-evaluation {
  display: flex;
  align-items: center;
  justify-content: center;
}

.evaluation-balanced,
.evaluation-favors-a,
.evaluation-favors-b {
  width: 100%;
  text-align: center;
  border-radius: 8px;
  padding: 16px;
}

.evaluation-balanced {
  background-color: rgba(82, 196, 26, 0.1);
  border-color: #52c41a;
}

.evaluation-favors-a,
.evaluation-favors-b {
  background-color: rgba(245, 34, 45, 0.05);
  border-color: #f5222d;
}

.eval-icon {
  font-size: 24px;
  color: #52c41a;
  margin-bottom: 8px;
}

.eval-heading {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.eval-message {
  font-size: 14px;
  margin-bottom: 8px;
}

.direction-arrow {
  font-size: 20px;
  color: #f5222d;
}

/* Balancing Players */
.balancing-players-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.balancing-title {
  display: flex;
  align-items: center;
}

.balancing-title h3 {
  font-size: 16px;
  margin: 0;
}

.balancing-players-container {
  display: grid;
  /* Adjusted to ensure only 3 cards per row on larger screens */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.view-more {
  text-align: center;
  margin-top: 16px;
}

/* Responsive Design */
@media (max-width: 991px) {
  .trade-teams {
    grid-template-columns: 1fr;
  }

  .trade-evaluation {
    order: 3;
  }
}

@media (max-width: 767px) {
  .settings-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .balancing-players-container {
    grid-template-columns: 1fr; /* Just one column on mobile */
  }

  .balancing-player-name {
    font-size: 14px;
    padding-right: 40px; /* Make space for the add icon */
    max-width: calc(100% - 80px); /* Prevent overlap with value */
  }

  .player-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .player-details {
    width: 100%;
    justify-content: space-between;
    margin-top: 4px;
  }

  .remove-player {
    position: absolute;
    top: 8px;
    right: 8px;
  }

  /* Make badges more visible on mobile */
  :deep(.ant-ribbon) {
    top: 6px; /* Adjust position for mobile */
  }
}

@media (max-width: 576px) {
  .responsive-padding {
    padding: 0 12px;
  }

  .page-title h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .clear-button-container {
    justify-content: center;
    margin-top: 16px;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .balancing-players-container {
    grid-template-columns: repeat(3, 1fr); /* Force exactly 3 columns on most desktops */
  }
}

@media (min-width: 1200px) {
  .balancing-players-container {
    grid-template-columns: repeat(3, 1fr); /* Force exactly 3 columns on larger screens too */
  }
}
</style>
