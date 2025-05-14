<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />
    <a-layout-content class="responsive-padding">
      <div class="policy-container">
        <h1>Privacy Policy</h1>
        <p>Last updated: {{ currentDate }}</p>

        <h2>Introduction</h2>
        <p>
          Fantasy Navigator ("we", "our", or "us") respects your privacy and is committed to
          protecting your personal data. This Privacy Policy explains how we handle data when you
          visit our website.
        </p>

        <h2>Information We Collect</h2>
        <p>
          When you visit our website, we may automatically collect certain information about your
          device, including information about your web browser, IP address, time zone, and some of
          the cookies that are installed on your device.
        </p>

        <h2>Cookies and Third-Party Advertising</h2>
        <p>
          Our website uses cookies to enhance your browsing experience. We also use third-party
          vendors, including Google, who use cookies to serve ads based on your prior visits to our
          website or other websites.
        </p>
        <p>
          Google's use of advertising cookies enables it and its partners to serve ads to users
          based on their visit to our site and/or other sites on the Internet.
        </p>

        <h2>Opting Out</h2>
        <p>
          You can opt out of personalized advertising by visiting
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
            >Google Ads Settings</a
          >. Additionally, you can opt out of some third-party vendors' uses of cookies for
          personalized advertising by visiting
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer"
            >www.aboutads.info</a
          >.
        </p>

        <h2>Data Retention</h2>
        <p>
          We do not collect or store personal user information beyond standard access logs and
          information provided by analytics and advertising cookies as described above.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us through our
          <a href="https://bsky.app/profile/fantasynavigator.bsky.social" target="_blank"
            >Blue Sky account</a
          >.
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

.policy-container {
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

a {
  color: var(--ant-primary-color, #1890ff);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
