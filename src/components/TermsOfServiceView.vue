<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />
    <a-layout-content class="responsive-padding">
      <BreadcrumbNavigation />
      <div class="terms-container">
        <h1>Terms of Service</h1>
        <p>Last updated: {{ currentDate }}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Fantasy Navigator ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Fantasy Navigator is a web-based platform that provides fantasy football analytics, rankings, trade calculators, and team analysis tools. The Service aggregates data from various sources to help users make informed decisions in their fantasy football leagues.
        </p>

        <h2>3. User Conduct</h2>
        <p>
          You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
        </p>
        <ul>
          <li>Use the Service for any illegal or unauthorized purpose</li>
          <li>Attempt to gain unauthorized access to any portion of the Service</li>
          <li>Interfere with or disrupt the Service or servers connected to the Service</li>
          <li>Use automated scripts or bots to access the Service</li>
        </ul>

        <h2>4. Data Sources and Accuracy</h2>
        <p>
          The Service relies on third-party data sources including Sleeper, KeepTradeCut, FantasyCalc, DynastyDaddy, ESPN, NFL Projections, and Dynasty Process. While we strive to provide accurate information, we make no warranties about the completeness, accuracy, or reliability of any data or analysis provided.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are owned by Fantasy Navigator and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </p>

        <h2>6. Third-Party Services</h2>
        <p>
          Our Service may contain links to third-party websites or services that are not owned or controlled by Fantasy Navigator. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
        </p>

        <h2>7. Analytics and Cookies</h2>
        <p>
          We use Google Analytics and Google AdSense to analyze usage patterns and serve advertisements. These services may use cookies and similar technologies to collect information about your use of the Service. By using our Service, you consent to the use of these analytics and advertising services.
        </p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>
          The information on this Service is provided on an "AS IS" basis. Fantasy Navigator makes no representations or warranties of any kind, express or implied, as to the operation of the Service or the information included on this Service.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          Fantasy Navigator will not be liable for any damages of any kind arising from the use of this Service, including, but not limited to direct, indirect, incidental, punitive, and consequential damages.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be interpreted and governed by the laws of the jurisdiction in which Fantasy Navigator operates, without regard to conflict of law provisions.
        </p>

        <h2>12. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us through our 
          <a href="https://bsky.app/profile/fantasynavigator.bsky.social" target="_blank" rel="noopener noreferrer">Blue Sky account</a>.
        </p>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation.vue'

// Format current date for the "Last updated" section
const currentDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.responsive-padding {
  padding: 0 16px;
  max-width: 1000px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .responsive-padding {
    padding: 0 32px;
  }
}

.terms-container {
  padding: 24px 0;
  color: var(--color-text);
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 16px;
}

h2 {
  font-size: 1.3rem;
  margin-top: 24px;
  margin-bottom: 12px;
}

p {
  margin-bottom: 16px;
  line-height: 1.6;
}

ul {
  margin-bottom: 16px;
  padding-left: 24px;
}

li {
  margin-bottom: 8px;
  line-height: 1.6;
}

a {
  color: var(--ant-primary-color, #1890ff);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>