<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />
    <a-layout-content class="responsive-padding">
      <BreadcrumbNavigation />
      <div class="about-container">
        <div class="about-header">
          <h1 class="title">About Fantasy Navigator</h1>
          <p class="subtitle">The premier tool for fantasy football analytics and decision-making</p>
        </div>

        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <crown-outlined />
            </div>
            <h3>Expert Rankings</h3>
            <p>Composite rankings from the most trusted sources in fantasy football</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <line-chart-outlined />
            </div>
            <h3>Power Rankings</h3>
            <p>Advanced team evaluation across all important positions</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <swap-outlined />
            </div>
            <h3>Trade Analysis</h3>
            <p>Sophisticated algorithms to evaluate complex trade scenarios</p>
          </div>
        </div>

        <div class="content-section">
          <h2>Why Choose Fantasy Navigator?</h2>
          <div class="benefits-grid">
            <div class="benefit-item">
              <h4>Data-Driven Decisions</h4>
              <p>Make informed choices with rankings and analysis based on multiple expert sources and real-world trade data.</p>
            </div>
            <div class="benefit-item">
              <h4>Time-Saving Tools</h4>
              <p>Quickly evaluate trades, analyze your team's strengths and weaknesses, and identify the best available players.</p>
            </div>
            <div class="benefit-item">
              <h4>Competitive Advantage</h4>
              <p>Stay ahead of your league mates with advanced analytics and insights not found in basic fantasy tools.</p>
            </div>
            <div class="benefit-item">
              <h4>User-Friendly Interface</h4>
              <p>Complex data made simple with intuitive visualizations and easy-to-understand rankings.</p>
            </div>
          </div>
        </div>

        <div class="faq-section">
          <h2>Frequently Asked Questions</h2>
          <a-collapse
            v-model:activeKey="activeKeyRankings"
            :bordered="false"
            class="custom-collapse"
            expand-icon-position="right"
          >
            <a-collapse-panel key="1" header="What data sources do you use?">
              <div class="panel-content">
                <p>
                  Fantasy Navigator aggregates data from the most trusted sources in fantasy football including:
                </p>
                <ul>
                  <li><strong>Sleeper:</strong> Live league data and player information</li>
                  <li><strong>Keep Trade Cut:</strong> Crowdsourced dynasty values and trade data</li>
                  <li><strong>Fantasy Calc:</strong> Expert dynasty rankings and analysis</li>
                  <li><strong>Dynasty Daddy:</strong> Comprehensive dynasty valuations</li>
                  <li><strong>Dynasty Process:</strong> Data-driven dynasty insights</li>
                  <li><strong>ESPN & NFL:</strong> Current season projections</li>
                </ul>
                <p>
                  This multi-source approach provides a more accurate and comprehensive view of player values than any single source alone.
                </p>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="4" header="How are composite SuperFlex ranks created?">
              <div class="panel-content">
                <p v-for="(paragraph, index) in sfRankingsParagraphs" :key="index">
                  {{ paragraph }}
                </p>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="5" header="What are Power Rankings?">
              <div class="panel-content">
                <p>
                  Power Rankings aggregate player values from multiple trusted sources including
                  Keep Trade Cut, Fantasy Pros, Fantasy Calc and Dynasty Process to evaluate your
                  team's dynasty potential.
                </p>
                <p>
                  Your league's teams are ranked based on their total aggregate values, with
                  detailed breakdowns for position groups (QB, RB, WR, TE) as well as starters,
                  bench, and draft picks.
                </p>
                <p>
                  The intuitive heatmap visualization makes it easy to identify strengths and
                  weaknesses across your league at a glance.
                </p>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="6" header="How does the trade calculator work?">
              <div class="panel-content">
                <p>
                  Our Trade Calculator employs a sophisticated algorithm that goes beyond basic
                  player comparisons.
                </p>
                <p>
                  The system accounts for position scarcity, the premium value of elite talent, and
                  the diminishing returns of bundling multiple lower-tier players in trades.
                </p>
                <p>
                  Unlike simpler calculators, ours dynamically adjusts values based on real-world
                  roster constraints and the relative scarcity of top performers at each position.
                </p>
              </div>
            </a-collapse-panel>
            <a-collapse-panel key="7" header="Is Fantasy Navigator free to use?">
              <div class="panel-content">
                <p>
                  Yes! Fantasy Navigator is completely free to use. We support the platform through 
                  non-intrusive advertisements and optional donations from users who find value in our tools.
                </p>
                <p>
                  Our goal is to make advanced fantasy football analytics accessible to everyone, 
                  regardless of budget. All core features including rankings, trade calculator, 
                  and team analysis tools are available at no cost.
                </p>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>

        <div class="getting-started-section">
          <h2>Getting Started</h2>
          <div class="steps-grid">
            <div class="step-item">
              <div class="step-number">1</div>
              <h4>Enter Your Username</h4>
              <p>Start by entering your Sleeper username to connect your leagues and teams.</p>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <h4>Select Your League</h4>
              <p>Choose from your active leagues to begin analyzing your team and opponents.</p>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <h4>Explore Your Data</h4>
              <p>Use our tools to analyze trades, view power rankings, and optimize your roster.</p>
            </div>
          </div>
        </div>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { CrownOutlined, LineChartOutlined, SwapOutlined } from '@ant-design/icons-vue'

const themeStore = useThemeStore()

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation.vue'

const activeKeyCalculator = ref(['1'])
const activeKeyRankings = ref(['4'])

const sfRankingsText = `Introducing the Super Flex Rankings: a comprehensive and robust ranking system that combines crowdsourced valuations, expert consensus rankings, and real-world trade assessments. This unique, data-driven perspective on player values provides an unparalleled level of insight into player performance and value.

These Super Flex Rankings are designed to help you make better-informed decisions in managing your fantasy football team. Leveraging the wisdom of the crowd, expert analysis, and real-world trade data, the rankings offer a powerful tool for fantasy football success.

With Super Flex Rankings, you gain access to a resource that aids in evaluating trades, updating rosters, or participating in startup drafts. This invaluable tool helps you make the best possible decisions for your team.

Stay ahead of the competition and maximize your chances of success with our cutting-edge Super Flex Rankings – the ultimate fusion of data, expertise, and real-world insights in fantasy football.`

const sfRankingsParagraphs = computed(() => {
  return sfRankingsText.split('\n\n').filter((para) => para.trim() !== '')
})

watch(activeKeyCalculator, (val) => {
  console.log('Calculator active key:', val)
})

watch(activeKeyRankings, (val) => {
  console.log('Rankings active key:', val)
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.responsive-padding {
  padding: 0 100px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  margin-bottom: 48px;
  padding-bottom: 24px;
  position: relative;
}

.about-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #277da1, #43aa8b);
  border-radius: 3px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--color-text);
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  max-width: 700px;
  margin: 0 auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 64px;
}

.feature-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--color-primary);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text);
}

.feature-card p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.content-section {
  margin: 64px 0;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.benefit-item {
  padding: 24px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-align: center;
}

.benefit-item h4 {
  color: var(--color-text);
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.benefit-item p {
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.getting-started-section {
  margin: 64px 0;
  padding: 32px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  margin-top: 32px;
}

.step-item {
  text-align: center;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0 auto 16px;
}

.step-item h4 {
  color: var(--color-text);
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.step-item p {
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.faq-section {
  margin-top: 48px;
}

.faq-section ul {
  margin: 16px 0;
  padding-left: 24px;
}

.faq-section li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.faq-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  color: var(--color-text);
}

:deep(.custom-collapse) {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

:deep(.custom-collapse .ant-collapse-item) {
  border-bottom: 1px solid var(--color-border);
}

:deep(.custom-collapse .ant-collapse-item:last-child) {
  border-bottom: none;
}

:deep(.custom-collapse .ant-collapse-header) {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 20px 24px !important;
  color: var(--color-text) !important;
}

:deep(.custom-collapse .ant-collapse-content-box) {
  padding: 0 !important;
}

.panel-content {
  padding: 0 24px 24px;
}

.panel-content p {
  margin-bottom: 16px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.panel-content p:last-child {
  margin-bottom: 0;
}

/* Dark theme specific adjustments */
html.dark .feature-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

html.dark .feature-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

html.dark :deep(.custom-collapse) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

@media (max-width: 1024px) {
  .responsive-padding {
    padding: 0 40px;
  }

  .title {
    font-size: 2rem;
  }

  .feature-grid {
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .responsive-padding {
    padding: 0 24px;
  }

  .title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .feature-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .responsive-padding {
    padding: 0 16px;
  }

  .about-header {
    margin-bottom: 32px;
  }

  .title {
    font-size: 1.5rem;
  }

  .feature-icon {
    font-size: 2rem;
    height: 50px;
  }

  :deep(.custom-collapse .ant-collapse-header) {
    padding: 16px 16px !important;
    font-size: 1rem;
  }

  .panel-content {
    padding: 0 16px 16px;
  }
}

@media (max-width: 390px) {
  .responsive-padding {
    padding: 0 10px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
