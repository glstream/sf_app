<template>
  <div class="header-container">
    <a-layout-header class="header">
      <a-row align="middle" class="header-row">
        <a-col :xs="4" :sm="4" :md="5" :lg="5">
          <router-link to="/" class="logo-link">
            <img :src="logoImg" alt="Logo" class="logo" />
          </router-link>
        </a-col>
        <a-col :xs="20" :sm="20" :md="19" :lg="19">
          <div class="menu-container">
            <!-- Desktop Menu -->
            <a-menu
              v-model:selectedKeys="activeKey"
              mode="horizontal"
              :items="items"
              class="desktop-menu"
            />

            <!-- Mobile Menu Button -->
            <a-button @click="mobileMenuVisible = !mobileMenuVisible" class="mobile-menu-button">
              <MenuOutlined />
            </a-button>
          </div>
        </a-col>
      </a-row>
    </a-layout-header>

    <!-- Mobile Menu Drawer -->
    <a-drawer
      v-model:visible="mobileMenuVisible"
      placement="right"
      :width="250"
      :closable="true"
      @close="mobileMenuVisible = false"
    >
      <a-menu
        v-model:selectedKeys="activeKey"
        mode="inline"
        :items="mobileItems"
        @click="handleMenuClick"
      />
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logoImg from '@/assets/logo5.png'

import { useUserStore } from '@/stores/userStore'
import { message, MenuProps } from 'ant-design-vue'
import {
  HomeOutlined,
  CalculatorOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  QuestionCircleOutlined,
  MenuOutlined
} from '@ant-design/icons-vue'

import { useLeaguesStore } from '@/stores/leaguesStore'

const leaguesStore = useLeaguesStore()
const store = useUserStore()
const router = useRouter()
const route = useRoute()

const mobileMenuVisible = ref(false)
const activeKey = ref<string[]>([])

// Set active menu item based on current route
onMounted(() => {
  updateActiveKey()
})

watch(
  () => route.path,
  () => {
    updateActiveKey()
  }
)

function updateActiveKey() {
  const path = route.path
  if (path === '/') activeKey.value = ['home']
  else if (path.includes('/tradecalculator')) activeKey.value = ['tradeCalculator']
  else if (path.includes('/leagues')) activeKey.value = ['leagues']
  else if (path.includes('/ranks')) activeKey.value = ['ranks']
  else if (path.includes('/about')) activeKey.value = ['about']
  else if (path.includes('/league/')) activeKey.value = ['leagues']
}

const leaguesUrl = computed(() => `/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)

function groupLeaguesByType(leagues) {
  return leagues.reduce((acc, league) => {
    const type = league.league_type || 'Other'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(league)
    return acc
  }, {})
}

function handleMenuClick(e) {
  mobileMenuVisible.value = false
}

const createRouterLink = (to, label) => {
  return () => h('span', { onClick: () => router.push(to) }, label)
}

// Add this new function to handle league navigation
function navigateToLeague(league) {
  const leagueUrl = `/league/${league.league_id}/sf/${league.league_type}/${league.guid}/${league.league_year}/${league.user_name}/${league.league_name}/${league.roster_type}/${league.user_id}/${league.avatar}/${league.starter_cnt}/${league.total_rosters}`

  // If we're already on a league page, use router.replace instead of push to ensure full reload
  if (route.path.includes('/league/')) {
    // Force a reload of the page after navigation
    router.replace(leagueUrl).then(() => {
      window.location.reload()
    })
  } else {
    // Normal navigation if not coming from another league page
    router.push(leagueUrl)
  }
}

// --- Desktop Menu Items with Grouped Leagues Dropdown ---
const items = computed(() => {
  const baseItems = [
    {
      key: 'home',
      icon: () => h(HomeOutlined),
      label: 'Home',
      title: 'Home',
      onClick: () => router.push('/')
    },
    // Leagues dropdown grouped by type
    leaguesStore.leagues && leaguesStore.leagues.length > 0
      ? {
          key: 'leagues',
          icon: () => h(AppstoreOutlined),
          label: 'Leagues',
          title: 'Leagues',
          // Add onClick handler to navigate to leagues summary page when clicking the main item
          onClick: () => {
            if (store.userName && store.leagueYear && store.guid) {
              router.push(`/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)
            } else {
              router.push('/username')
            }
          },
          children: Object.entries(groupLeaguesByType(leaguesStore.leagues)).map(
            ([leagueType, leagues]) => ({
              key: `group-${leagueType}`,
              label: leagueType,
              children: leagues.map((league) => ({
                key: league.league_id,
                label: league.league_name,
                onClick: () => navigateToLeague(league)
              }))
            })
          )
        }
      : {
          key: 'leagues',
          icon: () => h(AppstoreOutlined),
          label: 'Leagues',
          title: 'Leagues',
          onClick: () => {
            if (
              leaguesStore.leagues &&
              leaguesStore.leagues.length > 0 &&
              store.userName &&
              store.leagueYear &&
              store.guid
            ) {
              router.push(`/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)
            } else {
              router.push('/username')
            }
          }
        },
    {
      key: 'tradeCalculator',
      icon: () => h(CalculatorOutlined),
      label: 'Trade Calculator',
      title: 'Trade Calculator',
      onClick: () => router.push('/tradecalculator')
    },
    {
      key: 'ranks',
      icon: () => h(OrderedListOutlined),
      label: 'Rankings',
      title: 'Rankings',
      onClick: () => router.push('/ranks')
    },

    {
      key: 'about',
      icon: () => h(QuestionCircleOutlined),
      label: 'About',
      title: 'About',
      onClick: () => router.push('/about')
    }
  ]
  return baseItems
})

// --- Mobile Menu Items: Leagues grouped by type ---
const mobileItems = computed(() => {
  const baseItems = [
    {
      key: 'home',
      icon: () => h(HomeOutlined),
      label: 'Home',
      title: 'Home',
      onClick: () => router.push('/')
    },
    {
      key: 'tradeCalculator',
      icon: () => h(CalculatorOutlined),
      label: 'Trade Calculator',
      title: 'Trade Calculator',
      onClick: () => router.push('/tradecalculator')
    },
    {
      key: 'ranks',
      icon: () => h(OrderedListOutlined),
      label: 'Rankings',
      title: 'Rankings',
      onClick: () => router.push('/ranks')
    },
    {
      key: 'about',
      icon: () => h(QuestionCircleOutlined),
      label: 'About',
      title: 'About',
      onClick: () => router.push('/about')
    }
  ]

  if (leaguesStore.leagues && leaguesStore.leagues.length > 0) {
    baseItems.push({
      key: 'leagues-overview',
      icon: () => h(AppstoreOutlined),
      label: 'All Leagues',
      title: 'All Leagues',
      onClick: () => {
        if (store.userName && store.leagueYear && store.guid) {
          router.push(`/leagues/${store.leagueYear}/${store.userName}/${store.guid}`)
        } else {
          router.push('/username')
        }
      }
    })

    const grouped = groupLeaguesByType(leaguesStore.leagues)
    Object.entries(grouped).forEach(([leagueType, leagues]) => {
      baseItems.push({
        key: `type-label-${leagueType}`,
        label: leagueType,
        class: 'mobile-league-type-label',
        disabled: true,
        title: leagueType
      })

      leagues.forEach((league) => {
        baseItems.push({
          key: `league-${league.league_id}`,
          label: league.league_name,
          title: league.league_name,
          class: 'mobile-league-item',
          // Update mobile menu items to use the same navigation function
          onClick: () => navigateToLeague(league)
        })
      })
    })
  } else {
    baseItems.push({
      key: 'leagues-fallback',
      icon: () => h(AppstoreOutlined),
      label: 'Leagues',
      title: 'Leagues',
      onClick: () => router.push('/username')
    })
  }

  return baseItems
})
</script>

<style scoped>
.header-container {
  position: relative;
}

.header {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0 20px;
  height: 64px;
  line-height: 64px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Dark theme header adjustments */
html.dark .header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-row {
  height: 100%;
}

.logo-link {
  display: inline-block;
  height: 40px;
}

.logo {
  height: 40px;
  margin-right: 10px;
  vertical-align: middle;
}

.menu-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.desktop-menu {
  border-bottom: none;
  background: transparent;
}

/* Menu theme integration */
:deep(.ant-menu-horizontal) {
  background: transparent;
  border-bottom: none;
}

:deep(.ant-menu-item) {
  color: var(--color-text) !important;
  transition: color 0.3s ease;
}

:deep(.ant-menu-item:hover) {
  color: var(--color-primary) !important;
}

:deep(.ant-menu-item-selected) {
  color: var(--color-primary) !important;
}

:deep(.ant-menu-item-selected::after) {
  border-bottom-color: var(--color-primary) !important;
}

/* Mobile menu button theme */
.mobile-menu-button {
  display: none;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  margin-left: auto;
  transition: all 0.3s ease;
}

.mobile-menu-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Mobile drawer theme support */
:deep(.ant-drawer-content) {
  background: var(--color-background);
}

:deep(.ant-drawer-header) {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

:deep(.ant-drawer-close) {
  color: var(--color-text);
}

:deep(.ant-menu-inline) {
  background: var(--color-background);
  border-right: none;
}

:deep(.ant-menu-inline .ant-menu-item) {
  color: var(--color-text) !important;
}

:deep(.ant-menu-inline .ant-menu-item:hover) {
  background: var(--color-background-mute);
  color: var(--color-primary) !important;
}

:deep(.ant-menu-inline .ant-menu-item-selected) {
  background: var(--color-background-mute);
  color: var(--color-primary) !important;
}


.mobile-league-type-label {
  padding-left: 16px !important;
  font-weight: bold;
  color: var(--color-text);
  margin-top: 8px;
  font-size: 0.95em;
  opacity: 1;
  transition: color 0.3s ease;
}

.mobile-league-item {
  padding-left: 24px !important;
  font-size: 0.9em;
  opacity: 0.85;
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

/* Mobile styles */
@media (max-width: 768px) {
  .desktop-menu {
    display: none;
  }

  .mobile-menu-button {
    display: block !important;
  }

  .header {
    padding: 0 12px;
    height: 56px;
    line-height: 56px;
  }

  .logo {
    height: 32px;
  }
}
</style>
