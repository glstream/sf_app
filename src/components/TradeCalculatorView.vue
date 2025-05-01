<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <a-layout-content class="responsive-padding">
      <div class="page-title">
        <h1>Fantasy Football Trade Calculator</h1>
        <p class="subtitle">
          Evaluate dynasty and redraft trades with precision using our advanced fantasy football
          trade calculator
        </p>
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
          <a-card
            class="team-card"
            :bordered="false"
            :class="{
              'card-outline-balanced':
                isFairTrade && (selectedPlayers1.length > 0 || selectedPlayers2.length > 0),
              'card-outline-winning': bFavoredTrade, // Losing side (A) gets blue outline when B is favored
              'card-outline-losing': aFavoredTrade // Winning side (A) gets red outline when A is favored
            }"
          >
            <template #title>
              <div class="team-header">
                <h2>Team A</h2>
                <div
                  class="team-value"
                  :class="{ 'value-favorable': aFavoredTrade, 'value-balanced': isFairTrade }"
                >
                  <!-- Round the header value -->
                  <span v-if="selectedPlayers1.length > 0">{{
                    Math.round(totalValueSideA).toLocaleString()
                  }}</span>
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

              <!-- Value Adjustment Card: Shows bonus added by calculation -->
              <div v-if="showAdjustmentA" class="adjustment-card">
                <a-card size="small" :bordered="true" class="va-card">
                  <div class="card-content">
                    <span>Value Modifier</span>
                    <span class="player-value">+{{ Math.round(adjustmentValueA) }}</span>
                  </div>
                </a-card>
              </div>
            </div>

            <div class="team-summary">
              <div class="asset-count">
                {{ selectedPlayers1.length }} Asset{{ selectedPlayers1.length !== 1 ? 's' : '' }}
              </div>
              <div class="total-value-display">
                <!-- Display the final calculated value -->
                Total:
                <strong>{{ Math.round(totalValueSideA).toLocaleString() }}</strong>
              </div>
            </div>
          </a-card>

          <!-- Trade Evaluation & Visualizer -->
          <div class="trade-evaluation">
            <TradeBalanceVisualizer
              :valueA="totalValueSideA"
              :valueB="totalValueSideB"
              :isFair="isFairTrade"
              :balancingValue="balancingPlayerValue"
              class="balance-visualizer-spacing"
            />
          </div>

          <!-- Team B -->
          <a-card
            class="team-card"
            :bordered="false"
            :class="{
              'card-outline-balanced':
                isFairTrade && (selectedPlayers1.length > 0 || selectedPlayers2.length > 0),
              'card-outline-winning': aFavoredTrade, // Losing side (B) gets blue outline when A is favored
              'card-outline-losing': bFavoredTrade // Winning side (B) gets red outline when B is favored
            }"
          >
            <template #title>
              <div class="team-header">
                <h2>Team B</h2>
                <div
                  class="team-value"
                  :class="{ 'value-favorable': bFavoredTrade, 'value-balanced': isFairTrade }"
                >
                  <!-- Round the header value -->
                  <span v-if="selectedPlayers2.length > 0">{{
                    Math.round(totalValueSideB).toLocaleString()
                  }}</span>
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

              <!-- Value Adjustment Card: Shows bonus added by calculation -->
              <div v-if="showAdjustmentB" class="adjustment-card">
                <a-card size="small" :bordered="true" class="va-card">
                  <div class="card-content">
                    <span>Value Modifier</span>
                    <span class="player-value">+{{ Math.round(adjustmentValueB) }}</span>
                  </div>
                </a-card>
              </div>
            </div>

            <div class="team-summary">
              <div class="asset-count">
                {{ selectedPlayers2.length }} Asset{{ selectedPlayers2.length !== 1 ? 's' : '' }}
              </div>
              <div class="total-value-display">
                <!-- Display the final calculated value -->
                Total:
                <strong>{{ Math.round(totalValueSideB).toLocaleString() }}</strong>
              </div>
            </div>
          </a-card>
        </div>

        <!-- Trade Controls Card (New) -->
        <a-card class="trade-controls-card">
          <a-row :gutter="[16, 16]" align="middle">
            <a-col :xs="24" :sm="16" :md="18">
              <div class="slider-container">
                <div class="slider-label">Acceptable Trade Variance: {{ percentThreshold }}%</div>
                <a-slider v-model:value="percentThreshold" :min="1" :max="25" :step="1" />
              </div>
            </a-col>
            <a-col :xs="24" :sm="8" :md="6" class="clear-button-container">
              <a-button @click="clearCalculator" danger block>Clear Calculator</a-button>
            </a-col>
          </a-row>
        </a-card>

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
              v-for="player in displayedBalancingPlayers"
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
            <a-button type="link" @click="toggleShowAllBalancingPlayers">
              {{ showAllBalancingPlayers ? 'View Less Players' : 'View More Players' }}
            </a-button>
          </div>
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
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useMeta } from '@/composables/useMeta' // Import useMeta

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import TradeBalanceVisualizer from '@/components/TradeBalanceVisualizer.vue' // Import the new component

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
let bpv_value: number | null = null // Ensure this line is present at the top level of <script setup>
const showAllBalancingPlayers = ref(false) // New state variable

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
  const index = calculateIndex(value)
  const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value' // Determine the correct key

  if (ranksData.value && ranksData.value.length > index && index >= 0) {
    const playerAtBPVIndex = ranksData.value[index]
    // Check if player exists and has the required numeric value property
    if (playerAtBPVIndex && typeof playerAtBPVIndex[valueKey] === 'number') {
      bpv_value = playerAtBPVIndex[valueKey]
      console.log(
        `BPV updated on dropdown change to: ${bpv_value} using key ${valueKey} at index ${index}`
      )
    } else {
      console.warn(
        `Player at BPV index ${index} missing or has invalid value for key ${valueKey} on dropdown change. BPV not updated.`
      )
      bpv_value = null // Reset if data is invalid or missing
    }
  } else {
    console.warn(
      'Calculated index is out of bounds of the ranks data array on dropdown change. BPV not updated.'
    )
    bpv_value = null // Reset if index is out of bounds
  }

  // Decided against clearing calculator on BPV change, but recalculations will happen reactively.
  // clearCalculator()
}

const sources = [{ key: 'sf', name: 'FantasyNavigator', logo: fnLogo }]

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
    hash = hash & hash
  }
  return (hash % 1000) / 1000
}

function fuzzValue(value) {
  const minFuzz = 0.02
  const maxFuzz = 0.05
  const fuzzFactor = consistentHash(value) * (maxFuzz - minFuzz) + minFuzz
  return value + value * fuzzFactor * (consistentHash(value) > 0.5 ? 1 : -1)
}

const valueDifferenceA = computed(() => totalValueSideB.value - totalValueSideA.value) // Difference between final calculated values
const valueDifferenceB = computed(() => totalValueSideA.value - totalValueSideB.value) // Difference between final calculated values

const fuzzedValueDifferenceA = computed(() => fuzzValue(valueDifferenceA.value))
const fuzzedValueDifferenceB = computed(() => fuzzValue(valueDifferenceB.value))

// Raw sum of values for Team A (before calculation logic)
const rawTotalValue1 = computed(() => {
  return selectedPlayers1.value.reduce((sum, player) => {
    const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'
    return sum + (player[valueKey] || 0)
  }, 0)
})

// Raw sum of values for Team B (before calculation logic)
const rawTotalValue2 = computed(() => {
  return selectedPlayers2.value.reduce((sum, player) => {
    const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'
    return sum + (player[valueKey] || 0)
  }, 0)
})

// Calculated adjustment amount for Team A
const adjustmentValueA = computed(() => {
  return selectedPlayers1.value.length > 0 ? totalValueSideA.value - rawTotalValue1.value : 0
})

// Calculated adjustment amount for Team B
const adjustmentValueB = computed(() => {
  return selectedPlayers2.value.length > 0 ? totalValueSideB.value - rawTotalValue2.value : 0
})

// Show adjustment card for Team A if it has fewer assets than B AND a positive adjustment
const showAdjustmentA = computed(() => {
  const numA = selectedPlayers1.value.length
  const numB = selectedPlayers2.value.length
  // Show only if A has strictly fewer assets than B, both have assets, and A has a positive adjustment
  return numA > 0 && numB > 0 && numA < numB && adjustmentValueA.value > 0.1
})

// Show adjustment card for Team B if it has fewer assets than A AND a positive adjustment
const showAdjustmentB = computed(() => {
  const numA = selectedPlayers1.value.length
  const numB = selectedPlayers2.value.length
  // Show only if B has strictly fewer assets than A, both have assets, and B has a positive adjustment
  return numA > 0 && numB > 0 && numB < numA && adjustmentValueB.value > 0.1
})

const totalValueSideA = computed(() => {
  const playerValues = selectedPlayers1.value.map((player) =>
    state.checked1 ? player.sf_value : player.one_qb_value
  )
  return calculateTradeValue(playerValues)
})

const totalValueSideB = computed(() => {
  const playerValues = selectedPlayers2.value.map((player) =>
    state.checked1 ? player.sf_value : player.one_qb_value
  )
  return calculateTradeValue(playerValues)
})

const searchPlayer1 = (searchText: string) => {
  const filteredData = ranksData.value
    .filter((item) => item.player_full_name.toLowerCase().includes(searchText.toLowerCase()))
    .map((item) => ({
      label: `${item.player_full_name} - ${item._position}`,
      value: item.player_id,
      data: item
    }))

  options1.value = filteredData
}

const searchPlayer2 = (searchText: string) => {
  const filteredData = ranksData.value
    .filter((item) => item.player_full_name.toLowerCase().includes(searchText.toLowerCase()))
    .map((item) => ({
      label: `${item.player_full_name} - ${item._position}`,
      value: item.player_id,
      data: item
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

  const isPick = player.player_full_name.match(/\b(2024|2025|2026)\b/)
  const existingPlayer = sideToAdd.value.find(
    (p) => !isPick && p.player_full_name === player.player_full_name
  )

  if (!existingPlayer || isPick) {
    sideToAdd.value.push(player)
  } else {
    message.warning(`${player.player_full_name} is already on that side.`)
  }
}

function calculateTradeValue(rawPlayerValues: number[], BPV = bpv_value): number {
  // Check BPV validity *first*
  if (BPV === null || !isFinite(BPV) || BPV <= 0) {
    return 0 // Return 0 immediately if BPV is invalid
  }

  // Proceed with existing checks and logic if BPV is valid
  if (
    !Array.isArray(rawPlayerValues) ||
    rawPlayerValues.some((value) => typeof value !== 'number' || !isFinite(value))
  ) {
    return 0
  }

  if (rawPlayerValues.length === 0) {
    return 0
  }

  const sortedPlayerValues = [...rawPlayerValues].sort((a, b) => b - a)
  const topAssetValue = sortedPlayerValues[0]

  const eliteThreshold = BPV * 2.0
  const highEndThreshold = BPV * 1.2
  const starterThreshold = BPV * 0.8

  let adjustedTotalValue = 0

  sortedPlayerValues.forEach((value) => {
    let multiplier = 0.85

    if (value >= eliteThreshold) {
      multiplier = 1.15
    } else if (value >= highEndThreshold) {
      multiplier = 1.05
    } else if (value >= starterThreshold) {
      multiplier = 0.95
    }

    adjustedTotalValue += value * multiplier
  })

  if (sortedPlayerValues.length > 1) {
    if (topAssetValue >= eliteThreshold) {
      adjustedTotalValue += topAssetValue * 0.05
    } else if (topAssetValue < starterThreshold) {
      adjustedTotalValue *= 0.95
    }
  }

  return Math.max(0, adjustedTotalValue)
}

const tradeAnalysis = computed(() => {
  const valueA = totalValueSideA.value
  const valueB = totalValueSideB.value

  if (valueA === 0 && valueB === 0) {
    return {
      percentageDifference: 0,
      valueA: 0,
      valueB: 0
    }
  }

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
    percentageDifference: parseFloat(percentageDiff.toFixed(2)),
    valueA: valueA,
    valueB: valueB
  }
})

function findBalancingPlayerValue(
  currentValueSideA: number,
  currentValueSideB: number,
  BPV: number
): number {
  // Check BPV validity *first*
  if (BPV === null || !isFinite(BPV) || BPV <= 0) {
    return 0 // Return 0 immediately if BPV is invalid
  }

  const targetValue = Math.max(currentValueSideA, currentValueSideB)
  const deficitSideValue = Math.min(currentValueSideA, currentValueSideB)
  let valueDifference = targetValue - deficitSideValue

  if (valueDifference < 0.01) {
    return 0
  }

  let estimatedRawValue = valueDifference
  let low = 0
  let high = estimatedRawValue * 5

  for (let i = 0; i < 50; i++) {
    let mid = (low + high) / 2
    let calculatedValueOfAddedPlayer = calculateTradeValue([mid], BPV)
    let newDeficitSideValue = deficitSideValue + calculatedValueOfAddedPlayer

    if (Math.abs(newDeficitSideValue - targetValue) < 0.1) {
      estimatedRawValue = mid
      break
    } else if (newDeficitSideValue < targetValue) {
      low = mid
    } else {
      high = mid
    }
    estimatedRawValue = mid
  }

  return Math.max(0, estimatedRawValue)
}

const balancingPlayerValue = computed(() => {
  const valueA = totalValueSideA.value
  const valueB = totalValueSideB.value
  const BPV = bpv_value

  if (BPV === null || !isFinite(BPV) || BPV <= 0) {
    return 0
  }

  return findBalancingPlayerValue(valueA, valueB, BPV)
})

function findClosestPlayers(
  balancingRawValue,
  playersData,
  valueKey,
  selectedPlayers1,
  selectedPlayers2
) {
  const selectedPlayerNames = [
    ...selectedPlayers1.map((player) => player.player_full_name),
    ...selectedPlayers2.map((player) => player.player_full_name)
  ]

  const highestSelectedValue = Math.max(
    ...selectedPlayers1.map((player) => player[valueKey]),
    ...selectedPlayers2.map((player) => player[valueKey])
  )

  const valueLimit = balancingRawValue !== 0 ? balancingRawValue : highestSelectedValue

  const filteredPlayersData = playersData.filter(
    (player) =>
      !selectedPlayerNames.includes(player.player_full_name) && player[valueKey] <= valueLimit
  )

  const sortedPlayers = filteredPlayersData.sort(
    (a, b) => Math.abs(a[valueKey] - balancingRawValue) - Math.abs(b[valueKey] - balancingRawValue)
  )

  const closestPlayers = sortedPlayers.slice(0, 20)

  return closestPlayers
}

const closestBalancingPlayers = computed(() => {
  if (selectedPlayers1.value.length === 0 && selectedPlayers2.value.length === 0) {
    return []
  }

  const balancingRawValue = balancingPlayerValue.value
  if (balancingRawValue === 0) {
    return []
  }

  const playersData = ranksData.value
  const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'

  let closestPlayers = findClosestPlayers(
    balancingRawValue,
    playersData,
    valueKey,
    selectedPlayers1.value,
    selectedPlayers2.value
  )

  closestPlayers.sort((a, b) => b[valueKey] - a[valueKey])

  return closestPlayers
})

const displayedBalancingPlayers = computed(() => {
  if (showAllBalancingPlayers.value) {
    return closestBalancingPlayers.value
  } else {
    return closestBalancingPlayers.value.slice(0, 6)
  }
})

const toggleShowAllBalancingPlayers = () => {
  showAllBalancingPlayers.value = !showAllBalancingPlayers.value
}

const aFavored = computed(() => {
  return (
    tradeAnalysis.value.percentageDifference < percentThreshold.value &&
    valueDifferenceA.value > 0 &&
    (selectedPlayers1.value.length > 1 || selectedPlayers2.value.length > 1)
  )
})

const bFavored = computed(() => {
  // Corrected logic: Check if B's value is greater than A's value
  // and the difference is within the threshold.
  return (
    tradeAnalysis.value.percentageDifference > percentThreshold.value && // Ensure it's NOT a fair trade first
    totalValueSideB.value > totalValueSideA.value && // Check if B's value is actually higher
    (selectedPlayers1.value.length > 0 || selectedPlayers2.value.length > 0) // Ensure players are selected
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

  const balancingValue = Math.round(balancingPlayerValue.value)
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

function valueState(calculatedTeamValue, calculatedCompareToValue, percentThreshold) {
  const percDiff = tradeAnalysis.value.percentageDifference

  if (percDiff <= percentThreshold) {
    return 'fair'
  } else if (calculatedTeamValue < calculatedCompareToValue) {
    return 'behind'
  } else if (calculatedTeamValue > calculatedCompareToValue) {
    return 'ahead'
  } else {
    return 'none'
  }
}

const teamAState = computed(() =>
  valueState(totalValueSideA.value, totalValueSideB.value, percentThreshold.value)
)
const teamBState = computed(() =>
  valueState(totalValueSideB.value, totalValueSideA.value, percentThreshold.value)
)
const state = reactive({
  checked1: true,
  checked2: true
})

// SEO Metadata
useMeta({
  title: 'Fantasy Football Trade Calculator | Dynasty & Redraft Value Analysis',
  description:
    'Evaluate fantasy football trades with our advanced calculator. Compare player values from FantasyCalc, DynastyDaddy, KTC, and Dynasty Process for dynasty and redraft leagues.',
  meta: [
    {
      name: 'keywords',
      content:
        'fantasy football trade calculator, dynasty trade calculator, redraft trade calculator, sleeper trade calculator, fantasy football trade analyzer'
    },
    {
      property: 'og:title',
      content: 'Fantasy Football Trade Calculator | Dynasty & Redraft Value Analysis'
    },
    {
      property: 'og:description',
      content:
        'Analyze fantasy football trades with our comprehensive calculator. Get fair trade values with adjustments for team formats and league size.'
    },
    { property: 'og:type', content: 'website' },
    {
      property: 'og:image',
      content: new URL('@/assets/site/trade_calc.png', import.meta.url).href
    }, // Ensure this path is correct
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Fantasy Football Trade Calculator' },
    {
      name: 'twitter:description',
      content:
        'Get accurate fantasy football trade values with our advanced calculator for dynasty and redraft leagues.'
    }
  ]
})

// Add structured data for rich results
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Fantasy Football Trade Calculator',
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  description:
    'A comprehensive fantasy football trade calculator for evaluating trades in dynasty and redraft leagues with values from multiple ranking sources.',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  featureList: [
    'Dynasty and redraft rankings',
    'Superflex and 1QB league support',
    'TE premium adjustments',
    'Team size configuration',
    'Value consolidation calculations',
    'Balance trade suggestions',
    'Trade sharing on social media'
  ]
}

async function fetchRanks(platform: string, rankType: string) {
  isLoading.value = true
  tepCheck.value = false

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
      label: `${player.player_full_name} - ${player._position}`,
      value: player.player_id,
      data: player
    }))

    options2.value = [...options1.value]

    const index = calculateIndex(dropDownValue1.value)
    if (ranksData.value && ranksData.value.length > index && index >= 0) {
      const playerAtBPVIndex = ranksData.value[index]
      const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'
      if (playerAtBPVIndex && typeof playerAtBPVIndex[valueKey] === 'number') {
        bpv_value = playerAtBPVIndex[valueKey]
        console.log(`BPV recalculated to: ${bpv_value} using key ${valueKey} at index ${index}`)
      } else {
        console.warn(
          `Player at BPV index ${index} missing or has invalid value for key ${valueKey}. BPV not updated.`
        )
      }
    } else {
      console.warn(
        `Calculated index ${index} is out of bounds or ranksData is empty. BPV not updated.`
      )
      bpv_value = null
    }
  } catch (error) {
    console.error('There was an error pulling values...', error)
    ranksData.value = []
    bpv_value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRanks(platform.value, rankType.value)

  // Add structured data script to head
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(structuredData)
  script.setAttribute('data-seo-script', 'true') // Add an attribute for easier removal
  document.head.appendChild(script)
})

onUnmounted(() => {
  // Clean up structured data script
  const script = document.querySelector('script[data-seo-script="true"]')
  if (script && script.parentNode) {
    script.parentNode.removeChild(script)
  }
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
    return updatedPlayer || selectedPlayer
  })
})

watch(
  () => state.checked1,
  () => {
    const index = calculateIndex(dropDownValue1.value)
    if (ranksData.value && ranksData.value.length > index && index >= 0) {
      const playerAtBPVIndex = ranksData.value[index]
      const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'
      if (playerAtBPVIndex && typeof playerAtBPVIndex[valueKey] === 'number') {
        bpv_value = playerAtBPVIndex[valueKey]
        console.log(`BPV updated on format switch to: ${bpv_value} using key ${valueKey}`)
      } else {
        console.warn(
          `Player at BPV index ${index} missing or has invalid value for key ${valueKey} on format switch. BPV not updated.`
        )
      }
    } else {
      console.warn(`Index ${index} out of bounds on format switch. BPV not updated.`)
      bpv_value = null
    }
  }
)

const handleMenuClick: MenuProps['onClick'] = (e) => {
  platform.value = e.key
  try {
    clearCalculator()
    clearCalcMemory()
    fetchRanks(platform.value, rankType.value)
    selectedSource.value = sources.find((source) => source.key === platform.value) || sources[0]
  } catch {
    console.log('error loading leagues')
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
  /* Default to single column for mobile */
  grid-template-columns: 1fr;
  gap: 16px;
}

.team-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: fit-content;
  min-height: 350px; /* Add minimum height */
  display: flex; /* Use flexbox for better height management */
  flex-direction: column; /* Stack content vertically */
  border: 2px solid transparent; /* Default transparent border */
  transition: border-color 0.4s ease; /* Add transition for border-color */
}

/* Updated styles for card border based on trade status */
.team-card.card-outline-balanced {
  border-color: rgba(82, 196, 26, 0.5); /* Light green border */
}

.team-card.card-outline-winning {
  /* Losing side */
  border-color: rgba(24, 144, 255, 0.5); /* Light blue border */
}

.team-card.card-outline-losing {
  /* Winning side */
  border-color: rgba(245, 34, 45, 0.4); /* Light red border */
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
  min-height: 150px; /* Increased min-height slightly */
  flex-grow: 1; /* Allow container to grow */
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

/* Balancing Players Suggestions Card */
.balancing-players-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.balancing-title {
  display: flex;
  align-items: center;
}

.balancing-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.balancing-players-container {
  display: grid; /* Use grid layout */
  gap: 16px; /* Add gap between cards */
  /* Default to 1 column for mobile (implicitly or explicitly) */
  grid-template-columns: 1fr;
}

/* Trade Controls Card (New) */
.trade-controls-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slider-label {
  font-size: 14px;
  color: #5c5f6b;
  font-weight: 500;
}

.clear-button-container {
  display: flex;
  justify-content: flex-end; /* Align button to the right on larger screens */
}

@media (max-width: 576px) {
  .clear-button-container {
    justify-content: center; /* Center button on small screens */
  }
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

  .balancing-players-container {
    /* Already defaults to 1 column, but can be explicit */
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .player-name {
    max-width: 120px;
  }

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

/* Add rule for medium screens if needed, e.g., 2 columns */
@media (min-width: 768px) and (max-width: 991px) {
  .balancing-players-container {
    grid-template-columns: repeat(2, 1fr); /* Example: 2 columns for tablets */
  }
}

@media (min-width: 992px) {
  /* Styles for screens >= 992px */
  .trade-teams {
    /* Change to 3 columns grid with the middle column for evaluation */
    grid-template-columns: 1fr auto 1fr;
    grid-template-areas: 'teamA evaluation teamB';
  }

  .team-card:nth-of-type(1) {
    /* Team A - position on the left */
    grid-area: teamA;
  }

  .trade-evaluation {
    /* Evaluation in the middle */
    grid-area: evaluation;
    margin: 0 16px; /* Add horizontal margin */
    min-width: 250px; /* Ensure minimum width for visualizer */
    display: flex; /* Align visualizer */
    align-items: center; /* Center visualizer vertically */
    justify-content: center; /* Center visualizer horizontally */
  }

  .team-card:nth-of-type(2) {
    /* Team B - position on the right */
    grid-area: teamB;
  }
}

@media (max-width: 991px) {
  /* Styles for screens < 992px */
  .trade-teams {
    /* Single column layout */
    grid-template-columns: 1fr;
    grid-template-areas:
      'teamA'
      'evaluation'
      'teamB';
  }

  .team-card:nth-of-type(1) {
    grid-area: teamA;
  }

  .trade-evaluation {
    grid-area: evaluation;
    margin: 16px auto; /* Center and add vertical margin */
    min-width: 250px; /* Ensure minimum width for visualizer */
    width: 100%; /* Allow it to take full width if needed */
    max-width: 350px; /* Match visualizer max-width */
    display: flex;
    justify-content: center;
  }

  .team-card:nth-of-type(2) {
    grid-area: teamB;
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
    grid-template-columns: 1fr;
  }

  .balancing-player-name {
    font-size: 14px;
    padding-right: 40px;
    max-width: calc(100% - 80px);
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

  :deep(.ant-ribbon) {
    top: 6px;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .balancing-players-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1200px) {
  .balancing-players-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

.view-more {
  text-align: center;
  margin-top: 16px;
}
</style>
