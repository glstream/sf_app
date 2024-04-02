<template>
  <a-layout class="layout">
    <AppHeader />
    <a-layout-content style="padding: 0 100px">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item><a href="/username">Home</a></a-breadcrumb-item>
        <a-breadcrumb-item>Analytics</a-breadcrumb-item>
      </a-breadcrumb>
      <TabView :scrollable="true">
        <TabPanel header="Rankings"></TabPanel>
        <TabPanel header="Coming Soon"></TabPanel>
      </TabView>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// 3rd Party imports
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
</script>

<style scoped></style>
