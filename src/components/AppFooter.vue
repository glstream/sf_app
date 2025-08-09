<template>
  <footer class="custom-footer" role="contentinfo">
    <a-layout-footer class="footer-content">
      <nav class="footer-nav" aria-label="Footer navigation">
        <a href="https://bsky.app/profile/fantasynavigator.bsky.social" 
           target="_blank" 
           rel="noopener noreferrer"
           aria-label="Follow Fantasy Navigator on Blue Sky">Follow on Blue Sky</a>
        <span class="separator" aria-hidden="true">|</span>
        <a href="https://www.buymeacoffee.com/superflex" 
           target="_blank" 
           rel="noopener noreferrer">Donate</a>
        <span class="separator" aria-hidden="true">|</span>
        <router-link to="/privacy-policy">Privacy Policy</router-link>
        <span class="separator" aria-hidden="true">|</span>
        <router-link to="/terms-of-service">Terms of Service</router-link>
      </nav>
      <div class="data-attribution">
        Data provided by 
        <a href="https://sleeper.app/" target="_blank" rel="noopener noreferrer">Sleeper</a>,
        <a href="https://keeptradecut.com/" target="_blank" rel="noopener noreferrer">KeepTradeCut</a>,
        <a href="https://www.fantasycalc.com/" target="_blank" rel="noopener noreferrer">FantasyCalc</a>,
        <a href="https://www.dynasty-daddy.com/" target="_blank" rel="noopener noreferrer">DynastyDaddy</a>,
        <a href="https://www.espn.com/" target="_blank" rel="noopener noreferrer">ESPN</a>,
        <a href="https://www.nfl.com/" target="_blank" rel="noopener noreferrer">NFL Projections</a>, and
        <a href="https://dynastyprocess.com/" target="_blank" rel="noopener noreferrer">Dynasty Process</a>.
      </div>
      <div class="copyright">
        All trademarks and copyrights are the property of their respective owners.<br />
        <span>&copy; 2025 FantasyNavigator</span>
      </div>
    </a-layout-footer>
  </footer>
</template>

<style scoped>
.custom-footer {
  text-align: center;
  margin-top: auto;
}

.footer-content {
  padding: 20px 10px !important;
  font-size: 10px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.footer-nav {
  margin-bottom: 12px;
}

.footer-nav a {
  color: var(--color-text-secondary);
  text-decoration: none;
  margin: 0 4px;
}

.footer-nav a:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.separator {
  margin: 0 8px;
  color: var(--color-text-tertiary);
}

.data-attribution {
  margin: 8px 0;
}

.data-attribution a {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.data-attribution a:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.copyright {
  margin-top: 8px;
  font-size: 9px;
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .footer-content {
    padding: 16px 8px !important;
    font-size: 9px;
  }
  
  .footer-nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
  }
  
  .separator {
    margin: 0 4px;
  }
}
</style>
