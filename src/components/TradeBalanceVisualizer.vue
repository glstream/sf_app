<template>
  <div class="trade-balance-visualizer">
    <div class="balance-labels top-labels">
      <span class="label-container" v-if="!isFair && valueA > valueB">
        <span class="label-needs label-a-needs">
          <span class="favor-icon side-arrow left-arrow">←</span>
          <span class="favor-icon up-arrow">↑</span>
          <span class="balancing-value-display">{{ Math.round(balancingValue) }}</span>
        </span>
        <span class="label-favored label-b-favored">
          Team B Favored
          <span class="favor-icon side-arrow right-arrow">→</span>
          <span class="favor-icon up-arrow">↓</span>
        </span>
      </span>

      <span class="label-container" v-if="!isFair && valueB > valueA">
        <span class="label-favored label-a-favored">
          <span class="favor-icon side-arrow left-arrow">←</span>
          <span class="favor-icon up-arrow">↑</span>
          Team A Favored
        </span>
        <span class="label-needs label-b-needs">
          <span class="balancing-value-display">{{ Math.round(balancingValue) }}</span>
          <span class="favor-icon side-arrow right-arrow">→</span>
          <span class="favor-icon up-arrow">↓</span>
        </span>
      </span>

      <span class="label-container fair-trade-label" v-if="isFair && totalValue > 0">
        {{ teamAName }} ({{ Math.round(valueA) }}) <span class="arrow">→</span
        ><span class="balance-icon">⚖️</span><span class="arrow">←</span> ({{ Math.round(valueB) }})
        {{ teamBName }}
      </span>
      <span class="label-container fair-trade-label" v-if="isFair && totalValue === 0">
        Balanced Trade
      </span>
    </div>

    <div
      class="balance-bar-container"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <div
        v-if="totalValue === 0"
        class="balance-bar empty-state"
        title="Add players to evaluate trade"
      >
        <div class="bar-segment team-a" style="width: 50%">
          <span class="team-label">Team A</span>
          <span class="direction-arrow side-arrow">←</span>
          <span class="direction-arrow up-arrow">↑</span>
        </div>
        <div class="bar-segment team-b" style="width: 50%">
          <span class="direction-arrow side-arrow">→</span>
          <span class="direction-arrow up-arrow">↓</span>
          <span class="team-label">Team B</span>
        </div>
        <div class="midpoint-marker"></div>
      </div>

      <div
        v-else
        class="balance-bar"
        :class="{ 'is-fair': isFair, 'is-hovered': isHovered }"
        :title="`Team A: ${Math.round(valueA)} | Team B: ${Math.round(valueB)}`"
      >
        <div
          v-if="totalValue > 0 && acceptableVarianceZoneWidth > 0"
          class="variance-zone"
          :style="varianceZoneStyle"
          title="Acceptable variance range"
        ></div>
        <div class="bar-segment team-a" :style="{ width: teamAPercentage + '%' }">
          <span class="value-badge" v-if="isHovered && totalValue > 0">{{
            Math.round(valueA)
          }}</span>
        </div>
        <div class="bar-segment team-b" :style="{ width: teamBPercentage + '%' }">
          <span class="value-badge" v-if="isHovered && totalValue > 0">{{
            Math.round(valueB)
          }}</span>
        </div>
        <div v-if="isFair" class="fair-indicator"></div>
        <div v-if="!isFair" class="midpoint-marker"></div>
      </div>
    </div>

    <div class="balance-labels bottom-label" v-if="isFair">
      <span class="label-fair">Balanced Trade</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = defineProps<{
  valueA: number
  valueB: number
  isFair: boolean
  balancingValue: number
  showDifference?: boolean // Optional prop, not currently used in template but kept
  acceptableVariance: number // The acceptable variance *value* (e.g., 1000 points)
  teamAName: string
  teamBName: string
}>()

const isHovered = ref(false)

const totalValue = computed(() => props.valueA + props.valueB)

const teamAPercentage = computed(() => {
  if (totalValue.value === 0) return 50 // Default to 50/50 if no value
  return (props.valueA / totalValue.value) * 100
})

const teamBPercentage = computed(() => {
  if (totalValue.value === 0) return 50 // Default to 50/50 if no value
  return (props.valueB / totalValue.value) * 100
})

// *** START: Variance Zone Calculations ***
// Calculate the width of the acceptable variance zone as a percentage of the total bar width.
// The variance represents the acceptable difference from the *midpoint* in absolute value.
// So, the zone covers 'variance' points to the left and 'variance' points to the right.
const acceptableVarianceZoneWidth = computed(() => {
  if (!props.acceptableVariance || totalValue.value === 0) {
    return 0 // No zone if no variance defined or total value is zero
  }
  // The total width in terms of value covered by the zone is twice the variance
  const zoneValueWidth = props.acceptableVariance * 2
  // Calculate the percentage width relative to the total trade value
  const percentageWidth = (zoneValueWidth / totalValue.value) * 100
  // Ensure the width doesn't exceed 100%
  return Math.min(percentageWidth, 100)
})

// Calculate the inline style for positioning and sizing the variance zone.
// It should be centered around the 50% midpoint of the bar.
const varianceZoneStyle = computed(() => {
  const width = acceptableVarianceZoneWidth.value
  // Calculate the left offset: start at 50% and move left by half the zone's width
  const left = 50 - width / 2
  return {
    width: `${width}%`,
    left: `${left}%`
  }
})
// *** END: Variance Zone Calculations ***
</script>

<style scoped>
.trade-balance-visualizer {
  min-height: 55px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.balance-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  font-weight: 500;
  color: #555;
  padding: 0 5px;
  box-sizing: border-box;
  min-height: 18px;
  align-items: center;
}

.top-labels {
  margin-bottom: 6px;
  position: relative;
  min-height: 18px;
}

.label-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.label-needs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #096dd9;
}

.label-a-needs {
  justify-content: flex-start;
}

.label-b-needs {
  justify-content: flex-end;
}

.label-favored {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #cf1322;
}

.label-a-favored {
  justify-content: flex-start;
}

.label-b-favored {
  justify-content: flex-end;
}

.balancing-value-display {
  padding: 1px 5px;
  background-color: rgba(24, 144, 255, 0.1);
  border-radius: 4px;
  color: #096dd9;
}

.bottom-label {
  margin-top: 6px;
  justify-content: center;
}

.balance-bar-container {
  width: 100%;
  padding: 2px 0;
  transition: transform 0.2s ease;
}

.balance-bar-container:hover {
  transform: scale(1.02);
}

.balance-bar {
  display: flex;
  width: 100%;
  height: 16px;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--color-background-mute, #f0f2f5);
  position: relative;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease-in-out;
}

.variance-zone {
  position: absolute;
  height: 100%;
  background-color: rgba(82, 196, 26, 0.15);
  z-index: 1;
  pointer-events: none;
}

.balance-bar.is-hovered {
  height: 22px;
  box-shadow:
    inset 0 1px 6px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.bar-segment {
  height: 100%;
  transition: width 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.team-a {
  background: linear-gradient(to right, #ff9985, #ff7875);
  border-radius: 8px 0 0 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.team-b {
  background: linear-gradient(to right, #69c0ff, #1890ff);
  border-radius: 0 8px 8px 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.balance-bar.is-fair .team-a {
  background: linear-gradient(to right, #95de64, #73d13d);
}

.balance-bar.is-fair .team-b {
  background: linear-gradient(to left, #95de64, #73d13d);
}

.fair-indicator {
  position: absolute;
  left: 50%;
  top: -4px;
  bottom: -4px;
  width: 3px;
  background-color: #52c41a;
  transform: translateX(-50%);
  border-radius: 1.5px;
  box-shadow: 0 0 6px rgba(82, 196, 26, 0.7);
  animation: pulse 1.5s infinite alternate;
  z-index: 3;
}

.midpoint-marker {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: rgba(0, 0, 0, 0.15);
  transform: translateX(-50%);
  z-index: 2;
}

.label-fair {
  font-weight: bold;
  color: #389e0d;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  background-color: rgba(82, 196, 26, 0.15);
  box-shadow: 0 1px 3px rgba(82, 196, 26, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.fair-trade-label {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-weight: bold;
  font-size: 0.9em;
  color: #28a745; /* Green for fair trade */
  padding: 4px 0;
}

.fair-trade-label .arrow {
  font-size: 1.2em;
  margin: 0 5px;
}

.fair-trade-label .balance-icon {
  font-size: 1.2em;
  margin: 0 5px;
}

.favor-icon {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.label-needs .favor-icon {
  color: #096dd9;
}

.label-favored .favor-icon {
  color: #cf1322;
}

.side-arrow {
  display: none;
}

.up-arrow {
  display: inline;
}

@media (min-width: 992px) {
  .up-arrow {
    display: none;
  }
  .side-arrow {
    display: inline;
  }
}

.value-badge {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.2s ease-out;
  position: relative;
  z-index: 2;
}

.balance-bar.empty-state {
  background-color: #f5f5f5;
  cursor: default;
}

.empty-state .team-a {
  background: linear-gradient(to right, #ffcccc, #ffd6d6);
  opacity: 0.7;
  justify-content: space-between;
  padding: 0 10px;
}

.empty-state .team-b {
  background: linear-gradient(to right, #d6e4ff, #bfd4ff);
  opacity: 0.7;
  justify-content: space-between;
  padding: 0 10px;
}

.team-label {
  font-size: 10px;
  font-weight: bold;
  color: #595959;
}

.direction-arrow {
  font-size: 14px;
  font-weight: bold;
}

.empty-state .team-a .direction-arrow {
  color: #ff7875;
}

.empty-state .team-b .direction-arrow {
  color: #1890ff;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-5px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
