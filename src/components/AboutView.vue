<template>
  <a-layout class="layout">
    <AppHeader />
    <a-layout-content style="padding: 0 100px">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item><a href="/username">Home</a></a-breadcrumb-item>
        <a-breadcrumb-item>About</a-breadcrumb-item>
      </a-breadcrumb>
      <div>
        <h2>Questions</h2>
        <a-collapse v-model:activeKey="activeKeyRankings">
          <a-collapse-panel key="4" header="How are composite SuperFlex ranks made?">
            <p>{{ sfRankingsText }}</p>
          </a-collapse-panel>
          <a-collapse-panel key="5" header="What are Power Rankings?">
            <p>
              Dynasty Rankings are sourced from Keep Trade Cut, Fantasy Pros, Fantasy Calc and
              Dynasty Process. These rankings are the best way to determine the power of your team
              from a dynasty league perspective. They combine player values from those sites with
              your fantasy football league. The teams are then ranked based on thier total aggregate
              values. The heatmap table shown has rankings for each of the aggregate position groups
              QB, RB, WR, and TE as well as aggregates for your starters, bench, and draft picks.
              You can hover over the table to see the actual values.
            </p>
          </a-collapse-panel>
          <a-collapse-panel key="6" header="How does the trade calculator work?">
            <p>
              The SuperFlex Trade Value Calculator utilizes a sophisticated algorithm designed to
              assess player values in the complex ecosystem of fantasy football. It's built on the
              foundation of understanding that not all players are created equal. Our model goes
              beyond simple metrics, taking into account the inherent scarcity of top-tier talent
              and the real-world constraints of roster spots. It dynamically adjusts player values,
              ensuring that the rare gems are valued according to their true scarcity and impact,
              while also considering the diminishing returns of stacking multiple lower-tier players
              against elite options. This approach allows for more nuanced and strategic
              decision-making to give you an edge in your fantasy football league.
            </p>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const text = `A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.`
const activeKeyCalculator = ref(['1'])
const activeKeyRankings = ref(['4'])

const sfRankingsText = `Introducing the Super Flex Rankings: a comprehensive and robust ranking system that combines crowdsourced valuations, expert consensus rankings, and real-world trade assessments. This unique, data-driven perspective on player values provides an unparalleled level of insight into player performance and value.

These Super Flex Rankings are designed to help you make better-informed decisions in managing your fantasy football team. Leveraging the wisdom of the crowd, expert analysis, and real-world trade data, the rankings offer a powerful tool for fantasy football success.

With Super Flex Rankings, you gain access to a resource that aids in evaluating trades, updating rosters, or participating in startup drafts. This invaluable tool helps you make the best possible decisions for your team.

Stay ahead of the competition and maximize your chances of success with our cutting-edge Super Flex Rankings – the ultimate fusion of data, expertise, and real-world insights in fantasy football.`
watch(activeKeyCalculator, (val) => {
  console.log('Calculator active key:', val)
})

watch(activeKeyRankings, (val) => {
  console.log('Rankings active key:', val)
})
</script>
<style scoped></style>
