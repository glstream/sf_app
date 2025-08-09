<template>
  <nav class="breadcrumb-nav" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <router-link to="/" class="breadcrumb-link">
          <home-outlined />
          Home
        </router-link>
      </li>
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
        <span class="breadcrumb-separator" aria-hidden="true">/</span>
        <router-link 
          v-if="crumb.path && index < breadcrumbs.length - 1" 
          :to="crumb.path" 
          class="breadcrumb-link"
        >
          {{ crumb.text }}
        </router-link>
        <span v-else class="breadcrumb-current" aria-current="page">
          {{ crumb.text }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeOutlined } from '@ant-design/icons-vue'

const route = useRoute()

interface Breadcrumb {
  text: string
  path?: string
}

const breadcrumbs = computed((): Breadcrumb[] => {
  const path = route.path
  const routeName = route.name as string
  const crumbs: Breadcrumb[] = []

  // Handle different route patterns
  if (path === '/') {
    return []
  }

  if (path === '/about') {
    crumbs.push({ text: 'About' })
  } else if (path === '/privacy-policy') {
    crumbs.push({ text: 'Privacy Policy' })
  } else if (path === '/terms-of-service') {
    crumbs.push({ text: 'Terms of Service' })
  } else if (path === '/tradecalculator') {
    crumbs.push({ text: 'Trade Calculator' })
  } else if (path === '/ranks') {
    crumbs.push({ text: 'Player Rankings' })
  } else if (path === '/ratemyteam') {
    crumbs.push({ text: 'Rate My Team' })
  } else if (path === '/username') {
    crumbs.push({ text: 'Enter Username' })
  } else if (path.startsWith('/leagues/')) {
    crumbs.push({ text: 'Leagues', path: '/username' })
    crumbs.push({ text: 'League View' })
  } else if (path.startsWith('/leaguesummary/')) {
    crumbs.push({ text: 'Leagues', path: '/username' })
    crumbs.push({ text: 'League Summary' })
  } else if (path.startsWith('/league/')) {
    crumbs.push({ text: 'Leagues', path: '/username' })
    crumbs.push({ text: 'League Details' })
  }

  return crumbs
})
</script>

<style scoped>
.breadcrumb-nav {
  margin-bottom: 16px;
  padding: 8px 0;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.9rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary);
  background: var(--color-background-soft, rgba(0, 0, 0, 0.05));
  text-decoration: none;
}

.breadcrumb-current {
  color: var(--color-text);
  font-weight: 500;
  padding: 4px 8px;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: var(--color-text-tertiary, #ccc);
}

/* Dark theme adjustments */
html.dark .breadcrumb-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .breadcrumb-nav {
    margin-bottom: 12px;
  }
  
  .breadcrumb-list {
    font-size: 0.8rem;
  }
  
  .breadcrumb-link,
  .breadcrumb-current {
    padding: 2px 4px;
  }
  
  .breadcrumb-separator {
    margin: 0 4px;
  }
}
</style>