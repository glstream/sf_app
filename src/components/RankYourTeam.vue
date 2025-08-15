<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <a-layout-content class="responsive-padding">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Rate My Team</h1>
        <p class="page-subtitle">
          Build your roster and see how your team rates with our comprehensive scoring system
        </p>
      </div>

      <!-- Settings Section -->
      <div class="settings-section">
        <a-card class="settings-card">
          <div class="settings-row">
            <div class="settings-group">
              <label>League Type:</label>
              <a-radio-group v-model:value="rankType" @change="handleSettingsChange">
                <a-radio-button value="dynasty">Dynasty</a-radio-button>
                <a-radio-button value="redraft">Redraft</a-radio-button>
              </a-radio-group>
            </div>

            <div class="settings-group">
              <label>Format:</label>
              <a-switch
                v-model:checked="isSuperflex"
                checked-children="Superflex"
                un-checked-children="1QB"
                @change="handleSettingsChange"
              />
            </div>

            <div class="settings-group">
              <label>Actions:</label>
              <a-button
                type="primary"
                danger
                @click="clearEntireTeam"
                :disabled="getTotalPlayersCount() === 0"
                size="default"
              >
                <ClearOutlined />
                Clear Team
              </a-button>
            </div>
          </div>
        </a-card>
      </div>

      <a-row :gutter="[40, 24]">
        <!-- Left Side: Roster Builder -->
        <a-col :xs="24" :md="16">
          <div class="roster-builder">
            <div class="roster-header">
              <h2>Build Your Roster</h2>
              <a-button type="link" @click="showPositionEditor = true">
                <EditOutlined /> Customize Positions
              </a-button>
            </div>

            <!-- Position Groups -->
            <div class="position-groups" :class="{ 'loading-overlay': playersLoading }">
              <!-- Loading Skeleton -->
              <div v-if="playersLoading" class="skeleton-overlay">
                <a-spin size="large" tip="Loading players...">
                  <div class="skeleton-content">
                    <div v-for="n in 5" :key="'skeleton-' + n" class="skeleton-group">
                      <div class="skeleton-header">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-value"></div>
                      </div>
                      <div class="skeleton-slots">
                        <div
                          v-for="slot in 3"
                          :key="'skeleton-slot-' + slot"
                          class="skeleton skeleton-card"
                        ></div>
                      </div>
                    </div>
                  </div>
                </a-spin>
              </div>

              <!-- Actual Content -->
              <div
                v-for="group in rosterConfiguration"
                :key="group.position"
                class="position-group"
                :style="{
                  backgroundColor: getCardPositionColor(group.position),
                  borderColor: getPositionColor(group.position),
                  borderLeftWidth: '4px',
                  borderLeftStyle: 'solid'
                }"
              >
                <div class="position-header">
                  <h4 :style="{ color: getPositionColor(group.position) }">
                    {{ group.label }} ({{ group.count }})
                  </h4>
                  <span class="position-grade">
                    Grade: {{ getPositionalGrade(group.position) }}
                  </span>
                </div>

                <div class="player-slots">
                  <div
                    v-for="(slot, index) in getSlots(group.position, group.count)"
                    :key="`${group.position}-${index}`"
                    class="player-slot-autocomplete"
                  >
                    <div v-if="!slot.player" class="empty-slot-autocomplete">
                      <a-auto-complete
                        v-model:value="slot.searchValue"
                        :options="getFilteredOptions()"
                        :placeholder="`Select ${group.label}`"
                        :filter-option="false"
                        :disabled="playersLoading"
                        @search="(value) => handlePlayerSearch(value, group.position)"
                        @select="(value) => selectPlayerFromDropdown(value, group.position, index)"
                        @focus="() => handleSearchFocus(group.position)"
                        @blur="handleSearchBlur"
                        class="player-autocomplete"
                        size="default"
                      />
                      <div v-if="playersLoading" class="loading-indicator">Loading players...</div>
                    </div>

                    <div
                      v-else
                      class="selected-player-compact"
                      :style="{
                        borderLeft: `4px solid ${getPositionColor(slot.player.position)}`,
                        backgroundColor: getStrongCardPositionColor(slot.player.position),
                        border: `1px solid ${getPositionColor(slot.player.position)}20`
                      }"
                    >
                      <div class="player-info-compact">
                        <span class="player-name-compact clickable-player" @click="showPlayerModal(slot.player)">{{ slot.player.full_name }}</span>
                        <span class="player-details-compact">
                          <span
                            class="player-position-compact"
                            :style="{ color: getPositionColor(slot.player.position) }"
                          >
                            {{ slot.player.position }}
                          </span>
                          - {{ slot.player.team }}
                        </span>
                      </div>
                      <div class="player-value-compact">
                        {{ (slot.player.value || 0).toLocaleString() }}
                      </div>
                      <a-button
                        type="text"
                        size="small"
                        @click="removePlayer(group.position, index)"
                        class="remove-btn-compact"
                      >
                        <DeleteOutlined />
                      </a-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-col>

        <!-- Right Side: Team Score -->
        <a-col :xs="24" :md="8">
          <div class="team-score-card">
            <h3>Team Score</h3>
            <div class="score-display">
              <div class="score-number">
                {{ isRosterComplete() ? teamScore + '/100' : '– –/100' }}
              </div>
              <div class="score-grade">{{ isRosterComplete() ? getScoreGrade() : '– –' }}</div>
            </div>
            <div class="score-message">
              {{ getScoreMessage() }}
            </div>

            <!-- Draft Analysis Toggle -->
            <div
              v-if="draftScore && getSelectedPlayers().length >= 1"
              class="draft-analysis-toggle"
            >
              <a-button type="link" @click="showDraftAnalysis = !showDraftAnalysis" size="small">
                <span v-if="!showDraftAnalysis">📊 Show Draft Analysis</span>
                <span v-else>📊 Hide Draft Analysis</span>
              </a-button>
            </div>

            <!-- Draft Analysis Section -->
            <div v-if="showDraftAnalysis && draftScore" class="draft-analysis">
              <h4>Player Rankings Analysis</h4>
              <div class="draft-summary">
                <div class="draft-explanation">{{ draftScore.explanation }}</div>
              </div>

              <div class="pick-analysis">
                <div
                  v-for="(analysis, index) in draftScore.pickAnalysis"
                  :key="index"
                  class="pick-item"
                  :style="{
                    borderLeft: `4px solid ${getPositionColor(analysis.player.position)}`,
                    backgroundColor: getStrongCardPositionColor(analysis.player.position),
                    border: `1px solid ${getPositionColor(analysis.player.position)}20`
                  }"
                >
                  <div class="pick-header">
                    <span class="pick-player clickable-player" @click="showPlayerModal(analysis.player)">{{ analysis.player.full_name }}</span>
                    <span
                      class="pick-position"
                      :style="{ color: getPositionColor(analysis.player.position) }"
                    >
                      {{ analysis.player.position }}
                    </span>
                  </div>
                  <div class="pick-details">
                    <span class="pick-stat">
                      <span class="stat-label">Overall:</span>
                      <span class="stat-value">#{{ analysis.overallRank }}</span>
                    </span>
                    <span class="pick-stat">
                      <span class="stat-label">Position:</span>
                      <span class="stat-value"
                        >{{ analysis.player.position }}{{ analysis.positionalRank }}</span
                      >
                    </span>
                    <span class="pick-stat">
                      <span class="stat-label">Round:</span>
                      <span class="stat-value">{{ addOrdinalSuffix(analysis.roundPosition) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Score Breakdown -->
            <div class="score-breakdown">
              <h4>Position Breakdown</h4>
              <div
                v-for="group in rosterConfiguration"
                :key="group.position"
                class="breakdown-item"
                :style="{
                  backgroundColor: getStrongCardPositionColor(group.position),
                  border: `1px solid ${getPositionColor(group.position)}20`
                }"
              >
                <span class="position-name" :style="{ color: getPositionColor(group.position) }">
                  {{ group.label }}
                </span>
                <span class="position-score">
                  {{ getPositionGroupValue(group.position).toLocaleString() }} ({{
                    getPositionalGrade(group.position)
                  }})
                </span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- Position Editor Modal -->
      <a-modal
        v-model:visible="showPositionEditor"
        title="Customize Roster Positions"
        @ok="savePositionConfiguration"
        @cancel="showPositionEditor = false"
      >
        <div class="position-editor">
          <div
            v-for="group in editableRosterConfiguration"
            :key="group.position"
            class="position-edit-row"
          >
            <span class="position-label">{{ group.label }}</span>
            <a-input-number v-model:value="group.count" :min="0" :max="10" size="small" />
          </div>
        </div>
      </a-modal>
    </a-layout-content>

    <!-- Player History Modal -->
    <PlayerHistoryModal 
      ref="playerModalRef"
      :isSuperflex="isSuperflex" 
      :isDynasty="rankType === 'dynasty'" 
      platform="sf"
    />

    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from 'axios'

// Components
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import PlayerHistoryModal from '@/components/PlayerHistoryModal.vue'

// Icons
import { DeleteOutlined, EditOutlined, ClearOutlined } from '@ant-design/icons-vue'

// Draft Simulator
import { DraftSimulator } from '@/utils/draftSimulator'

// Reactive data
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const rankType = ref('dynasty')
const isSuperflex = ref(true)
const showPositionEditor = ref(false)
const playersLoading = ref(false)

// Roster configuration - editable positions
const defaultRosterConfiguration = [
  { position: 'QB', label: 'Quarterback', count: 1 },
  { position: 'RB', label: 'Running Back', count: 2 },
  { position: 'WR', label: 'Wide Receiver', count: 2 },
  { position: 'TE', label: 'Tight End', count: 1 },
  { position: 'FLEX', label: 'Flex (RB/WR/TE)', count: 3 }
]

const rosterConfiguration = ref([...defaultRosterConfiguration])
const editableRosterConfiguration = ref([...defaultRosterConfiguration])

// Roster slots storage
const rosterSlots = reactive({})

// Player data
const allPlayers = ref([])
const playerOptions = ref([])

// Draft simulation
const draftSimulator = ref(null)
const draftScore = ref(null)
const showDraftAnalysis = ref(false)

// Player modal ref
const playerModalRef = ref(null)

// Initialize roster slots
const initializeRosterSlots = () => {
  rosterConfiguration.value.forEach((group) => {
    if (!rosterSlots[group.position]) {
      rosterSlots[group.position] = Array(group.count)
        .fill(null)
        .map(() => ({ player: undefined }))
    } else {
      // Adjust array length if count changed
      const currentLength = rosterSlots[group.position].length
      if (currentLength < group.count) {
        rosterSlots[group.position].push(
          ...Array(group.count - currentLength)
            .fill(null)
            .map(() => ({ player: undefined }))
        )
      } else if (currentLength > group.count) {
        rosterSlots[group.position] = rosterSlots[group.position].slice(0, group.count)
      }
    }
  })
}

// Get slots for a position
const getSlots = (position, count) => {
  if (!rosterSlots[position]) {
    rosterSlots[position] = Array(count)
      .fill(null)
      .map(() => ({
        player: undefined,
        searchValue: ''
      }))
  }
  return rosterSlots[position]
}

// Remove player
const removePlayer = (position, index) => {
  if (rosterSlots[position] && rosterSlots[position][index]) {
    rosterSlots[position][index].player = undefined
    rosterSlots[position][index].searchValue = ''
  }
}

// Handle player search for autocomplete (enhanced with ranking)
const handlePlayerSearch = (searchValue, position) => {
  if (!searchValue || searchValue.trim().length === 0) {
    // If empty search, show top players instead of hiding
    playerOptions.value = getTopPlayersByPosition(position, 40)
    return
  }

  // Get filtered players that match the search text
  const matchingPlayers = allPlayers.value.filter((player) =>
    player.full_name.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Filter by position requirements
  let positionFiltered = matchingPlayers
  if (position === 'FLEX') {
    positionFiltered = matchingPlayers.filter((player) =>
      ['RB', 'WR', 'TE'].includes(player.position)
    )
  } else {
    positionFiltered = matchingPlayers.filter((player) => player.position === position)
  }

  // Sort by value in descending order (highest first) - key improvement!
  positionFiltered.sort((a, b) => (b.value || 0) - (a.value || 0))

  // Create a Map to ensure unique player selection options
  const uniquePlayerMap = new Map()

  positionFiltered.forEach((player) => {
    const uniqueKey = `${player.player_id}`

    if (!uniquePlayerMap.has(uniqueKey)) {
      uniquePlayerMap.set(uniqueKey, {
        value: player.player_id,
        label: `${player.full_name} - ${player.position} (${player.team}) - ${player.value || 0}`,
        player: player
      })
    }
  })

  // Convert Map values to array and limit results to top 40
  playerOptions.value = Array.from(uniquePlayerMap.values()).slice(0, 40)

  // console.log removed for production
}

// Select player from autocomplete dropdown (matching TradeCalculatorView pattern)
const selectPlayerFromDropdown = (playerId, position, index) => {
  const player = allPlayers.value.find((item) => item.player_id === playerId)

  if (player && rosterSlots[position]) {
    // Check if player is already selected in this position group to avoid duplicates
    const isAlreadySelected = rosterSlots[position].some(
      (slot) => slot.player?.player_id === player.player_id
    )

    // Allow special years (draft picks) to be selected multiple times
    const hasSpecialYear =
      player.full_name.includes('2025') ||
      player.full_name.includes('2026') ||
      player.full_name.includes('2027')

    if (!isAlreadySelected || hasSpecialYear) {
      rosterSlots[position][index].player = { ...player }
      rosterSlots[position][index].searchValue = player.full_name
      // console.log removed for production
    } else {
      // console.log removed for production
    }

    // Clear the options dropdown
    playerOptions.value = []
  }
}

// Get top players by position for initial suggestions
const getTopPlayersByPosition = (position, limit = 40) => {
  let filtered = [...allPlayers.value]

  // Filter by position
  if (position === 'FLEX') {
    filtered = filtered.filter((player) => ['RB', 'WR', 'TE'].includes(player.position))
  } else {
    filtered = filtered.filter((player) => player.position === position)
  }

  // Sort by value in descending order (highest first)
  filtered.sort((a, b) => (b.value || 0) - (a.value || 0))

  // Convert to options format and limit results
  return filtered.slice(0, limit).map((player) => ({
    value: player.player_id,
    label: `${player.full_name} - ${player.position} (${player.team}) - ${player.value || 0}`,
    player: player
  }))
}

// Handle search focus - show top players immediately
const handleSearchFocus = (position) => {
  // Show top players immediately when focusing
  playerOptions.value = getTopPlayersByPosition(position, 40)
  // console.log removed for production
}

// Handle search blur - clear options when clicking away
const handleSearchBlur = () => {
  // Clear options after a short delay to allow selection
  setTimeout(() => {
    playerOptions.value = []
  }, 200)
}

// Get filtered options for autocomplete
const getFilteredOptions = () => {
  return playerOptions.value
}

// Clear entire team - simple one-click action
const clearEntireTeam = () => {
  Object.keys(rosterSlots).forEach((position) => {
    rosterSlots[position].forEach((slot) => {
      slot.player = undefined
      slot.searchValue = ''
    })
  })
  // console.log removed for production
}

// Get total players count
const getTotalPlayersCount = () => {
  let count = 0
  Object.keys(rosterSlots).forEach((position) => {
    rosterSlots[position].forEach((slot) => {
      if (slot.player) count++
    })
  })
  return count
}

// Get total roster slots configured
const getTotalRosterSlots = () => {
  return rosterConfiguration.value.reduce((total, group) => total + group.count, 0)
}

// Check if entire roster is filled
const isRosterComplete = () => {
  return getTotalPlayersCount() === getTotalRosterSlots()
}

// Fetch players from API (using FantasyNavigator only)
const fetchPlayers = async () => {
  playersLoading.value = true
  // console.log removed for production

  try {
    const response = await axios.get(`${apiUrl}/trade_calculator`, {
      params: {
        platform: 'sf', // Always use FantasyNavigator
        rank_type: rankType.value
      }
    })

    // console.log removed for production

    // Transform the data to match our interface
    allPlayers.value = response.data.map((player) => ({
      player_id: player.player_id,
      full_name: player.player_full_name,
      position: player._position,
      team: player.team,
      age: player.age,
      sf_value: player.sf_value,
      one_qb_value: player.one_qb_value,
      value: getCurrentPlayerValue(player)
    }))

    // console.log removed for production

    // Initialize draft simulator
    draftSimulator.value = new DraftSimulator(allPlayers.value)
    // console.log removed for production
  } catch (error) {
    console.error('❌ Error fetching players:', error)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
  } finally {
    playersLoading.value = false
  }
}

// Get current player value based on format
const getCurrentPlayerValue = (player) => {
  return isSuperflex.value ? player.sf_value || 0 : player.one_qb_value || 0
}

// Handle settings change (format or league type)
const handleSettingsChange = async () => {
  // console.log removed for production

  // If league type changed, refetch data (this gets new data for dynasty vs redraft)
  await fetchPlayers()

  // Update existing selected players' values
  updateSelectedPlayersValues()

  // console.log removed for production
}

// Update values for already selected players based on new data
const updateSelectedPlayersValues = () => {
  Object.keys(rosterSlots).forEach((position) => {
    rosterSlots[position].forEach((slot) => {
      if (slot.player) {
        // Find the updated player data from allPlayers
        const updatedPlayer = allPlayers.value.find((p) => p.player_id === slot.player.player_id)
        if (updatedPlayer) {
          // Update all the values from the fresh data
          slot.player.sf_value = updatedPlayer.sf_value
          slot.player.one_qb_value = updatedPlayer.one_qb_value
          slot.player.value = updatedPlayer.value
          slot.player.team = updatedPlayer.team
          slot.player.age = updatedPlayer.age
        }
      }
    })
  })
}

// Get position group total value
const getPositionGroupValue = (position) => {
  if (!rosterSlots[position]) return 0
  return rosterSlots[position].reduce((sum, slot) => {
    return sum + (slot.player?.value || 0)
  }, 0)
}

// Get fantasy positional grade
const getPositionalGrade = (position) => {
  if (!rosterSlots[position]) return '–'

  const slots = rosterSlots[position].filter((slot) => slot.player)
  if (slots.length === 0) return '–'

  const totalValue = slots.reduce((sum, slot) => sum + (slot.player?.value || 0), 0)
  const avgValue = totalValue / slots.length

  // Position-specific grading thresholds
  let thresholds
  if (position === 'QB') {
    thresholds = isSuperflex.value
      ? { A: 4500, B: 3500, C: 2500, D: 1500, F: 0 }
      : { A: 3000, B: 2200, C: 1500, D: 800, F: 0 }
  } else if (position === 'RB') {
    thresholds = { A: 4000, B: 3000, C: 2000, D: 1000, F: 0 }
  } else if (position === 'WR') {
    thresholds = { A: 3500, B: 2700, C: 1800, D: 900, F: 0 }
  } else if (position === 'TE') {
    thresholds = { A: 2500, B: 1800, C: 1200, D: 600, F: 0 }
  } else if (position === 'FLEX') {
    // FLEX can be RB/WR/TE - use more generous thresholds
    thresholds = { A: 3200, B: 2400, C: 1600, D: 800, F: 0 }
  } else {
    return '–'
  }

  // Calculate grade based on average value
  if (avgValue >= thresholds.A) return 'A'
  if (avgValue >= thresholds.B) return 'B'
  if (avgValue >= thresholds.C) return 'C'
  if (avgValue >= thresholds.D) return 'D'
  return 'F'
}

// Get total roster value (raw number)
const getTotalRosterValue = () => {
  let totalValue = 0
  const breakdown = {}

  Object.keys(rosterSlots).forEach((position) => {
    const positionValue = getPositionGroupValue(position)
    breakdown[position] = positionValue
    totalValue += positionValue
  })

  // console.log removed for production

  return totalValue
}

// Update draft analysis when players change
const updateDraftAnalysis = () => {
  const selectedPlayers = getSelectedPlayers()
  // console.log removed for production

  if (selectedPlayers.length >= 1 && draftSimulator.value) {
    try {
      draftScore.value = draftSimulator.value.analyzeUserTeam(selectedPlayers)
      // console.log removed for production
    } catch (error) {
      // console.warn removed for production
      draftScore.value = null
    }
  } else {
    // console.log removed for production
    draftScore.value = null
  }
}

// Calculate team score - enhanced with draft analysis
const teamScore = computed(() => {
  // Get traditional value-based score
  let totalValue = getTotalRosterValue()
  let valueBasedScore = getValueBasedScore(totalValue)

  // Combine value-based and draft-based scores if available
  if (draftScore.value) {
    // Weight: 60% value-based, 40% draft analysis
    return Math.round(valueBasedScore * 0.6 + draftScore.value.totalScore * 0.4)
  }

  return valueBasedScore
})

// Get selected players from roster slots
const getSelectedPlayers = () => {
  const players = []
  Object.keys(rosterSlots).forEach((position) => {
    rosterSlots[position].forEach((slot) => {
      if (slot.player) {
        players.push(slot.player)
      }
    })
  })
  return players
}

// Traditional value-based scoring
const getValueBasedScore = (totalValue) => {
  let scoreBreakpoints

  if (isSuperflex.value) {
    // Superflex scoring thresholds (MUCH more stringent)
    scoreBreakpoints = {
      100: 55000, // Truly elite championship roster - very rare
      95: 48000, // Elite contender - top 1%
      90: 42000, // Strong contender - top 5%
      85: 36000, // Good playoff team
      80: 30000, // Above average
      75: 25000, // Average competitive
      70: 20000, // Below average
      65: 16000, // Weak team
      60: 12000, // Poor team
      50: 8000, // Very poor team
      25: 4000, // Rebuilding
      0: 0 // Empty roster
    }
  } else {
    // 1QB scoring thresholds (MUCH more stringent)
    scoreBreakpoints = {
      100: 45000, // Truly elite championship roster - very rare
      95: 38000, // Elite contender - top 1%
      90: 32000, // Strong contender - top 5%
      85: 27000, // Good playoff team
      80: 22000, // Above average
      75: 18000, // Average competitive
      70: 14000, // Below average
      65: 11000, // Weak team
      60: 8000, // Poor team
      50: 5000, // Very poor team
      25: 2500, // Rebuilding
      0: 0 // Empty roster
    }
  }

  // Find the appropriate score based on total value
  const scores = Object.keys(scoreBreakpoints)
    .map(Number)
    .sort((a, b) => b - a)

  for (let score of scores) {
    if (totalValue >= scoreBreakpoints[score]) {
      // Add interpolation between thresholds for more granular scoring
      const nextLowerScore = scores[scores.indexOf(score) + 1]
      if (nextLowerScore !== undefined) {
        const upperThreshold = scoreBreakpoints[score]
        const lowerThreshold = scoreBreakpoints[nextLowerScore]
        const scoreDiff = score - nextLowerScore
        const valueDiff = upperThreshold - lowerThreshold
        const valueProgress = totalValue - lowerThreshold
        const interpolatedScore =
          nextLowerScore + (valueDiff > 0 ? (valueProgress / valueDiff) * scoreDiff : 0)
        return Math.min(100, Math.round(interpolatedScore))
      }
      return score
    }
  }

  return 0
}

// Get score grade
const getScoreGrade = () => {
  const score = teamScore.value

  // Updated grade scale to match exact specifications
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 67) return 'D+'
  if (score >= 65) return 'D'
  return 'F'
}

// Get score message with enhanced draft analysis
const getScoreMessage = () => {
  const score = teamScore.value
  const totalValue = getTotalRosterValue()
  const selectedPlayers = getSelectedPlayers()

  let baseMessage = ''

  if (score >= 95)
    baseMessage = `Elite championship roster! Total value of ${totalValue.toLocaleString()} puts you in the top tier.`
  else if (score >= 90)
    baseMessage = `Championship contender with exceptional depth and talent across all positions.`
  else if (score >= 85)
    baseMessage = `Strong playoff team with good balance. A few upgrades could push you to elite status.`
  else if (score >= 80)
    baseMessage = `Above average roster that should compete for playoffs with smart management.`
  else if (score >= 75)
    baseMessage = `Competitive team with some strong pieces. Target specific position upgrades.`
  else if (score >= 70)
    baseMessage = `Average roster that needs strategic improvements to compete consistently.`
  else if (score >= 65)
    baseMessage = `Below average team. Consider trading aging assets for younger talent.`
  else if (score >= 60)
    baseMessage = `Weak roster needs significant upgrades across multiple positions.`
  else if (score >= 50)
    baseMessage = `Poor team in rebuilding mode. Focus on accumulating picks and young assets.`
  else if (score >= 25)
    baseMessage = `Deep rebuild required. Trade all valuable aging assets for future picks.`
  else
    baseMessage =
      'Complete roster overhaul needed. Start fresh with a long-term rebuilding strategy.'

  // Add draft analysis insights
  if (draftScore.value && selectedPlayers.length >= 1) {
    const playerCount = draftScore.value.pickAnalysis.length
    const avgExpectedRound =
      draftScore.value.pickAnalysis.reduce((sum, pick) => {
        // Convert string expectedRound back to number for calculation (treat "16+" as 16)
        const roundValue = pick.expectedRound === '16+' ? 16 : parseInt(pick.expectedRound)
        return sum + roundValue
      }, 0) / playerCount

    if (avgExpectedRound <= 3) {
      baseMessage += ` Strong early-round talent with average expected round of ${avgExpectedRound.toFixed(1)}.`
    } else if (avgExpectedRound >= 6) {
      baseMessage += ` Good value picks with average expected round of ${avgExpectedRound.toFixed(1)}.`
    }
  }

  return baseMessage
}

// Save position configuration
const savePositionConfiguration = () => {
  rosterConfiguration.value = [...editableRosterConfiguration.value]
  initializeRosterSlots()
  showPositionEditor.value = false
}

// Add ordinal suffix to round numbers (1st, 2nd, 3rd, etc.)
const addOrdinalSuffix = (num) => {
  const numStr = num.toString()
  const lastDigit = parseInt(numStr.slice(-1))
  const secondToLastDigit = parseInt(numStr.slice(-2, -1))
  
  // Handle special cases for 11th, 12th, 13th
  if (secondToLastDigit === 1) {
    return numStr + 'th'
  }
  
  // Handle regular cases
  switch (lastDigit) {
    case 1:
      return numStr + 'st'
    case 2:
      return numStr + 'nd'
    case 3:
      return numStr + 'rd'
    default:
      return numStr + 'th'
  }
}

// Position color functions (more muted)
const getPositionColor = (position) => {
  if (position === 'QB') {
    return 'rgb(39, 125, 161, 0.7)' // More muted blue
  } else if (position === 'RB') {
    return 'rgb(144, 190, 109, 0.7)' // More muted green
  } else if (position === 'WR') {
    return 'rgb(67, 170, 139, 0.7)' // More muted teal
  } else if (position === 'TE') {
    return 'rgb(249, 132, 74, 0.7)' // More muted orange
  } else if (position === 'FLEX') {
    return 'rgb(120, 120, 120, 0.7)' // More muted gray
  } else if (position.toUpperCase() === 'PICK') {
    return 'rgb(189, 195, 199, 0.7)'
  } else {
    return 'rgb(0, 0, 0, .00)'
  }
}

const getCardPositionColor = (position) => {
  if (position === 'QB') {
    return 'rgb(39, 125, 161, .04)' // Much more subtle
  } else if (position === 'RB') {
    return 'rgb(144, 190, 109, .04)' // Much more subtle
  } else if (position === 'WR') {
    return 'rgb(67, 170, 139, .04)' // Much more subtle
  } else if (position === 'TE') {
    return 'rgb(249, 132, 74, .04)' // Much more subtle
  } else if (position === 'FLEX') {
    return 'rgb(120, 120, 120, .04)' // Much more subtle
  } else if (position.toUpperCase() === 'PICK') {
    return 'rgb(189, 195, 199, 0.06)'
  } else {
    return 'rgb(0, 0, 0, .04)'
  }
}

// Stronger card colors for selected players (more muted)
const getStrongCardPositionColor = (position) => {
  if (position === 'QB') {
    return 'rgb(39, 125, 161, .08)' // Reduced from .15
  } else if (position === 'RB') {
    return 'rgb(144, 190, 109, .08)' // Reduced from .15
  } else if (position === 'WR') {
    return 'rgb(67, 170, 139, .08)' // Reduced from .15
  } else if (position === 'TE') {
    return 'rgb(249, 132, 74, .08)' // Reduced from .15
  } else if (position === 'FLEX') {
    return 'rgb(120, 120, 120, .08)' // Reduced from .15
  } else if (position.toUpperCase() === 'PICK') {
    return 'rgb(189, 195, 199, 0.1)' // Reduced from .2
  } else {
    return 'rgb(0, 0, 0, .08)' // Reduced from .15
  }
}

watch(rankType, (newType, oldType) => {
  // console.log removed for production
  
  // When switching to redraft, default to OneQB format
  if (newType === 'redraft' && oldType === 'dynasty') {
    isSuperflex.value = false
    // console.log removed for production
  }
})

watch(isSuperflex, (newFormat, oldFormat) => {
  // console.log removed for production
})

watch(teamScore, (newScore, oldScore) => {
  // console.log removed for production
})

// Watch for roster changes to update draft analysis
watch(
  () => getSelectedPlayers().length,
  () => {
    updateDraftAnalysis()
  }
)

// Initialize component
// Show player modal function
const showPlayerModal = (player) => {
  const ktcPlayerId = player.ktc_player_id || player.player_id
  if (playerModalRef.value && ktcPlayerId) {
    playerModalRef.value.showModal(ktcPlayerId)
  }
}

onMounted(() => {
  // console.log removed for production
  initializeRosterSlots()

  // Load initial data
  fetchPlayers()
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: var(--color-background-soft);
}

.responsive-padding {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* Settings Section */
.settings-section {
  margin-bottom: 32px;
}

.settings-card {
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.settings-row {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  justify-content: center;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.settings-group label {
  color: var(--color-text);
  font-weight: 500;
  font-size: 0.9rem;
}

.ranking-select {
  width: 180px;
}

@media (max-width: 768px) {
  .settings-row {
    flex-direction: column;
    gap: 20px;
  }
}

/* Roster Builder */
.roster-builder {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
}

.roster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.roster-header h2 {
  color: var(--color-text);
  margin: 0;
}

.position-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.position-group {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  background: var(--color-background-mute);
  transition: all 0.2s ease;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.position-header h4 {
  color: var(--color-text);
  margin: 0;
}

.position-grade {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.player-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* Team Score Card */
.team-score-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  position: sticky;
  top: 20px;
}

.team-score-card h3 {
  color: var(--color-text);
  margin-bottom: 20px;
}

.score-display {
  margin-bottom: 20px;
}

.score-number {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.score-grade {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.score-raw {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-top: 8px;
  font-weight: 500;
}

.score-message {
  color: var(--color-text);
  margin-bottom: 24px;
  line-height: 1.5;
  padding: 16px;
  background: var(--color-background-mute);
  border-radius: 8px;
}

.score-breakdown {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.score-breakdown h4 {
  color: var(--color-text);
  margin-bottom: 12px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.position-name {
  color: var(--color-text-secondary);
}

.position-score {
  color: var(--color-primary);
  font-weight: 600;
}

/* Draft Analysis Styles */
.draft-analysis-toggle {
  text-align: center;
  margin: 16px 0;
  padding: 8px 0;
  border-top: 1px solid var(--color-border);
}

.draft-analysis {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  margin-top: 16px;
}

.draft-analysis h4 {
  color: var(--color-text);
  margin-bottom: 12px;
  text-align: center;
}

.draft-summary {
  background: var(--color-background-mute);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.draft-explanation {
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

.pick-analysis {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.pick-item {
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s ease;
  /* Dynamic background and border applied via :style */
}

.pick-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pick-player {
  color: var(--color-text);
  font-weight: 600;
  font-size: 1rem;
}

.pick-position {
  font-weight: 600;
  font-size: 0.85rem;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  /* Dynamic color applied via :style */
}

.pick-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.pick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 2px;
}

.stat-value {
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.9rem;
}

/* Position Editor */
.position-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.position-edit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.position-label {
  color: var(--color-text);
  font-weight: 500;
}

/* Compact Autocomplete Styles */
.player-slot-autocomplete {
  min-width: 240px;
  flex: 0 1 55px;
  max-width: 320px;
}

.empty-slot-autocomplete {
  width: 100%;
}

.player-autocomplete {
  width: 100%;
}

.selected-player-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  width: 100%;
  min-height: 40px;
  transition: all 0.2s ease;
}

.player-info-compact {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.player-name-compact {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-details-compact {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-position-compact {
  font-weight: 600;
}

.player-value-compact {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.9rem;
  margin: 0 8px;
  white-space: nowrap;
}

.remove-btn-compact {
  color: var(--color-text-secondary);
  padding: 4px;
  min-width: auto;
}

.remove-btn-compact:hover {
  color: #ff4d4f;
}

.loading-indicator {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
  padding: 4px;
}

/* Skeleton Loader Styles */
.skeleton-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-background-soft);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-overlay {
  position: relative;
}

.skeleton-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  opacity: 0.7;
}

.skeleton-group {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  background: var(--color-background-mute);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.skeleton-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  width: 120px;
  height: 20px;
}

.skeleton-value {
  width: 80px;
  height: 16px;
}

.skeleton-card {
  width: 200px;
  height: 40px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive Design */
/* Small phones and up */
@media (max-width: 480px) {
  .responsive-padding {
    padding: 6px;
  }

  /* Page header - much more compact */
  .page-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .page-title {
    font-size: 1.4rem;
    margin-bottom: 2px;
  }

  .page-subtitle {
    font-size: 0.85rem;
    line-height: 1.3;
  }

  /* Settings section - ultra compact */
  .settings-section {
    margin-bottom: 16px;
  }

  .settings-card {
    border-radius: 6px;
    padding: 0;
  }

  .settings-card .ant-card-body {
    padding: 12px;
  }

  .settings-row {
    flex-direction: column;
    gap: 12px;
    padding: 0;
  }

  .settings-group {
    width: 100%;
    align-items: center;
    gap: 4px;
  }

  .settings-group label {
    font-size: 0.8rem;
    margin-bottom: 2px;
  }

  /* Roster builder mobile optimization */
  .roster-builder {
    padding: 8px;
  }

  .roster-header {
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    margin-bottom: 12px;
    padding-bottom: 8px;
  }

  .roster-header h2 {
    font-size: 1.1rem;
    margin: 0;
  }

  /* Position groups - ULTRA COMPACT */
  .position-groups {
    gap: 8px;
  }

  .position-group {
    padding: 4px 6px;
    border-radius: 4px;
    margin-bottom: 0;
  }

  .position-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    padding: 0;
  }

  .position-header h4 {
    font-size: 0.8rem;
    margin: 0;
    line-height: 1;
  }

  .position-grade {
    font-size: 0.7rem;
    line-height: 1;
  }

  /* Player slots - MINIMAL spacing */
  .player-slots {
    justify-content: stretch;
    flex-direction: column;
    gap: 3px;
    margin: 0;
    padding: 0;
  }

  .player-slot-autocomplete {
    min-width: auto;
    max-width: none;
    width: 100%;
    margin: 0;
  }

  /* Empty slot autocomplete - TINY */
  .empty-slot-autocomplete {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  /* Autocomplete input - ULTRA TINY */
  .player-autocomplete {
    width: 100%;
    height: 20px !important;
  }

  .player-autocomplete .ant-select {
    font-size: 0.65rem !important;
    height: 20px !important;
  }

  .player-autocomplete .ant-select-selector {
    padding: 0 4px !important;
    min-height: 20px !important;
    height: 20px !important;
    border-radius: 2px !important;
    line-height: 18px !important;
  }

  .player-autocomplete .ant-select-selection-placeholder {
    font-size: 0.65rem !important;
    line-height: 18px !important;
    color: #999 !important;
  }

  .player-autocomplete .ant-select-selection-search {
    height: 18px !important;
  }

  .player-autocomplete .ant-select-selection-search-input {
    height: 18px !important;
    font-size: 0.65rem !important;
  }

  /* Allow dropdown to overlap other elements */
  .player-autocomplete .ant-select-dropdown {
    z-index: 9999 !important;
  }

  /* Selected player cards - MATCH autocomplete height */
  .selected-player-compact {
    padding: 1px 4px;
    min-height: 45px;
    height: 20px;
    border-radius: 2px;
    margin: 0;
    display: flex;
    align-items: center;
  }

  .player-info-compact {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0;
    padding: 0;
  }

  .player-name-compact {
    font-size: 0.7rem;
    line-height: 1;
    margin: 0;
    padding: 0;
  }

  .player-details-compact {
    font-size: 0.6rem;
    line-height: 1;
    margin: 0;
    padding: 0;
  }

  .player-value-compact {
    font-size: 0.7rem;
    margin: 0 2px;
    padding: 0;
    align-self: center;
  }

  .remove-btn-compact {
    padding: 0;
    min-width: 16px;
    height: 16px;
    font-size: 0.55rem;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .remove-btn-compact .anticon {
    font-size: 0.55rem;
  }

  /* Loading indicator - smaller */
  .loading-indicator {
    font-size: 0.7rem;
    padding: 1px;
    margin: 0;
  }

  /* Team score card mobile */
  .team-score-card {
    padding: 12px;
    position: static;
    margin-top: 16px;
  }

  .team-score-card h3 {
    margin-bottom: 12px;
    font-size: 1.1rem;
  }

  .score-display {
    margin-bottom: 12px;
  }

  .score-number {
    font-size: 2.2rem;
  }

  .score-grade {
    font-size: 1.1rem;
  }

  .score-message {
    padding: 8px;
    font-size: 0.8rem;
    line-height: 1.3;
    margin-bottom: 12px;
  }

  /* Score breakdown - more compact */
  .score-breakdown {
    padding-top: 12px;
  }

  .score-breakdown h4 {
    margin-bottom: 8px;
    font-size: 1rem;
  }

  .breakdown-item {
    margin-bottom: 4px;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .position-name {
    font-size: 0.8rem;
  }

  .position-score {
    font-size: 0.8rem;
  }

  /* Draft analysis mobile */
  .draft-analysis-toggle {
    margin: 12px 0;
    padding: 6px 0;
  }

  .draft-analysis {
    padding-top: 8px;
    margin-top: 8px;
  }

  .draft-analysis h4 {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .draft-summary {
    padding: 8px;
    margin-bottom: 12px;
  }

  .draft-explanation {
    font-size: 0.8rem;
    line-height: 1.3;
  }

  .pick-analysis {
    max-height: 250px;
    gap: 4px;
  }

  .pick-item {
    padding: 6px;
    border-radius: 4px;
  }

  .pick-header {
    margin-bottom: 4px;
  }

  .pick-player {
    font-size: 0.8rem;
  }

  .pick-position {
    font-size: 0.7rem;
    padding: 1px 3px;
  }

  .pick-details {
    gap: 10px;
  }

  .pick-stat {
    min-width: 50px;
  }

  .stat-label {
    font-size: 0.6rem;
    margin-bottom: 1px;
  }

  .stat-value {
    font-size: 0.75rem;
  }

  /* Position editor mobile */
  .position-editor {
    gap: 10px;
  }

  .position-edit-row {
    flex-direction: column;
    gap: 6px;
    align-items: stretch;
  }

  .position-label {
    font-size: 0.85rem;
    text-align: center;
  }

  /* Theme toggle button positioning - ensure it's visible */
  .layout :deep(theme-toggle-button) {
    position: fixed !important;
    top: 10px !important;
    right: 10px !important;
    z-index: 1000 !important;
  }
}

/* Clickable player names */
.clickable-player {
  cursor: pointer;
  transition: color 0.2s ease;
}

.clickable-player:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

/* Tablets and up */
@media (max-width: 768px) and (min-width: 481px) {
  .responsive-padding {
    padding: 12px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .roster-builder {
    padding: 16px;
  }

  .roster-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .position-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .player-slots {
    justify-content: stretch;
    flex-direction: column;
    gap: 12px;
  }

  .player-slot-autocomplete {
    min-width: auto;
    max-width: none;
    width: 100%;
  }

  .team-score-card {
    position: static;
    margin-top: 24px;
  }

  .settings-row {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
