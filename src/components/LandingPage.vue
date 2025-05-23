<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Fantasy Navigatory -x-</h1>
        <p class="hero-subtitle">
          The ultimate toolkit for Dynasty and Redraft fantasy football. Analyze leagues, discover
          trade opportunities, and dominate your competition.
        </p>
        <div class="cta-buttons">
          <a-button type="primary" size="large" @click="navigateTo('/username')" class="cta-btn">
            League Dashboard
          </a-button>
          <a-button type="default" size="large" @click="navigateTo('/ranks')" class="cta-btn">
            Player Rankings
          </a-button>
          <a-button
            type="default"
            size="large"
            @click="navigateTo('/tradecalculator')"
            class="cta-btn"
          >
            Trade Calculator
          </a-button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <a-layout-content class="responsive-padding">
      <div class="features-header">
        <a-divider>
          <span class="features-title">Explore Our Tools</span>
        </a-divider>
      </div>

      <a-row
        :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }"
        justify="space-around"
        style="margin-bottom: 40px"
      >
        <!-- League Dashboard Card -->
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card hoverable @click="navigateTo('/username')" class="feature-card">
            <template #cover>
              <div class="card-cover-container">
                <img src="@/assets/site/league_details.png" alt="League Dashboard" />
              </div>
            </template>
            <a-card-meta title="League Dashboard">
              <template #description>
                <div class="card-description">
                  <p>
                    Access all your Sleeper leagues in one place. Get detailed analytics and
                    insights on your team and league.
                  </p>
                  <ul>
                    <li>Team composition analysis</li>
                    <li>League power rankings</li>
                    <li>Player value breakdowns</li>
                  </ul>
                  <a-button type="primary" block @click="navigateTo('/username')"
                    >Enter Dashboard</a-button
                  >
                </div>
              </template>
            </a-card-meta>
          </a-card>
        </a-col>

        <!-- Player Rankings Card -->
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card hoverable @click="navigateTo('/ranks')" class="feature-card">
            <template #cover>
              <div class="card-cover-container">
                <img src="@/assets/site/power_ranks.png" alt="Player Rankings" />
              </div>
            </template>
            <a-card-meta title="Player Rankings">
              <template #description>
                <div class="card-description">
                  <p>Comprehensive player rankings from multiple trusted sources.</p>
                  <ul>
                    <li>Dynasty & redraft values</li>
                    <li>Superflex & 1QB formats</li>
                    <li>Positional breakdowns</li>
                  </ul>
                  <a-button type="primary" block @click="navigateTo('/ranks')"
                    >View Rankings</a-button
                  >
                </div>
              </template>
            </a-card-meta>
          </a-card>
        </a-col>

        <!-- Trade Calculator Card -->
        <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card hoverable @click="navigateTo('/tradecalculator')" class="feature-card">
            <template #cover>
              <div class="card-cover-container">
                <img src="@/assets/site/trade_calc.png" alt="Trade Calculator" />
              </div>
            </template>
            <a-card-meta title="Trade Calculator">
              <template #description>
                <div class="card-description">
                  <p>
                    Evaluate trades with our advanced calculator based on current market values.
                  </p>
                  <ul>
                    <li>Multi-player trade analysis</li>
                    <li>Draft pick valuation</li>
                    <li>Shareable trade results</li>
                  </ul>
                  <a-button type="primary" block @click="navigateTo('/tradecalculator')"
                    >Calculate Trades</a-button
                  >
                </div>
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
      </a-row>

      <!-- About Section -->
      <div class="about-section">
        <a-divider>
          <span class="features-title">About Fantasy Navigator</span>
        </a-divider>
        <p class="about-text">
          Fantasy Navigator is built by fantasy players for fantasy players. Our tools help you make
          better decisions by combining data from multiple trusted sources, advanced analytics, and
          an intuitive interface. Whether you're a casual player or a dynasty veteran, our platform
          will help elevate your game.
        </p>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
// import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}

onMounted(() => {
  // Any initialization code
})
</script>

<style scoped>
.layout {
  /* Default (light theme) values */
  --hero-gradient-start: var(
    --hero-gradient-start-light,
    #f5f7fa
  ); /* Fallback for clarity, original vars can be removed */
  --hero-gradient-end: var(--hero-gradient-end-light, #c3cfe2);
  --hero-box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.04);

  /* Original specific variables can be kept if used elsewhere, or removed if only for this pattern */
  --hero-gradient-start-light: #f5f7fa;
  --hero-gradient-end-light: #c3cfe2;
  --hero-gradient-start-dark: #2d3748;
  --hero-gradient-end-dark: #1a202c;
}

:deep(.dark-theme) .layout {
  /* Dark theme overrides */
  --hero-gradient-start: var(--hero-gradient-start-dark, #2d3748);
  --hero-gradient-end: var(--hero-gradient-end-dark, #1a202c);
  --hero-box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.15);
}

/* Hero Section Styles */
.hero-section {
  background: linear-gradient(135deg, var(--hero-gradient-start) 0%, var(--hero-gradient-end) 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  position: relative;
  box-shadow: var(--hero-box-shadow);
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease; /* Added box-shadow to transition */
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  color: #2d3142;
  margin-bottom: 18px;
  letter-spacing: -1px;
  transition: color 0.3s ease;
}

:deep(.dark-theme) .hero-title {
  color: #e2e8f0;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #495670;
  margin-bottom: 32px;
  font-weight: 400;
  line-height: 1.6;
  transition: color 0.3s ease;
}

:deep(.dark-theme) .hero-subtitle {
  color: #a0aec0;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.cta-btn {
  font-weight: 600;
  min-width: 160px;
  transition: all 0.3s ease;
}

/* Feature Cards */
.feature-card {
  height: 100%;
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease,
    background-color 0.3s ease;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

:deep(.dark-theme) .feature-card {
  background-color: #2d3748;
  border: 1px solid #4a5568;
}

:deep(.dark-theme) .feature-card :deep(.ant-card-meta-title) {
  color: #e2e8f0;
}

.card-cover-container {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s ease;
}

.feature-card:hover .card-cover-container {
  transform: scale(1.05);
}

.card-cover-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-description {
  padding: 10px 0;
  transition: color 0.3s ease;
}

:deep(.dark-theme) .card-description {
  color: #a0aec0;
}

.card-description ul {
  margin: 16px 0;
  padding-left: 20px;
}

.card-description li {
  margin-bottom: 8px;
}

/* About Section */
.about-section {
  margin: 40px auto 60px;
  max-width: 800px;
  text-align: center;
}

.about-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4a5568;
  transition: color 0.3s ease;
}

:deep(.dark-theme) .about-text {
  color: #a0aec0;
}

.features-header {
  margin-top: 32px;
  margin-bottom: 8px;
  text-align: center;
}

.features-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d3142;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

:deep(.dark-theme) .features-title {
  color: #e2e8f0;
}

.responsive-padding {
  padding: 0 30px;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-btn {
    width: 80%;
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .responsive-padding {
    padding: 0 50px;
  }
}

@media (min-width: 992px) {
  .responsive-padding {
    padding: 0 100px;
  }
}
</style>
