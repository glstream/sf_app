<template>
  <a-layout class="layout">
    <AppHeader />
    <a-layout-content class="responsive-padding">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item><a href="/username">Home</a></a-breadcrumb-item>
        <a-breadcrumb-item>Trade Calculator</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="trade-calculator" style="background: #f5f5f5">
        <a-row align="left" justify="space-between">
          <a-col flex="300px">
            <div style="display: flex; align-items: center; gap: 10px">
              <a-switch
                size="large"
                v-model:checked="state.checked1"
                checked-children="Superflex"
                un-checked-children="OneQB"
              />
              <div>
                <a-radio-group v-model:value="rankType" button-style="solid">
                  <a-radio-button value="dynasty">Dynasty</a-radio-button>
                  <a-radio-button value="redraft">Redraft</a-radio-button>
                </a-radio-group>
              </div>
            </div>
          </a-col>

          <a-col :flex="auto" style="padding-bottom: 8px">
            <a-dropdown-button :loading="isLoading" options="">
              <img style="padding-right: 5px" class="dropdown-img" :src="selectedSource.logo" />
              {{ selectedSource.name }}
              <template #overlay>
                <a-menu @click="handleMenuClick">
                  <a-menu-item v-for="source in filteredSources" :key="source.key">
                    <UserOutlined />
                    <img style="padding-right: 5px" class="dropdown-img" :src="source.logo" />{{
                      source.name
                    }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown-button>
          </a-col>
        </a-row>
        <a-row :gutter="16" class="teams">
          <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <a-card>
              <h3>Team A gets...</h3>
              <div class="search-bar-container">
                <a-auto-complete
                  v-model:value="value1"
                  :options="options1"
                  :allow-clear="true"
                  style="width: 100%"
                  placeholder="Search for player"
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
                  <a-card size="small" :bordered="true">
                    <div class="card-content">
                      <span>{{ player.player_full_name }}</span>
                      <span class="player-value">{{
                        state.checked1 ? player.sf_value : player.one_qb_value
                      }}</span>
                      <!-- Delete Icon placed at the top-right corner of the card -->
                      <CloseCircleTwoTone
                        class="close-icon"
                        two-tone-color="#f94144"
                        @click.stop="removePlayer1(index)"
                      />
                    </div>
                  </a-card>
                </a-badge-ribbon>
              </div>
              <div class="total-assets-container">
                <div class="total-pieces">{{ selectedPlayers1.length }} Total Assets</div>
                <div class="total-value">Total Value: {{ totalValue1.toLocaleString() }}</div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
            <a-card>
              <h3>Team B gets...</h3>
              <div class="search-bar-container">
                <a-auto-complete
                  v-model:value="value2"
                  :options="options2"
                  :allow-clear="true"
                  style="width: 100%"
                  placeholder="Search for player"
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
                  <a-card size="small" :bordered="true">
                    <div class="card-content">
                      <span>{{ player.player_full_name }}</span>
                      <span class="player-value">{{
                        state.checked1 ? player.sf_value : player.one_qb_value
                      }}</span>
                      <CloseCircleTwoTone
                        class="close-icon"
                        two-tone-color="#f94144"
                        @click.stop="removePlayer2(index)"
                      />
                    </div>
                  </a-card>
                </a-badge-ribbon>
              </div>
              <div class="total-assets-container">
                <div class="total-value">{{ selectedPlayers2.length }} Total Assets</div>
                <div class="total-value">Total Value: {{ totalValue2.toLocaleString() }}</div>
              </div>
            </a-card>
          </a-col>
        </a-row>
        <div class="trade-comparison" style="padding-top: 10px">
          <a-row type="flex" justify="center" style="padding-bottom: 10px">
            <a-col :span="12">
              <div
                v-if="selectedPlayers1.length > 0 || selectedPlayers2.length > 0"
                :class="{
                  'status-message': true,
                  'fair-trade': isFairTrade,
                  'favored-trade': isFavoredTrade,
                  'a-favored-trade': isAfavored
                }"
              >
                <ArrowLeftOutlined v-if="bFavoredTrade" class="arrow-icon" />
                {{ tradeStatusMessage }}
                <ArrowRightOutlined v-if="aFavoredTrade" class="arrow-icon" />
              </div>
            </a-col>
          </a-row>
          <a-collapse :bordered="false" style="background: rgb(255, 255, 255)"
            ><a-collapse-panel key="1" header="Options" :style="customStyle">
              <a-row type="flex" justify="left">
                <a-col :span="8">
                  <div class="slider-label">Acceptable Variance</div>
                  <a-slider max="50" v-model:value="percentThreshold" class="flex-item slider" />
                  <span> {{ percentThreshold }}%</span>
                </a-col>
              </a-row>
            </a-collapse-panel>
          </a-collapse>
          <div
            v-if="percentageDifference > percentThreshold && closestBalancingPlayers.length > 0"
            class="nearest-players"
          >
            <a-card>
              <h3>Nearest Players to Balancing Value</h3>
              <div
                v-for="player in closestBalancingPlayers"
                :key="player.player_full_name"
                class="player-card"
              >
                <a-card size="small" :bordered="true">
                  <div class="card-content">
                    <span>{{ player.player_full_name }}</span>
                    <span class="player-value">{{
                      state.checked1 ? player.sf_value : player.one_qb_value
                    }}</span>
                    <PlusCircleTwoTone class="close-icon" @click.stop="addPlayerToTrade(player)" />
                  </div>
                </a-card>
              </div>
            </a-card>
          </div>
        </div>

        <div class="actions">
          <a-space :size="48">
            <a-button type="primary">Copy Trade URL</a-button>
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
import { useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// 3rd Party imports
import axios from 'axios'
import { message, Spin, Column, Empty, MenuProps } from 'ant-design-vue'
import {
  CloseCircleOutlined,
  DeleteFilled,
  CloseSquareFilled,
  CloseSquareTwoTone,
  MinusCircleFilled,
  CloseCircleFilled,
  CloseCircleTwoTone,
  PlusCircleTwoTone,
  ArrowRightOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'
import Slider from 'primevue/slider'

import 'ant-design-vue/dist/reset.css'

const percentThreshold = ref<number>(10)

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

const sources = [
  { key: 'sf', name: 'SuperFlex', logo: 'src/assets/sourceLogos/sf.png' },
  { key: 'ktc', name: 'KeepTradeCut', logo: 'src/assets/sourceLogos/ktc.png' },
  { key: 'dp', name: 'DynastyProcess', logo: 'src/assets/sourceLogos/dp.png' },
  { key: 'fc', name: 'FantasyCalc', logo: 'src/assets/sourceLogos/fc.png' }
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

interface TeamA {
  value: string
}
interface TeamB {
  age: string
}

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
  options1.value = []
  if (!searchText) {
    options1.value = []
  } else {
    const filteredData = ranksData.value
      .filter((item) => item.player_full_name.toLowerCase().includes(searchText.toLowerCase()))
      .map((item) => ({
        label: item.player_full_name, // display name
        value: item.player_full_name, // unique identifier
        data: item // keep the full player data
      }))

    options1.value = filteredData
  }
}

const searchPlayer2 = (searchText: string) => {
  options2.value = []
  if (!searchText) {
    options2.value = []
  } else {
    const filteredData = ranksData.value
      .filter((item) => item.player_full_name.toLowerCase().includes(searchText.toLowerCase()))
      .map((item) => ({
        label: item.player_full_name, // display name
        value: item.player_full_name, // unique identifier
        data: item // keep the full player data
      }))

    options2.value = filteredData
  }
}

const selectPlayer1 = (playerName: string) => {
  const player = ranksData.value.find((item) => item.player_full_name === playerName)
  if (
    player &&
    !selectedPlayers1.value.some((p) => p.player_full_name === player.player_full_name)
  ) {
    selectedPlayers1.value.push(player)
  }
  value1.value = '' // Optionally clear the search box after selection
}

const selectPlayer2 = (playerName: string) => {
  const player = ranksData.value.find((item) => item.player_full_name === playerName)
  if (
    player &&
    !selectedPlayers2.value.some((p) => p.player_full_name === player.player_full_name)
  ) {
    selectedPlayers2.value.push(player)
  }
  value2.value = '' // Optionally clear the search box after selection
}

const removePlayer1 = (index) => {
  selectedPlayers1.value.splice(index, 1) // Remove the player at the specified index
}

const removePlayer2 = (index) => {
  selectedPlayers2.value.splice(index, 1) // Remove the player at the specified index
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
  // Determine which side has a lower total value
  const sideToAdd =
    totalValueSideA.value <= totalValueSideB.value ? selectedPlayers1 : selectedPlayers2

  // Add the player to the appropriate list if they're not already included
  const existingPlayer = sideToAdd.value.find((p) => p.player_full_name === player.player_full_name)
  if (!existingPlayer) {
    sideToAdd.value.push(player)
  }
}

const totalValueSideA = computed(() => {
  // Extract the relevant player values based on the current switch state
  const playerValues = selectedPlayers1.value.map((player) =>
    state.checked1 ? player.sf_value : player.one_qb_value
  )

  // Calculate the trade value with the new function
  return calculateTradeValue(playerValues)
})

const totalValueSideB = computed(() => {
  // Extract the relevant player values based on the current switch state
  const playerValues = selectedPlayers2.value.map((player) =>
    state.checked1 ? player.sf_value : player.one_qb_value
  )

  // Calculate the trade value with the new function
  return calculateTradeValue(playerValues) // You can adjust k if needed
})

const k_value = 1.05
const bpv_value = 50

function calculateTradeValue(
  playerValues: number[],
  k: number = k_value,
  BPV: number = bpv_value
): number {
  // Validate input
  if (
    !Array.isArray(playerValues) ||
    playerValues.some((value) => typeof value !== 'number' || !isFinite(value))
  ) {
    console.error('Invalid input: playerValues must be an array of finite numbers.')
    return 0
  }
  if (typeof k !== 'number' || !isFinite(k)) {
    console.error('Invalid input: k must be a finite number.')
    return 0
  }

  // Calculate the trade value using the power curve and DRS component
  const tradeValue = playerValues.reduce((total, value) => {
    // Power Curve Component
    const powerCurveValue = Math.pow(value, k)

    // DRS Component
    const DRSValue = BPV + Math.pow((powerCurveValue - BPV) / BPV, 2) * BPV

    // Ensure that the DRSValue is not negative
    const adjustedValue = Math.max(0, DRSValue)

    return total + adjustedValue
  }, 0)

  return tradeValue
}

const valueDifference = computed(() => {
  // Use Math.abs for absolute difference or remove it to retain the sign
  return totalValueSideA.value - totalValueSideB.value
})

const percentageDifference = computed(() => {
  const valueA = totalValueSideA.value
  const valueB = totalValueSideB.value
  const averageValue = (valueA + valueB) / 2

  if (averageValue === 0) {
    // Prevent division by zero if both sides have a value of 0
    return 0
  }

  const difference = Math.abs(valueA - valueB)
  const percentageDiff = (difference / averageValue) * 100

  // You can use toFixed() to limit the number of decimal places, if desired
  return percentageDiff.toFixed(2) // This will keep two decimal places
})

function findBalancingPlayerValue(
  totalValueSideA: number,
  totalValueSideB: number,
  k: number,
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
    estimatedTradeValue = calculateTradeValue([estimateValue], k, BPV)

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
  const k = k_value
  const BPV = bpv_value // The baseline player value for the DRS formula

  console.log(valueA, valueB, k, BPV)

  return findBalancingPlayerValue(valueA, valueB, k, BPV)
})

function findClosestPlayers(
  balancingValue: number,
  playersData: any[],
  valueKey: string,
  selectedPlayers1: any[],
  selectedPlayers2: any[]
): any[] {
  // Create a combined array of selected player names for exclusion
  const selectedPlayerNames = [
    ...selectedPlayers1.map((player) => player.player_full_name),
    ...selectedPlayers2.map((player) => player.player_full_name)
  ]

  // Filter the playersData to exclude already selected players
  const filteredPlayersData = playersData.filter(
    (player) => !selectedPlayerNames.includes(player.player_full_name)
  )

  // Sort the remaining players by the absolute difference from the balancing value
  const sortedPlayers = filteredPlayersData.sort(
    (a, b) => Math.abs(a[valueKey] - balancingValue) - Math.abs(b[valueKey] - balancingValue)
  )

  // Then, get the five closest players
  const closestPlayers = sortedPlayers.slice(0, 4)

  return closestPlayers
}

const closestBalancingPlayers = computed(() => {
  // If no players are selected on either side, return an empty array
  if (selectedPlayers1.value.length === 0 && selectedPlayers2.value.length === 0) {
    return []
  }

  const balancingValue = balancingPlayerValue.value
  // If the balancing value is 0 (which means sides are even or no player is selected), return an empty array
  if (balancingValue === 0) {
    return []
  }

  const playersData = ranksData.value
  const valueKey = state.checked1 ? 'sf_value' : 'one_qb_value'

  return findClosestPlayers(
    balancingValue,
    playersData,
    valueKey,
    selectedPlayers1.value,
    selectedPlayers2.value
  )
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

  const valueA = totalValueSideA.value
  const valueB = totalValueSideB.value
  const diff = Math.abs(valueA - valueB)
  const avg = (valueA + valueB) / 2
  const percentageDiff = avg > 0 ? (diff / avg) * 100 : 0

  if (percentageDiff <= percentThreshold.value) {
    return {
      message: 'The trade is fair',
      isFair: true,
      isFavored: false,
      aFavored: false,
      bFavored: false
    }
  }

  const balancingValue = Math.round(balancingPlayerValue.value) // Round the balancing value to the nearest whole number
  if (valueA > valueB) {
    return {
      message: `Team A is favored. Add roughly ${balancingValue.toLocaleString()} to even trade.`,
      isFair: false,
      isFavored: true,
      aFavored: true,
      bFavored: false
    }
  } else if (valueA < valueB) {
    return {
      message: `Team B is favored. Add roughly ${balancingValue.toLocaleString()} to even trade.`,
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
const isFavoredTrade = computed(() => tradeStatus.value.isFavored)
const tradeStatusMessage = computed(() => tradeStatus.value.message)

const tradeFairnessType = computed(() => {
  // Example logic to determine the type of alert based on the trade status
  const valueA = totalValueSideA.value
  const valueB = totalValueSideB.value
  const diff = Math.abs(valueA - valueB)
  const avg = (valueA + valueB) / 2
  const percentageDiff = avg > 0 ? (diff / avg) * 100 : 0

  if (percentageDiff <= percentThreshold.value) {
    return 'green' // for fair trade
  }
  return 'red' // for unfair trade
})

const state = reactive({
  checked1: true,
  checked2: true
})

async function fetchRanks(platform: string, rankType: string) {
  isLoading.value = true
  ranksData.value = []

  try {
    const response = await axios.get(`http://20.242.213.253:3100/trade_calculator/`, {
      params: {
        platform: platform,
        rank_type: rankType
      }
    })
    console.log('Pulling Player Values...')
    ranksData.value = response.data
    console.log(ranksData.value)
  } catch (error) {
    console.log('There was an error pulling values...', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchRanks(platform.value, rankType.value)
})

// Watch the rankType and fetch ranks whenever it changes
watch(rankType, (newRankType) => {
  fetchRanks(platform.value, newRankType)
})

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
  console.log(e.key)
  const platform = e.key
  try {
    clearCalculator()
    clearCalcMemory()
    fetchRanks(platform, rankType.value) // Ensure fetchRanks is awaited if it's asynchronous
    selectedSource.value = sources.find((source) => source.key === platform) || sources[0]
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
  } else if (position === 'Pick') {
    return 'rgb(70, 70, 70, .6)'
  } else {
    return 'rgb(0, 0, 0, .00)'
  }
}
</script>

<style scoped>
.trade-calculator {
  padding: 24px;
  background: #fff;
  border-radius: 2px;
}

.switches {
  margin-bottom: 24px;
  text-align: left;
}

.team-box {
  padding: 16px;
  background: #f0f2f5;
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

.dropdown-img {
  width: 24px;
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 24px;
}

.player-value {
  font-weight: bold;
  margin-left: auto;
  padding-right: 8px;
}
.player-card {
  margin-bottom: 5px; /* Adds space between cards */
  position: relative; /* For absolute positioning of the close icon */
}

.player-card .close-icon {
  position: absolute;
  top: 15px; /* Position the icon slightly inside the card boundary */
  left: -7px; /* Position the icon on the left side of the card */
  cursor: pointer; /* Change cursor to indicate it's clickable */
  z-index: 10; /* Ensure the icon is above other elements */
}

.player-card .a-card {
  padding-left: 24px; /* Add padding to prevent content from hiding behind the icon */
  transition: box-shadow 0.3s; /* Smooth transition for hover effect */
}

.player-card .a-card:hover {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* Example hover effect */
}

.total-value {
  margin-top: 24px;
  text-align: center;
  font-weight: bold;
}
.search-bar-container {
  /* Other styles for the search bar container might already be here */
  margin-bottom: 20px; /* Adjust the value as needed for desired spacing */
}
.trade-comparison .a-alert {
  margin-top: 20px; /* Adds some space above the alert */
  margin-bottom: 20px; /* Adds some space below the alert */
  text-align: center; /* Centers the text inside the alert */
}

.slider-container {
  margin: 20px 0; /* Adds top and bottom margin for the slider container */
}

.slider-label {
  text-align: center; /* Centers the label text */
  margin-bottom: 10px; /* Space between the label and the slider */
  font-weight: bold; /* Makes the label text bold */
}
.nearest-players {
  max-width: 450px; /* Maximum width of the div */
  width: 100%; /* Makes the width responsive to the container */
  margin: 0 auto; /* Centers the div */
  padding: 20px; /* Optional: Adds some padding inside the div */
}

@media (max-width: 450px) {
  .nearest-players {
    width: auto; /* Allows the div to adjust to the screen size below 500px */
    padding: 10px; /* Reduces padding on smaller screens */
  }
}

.status-message {
  padding: 16px;
  border-radius: 4px;
  text-align: center;
  font-size: 1.2em;
}

.fair-trade {
  background-color: #f6ffedc1; /* A green tint */
  color: #52c41a; /* A green color */
  border: 1px solid #52c41a;
}

.favored-trade {
  background-color: #ffedede6; /* Red color for favored trade */
  color: #f94144; /* White text color */
  border: 1px solid #f94144;
}

.total-assets-container {
  display: flex;
  justify-content: space-between;
  align-items: center; /* This will vertically align them if they have different heights */
  padding: 0.5em 0; /* Add some padding if needed */
}

/* This is the base style, for mobile screens */
.responsive-padding {
  padding: 0 5px; /* Small padding for small screens */
}

/* Media query for screens wider than 768px */
@media (min-width: 768px) {
  .responsive-padding {
    padding: 0 300px; /* Larger padding for larger screens */
  }
}
</style>
