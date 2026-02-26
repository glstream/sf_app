<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />
    <a-layout-content class="responsive-padding">
      <BreadcrumbNavigation />
      
      <div class="faq-container">
        <div class="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p class="faq-subtitle">
            Get answers to common questions about Fantasy Navigator's tools and fantasy football strategy
          </p>
        </div>

        <div class="faq-sections">
          <div class="faq-section" v-for="section in faqSections" :key="section.title">
            <h2 class="section-title">{{ section.title }}</h2>
            
            <a-collapse v-model:activeKey="activeKeys" class="faq-collapse">
              <a-collapse-panel 
                v-for="faq in section.faqs" 
                :key="faq.id" 
                :header="faq.question"
                class="faq-panel"
              >
                <div class="faq-answer" v-html="faq.answer"></div>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </div>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BreadcrumbNavigation from './BreadcrumbNavigation.vue'
import ThemeToggleButton from './ThemeToggleButton.vue'

const activeKeys = ref([])

const faqSections = ref([
  {
    title: "Getting Started",
    faqs: [
      {
        id: "start-1",
        question: "What is Fantasy Navigator and how can it help me?",
        answer: `
          <p>Fantasy Navigator is a comprehensive analytics platform designed to help fantasy football managers make data-driven decisions. Our tools include:</p>
          <ul>
            <li><strong>League Analysis:</strong> Connect your Sleeper, Fleaflicker, or MFL leagues for detailed roster and trade analysis</li>
            <li><strong>Trade Calculator:</strong> Evaluate trade fairness using multiple expert ranking sources</li>
            <li><strong>Player Rankings:</strong> Access consolidated rankings from top fantasy analysts</li>
            <li><strong>Team Ratings:</strong> Get objective assessments of your roster strength</li>
          </ul>
          <p>All our tools are free to use and designed to give you a competitive edge in your fantasy leagues.</p>
        `
      },
      {
        id: "start-2",
        question: "Which fantasy platforms are supported?",
        answer: `
          <p>Fantasy Navigator currently supports:</p>
          <ul>
            <li><strong>Sleeper:</strong> Full integration including league import, roster analysis, and trade history</li>
            <li><strong>Fleaflicker:</strong> League connectivity and player data synchronization</li>
            <li><strong>MyFantasyLeague (MFL):</strong> Basic league import and roster analysis</li>
          </ul>
          <p>We're constantly working to expand platform support. If you use a different platform, you can still use our standalone tools like the Trade Calculator and Player Rankings.</p>
        `
      },
      {
        id: "start-3",
        question: "How do I connect my fantasy league?",
        answer: `
          <p>Connecting your league is simple:</p>
          <ol>
            <li>Go to the <strong>League Dashboard</strong> from the main menu</li>
            <li>Enter your fantasy platform username</li>
            <li>Select your platform (Sleeper, Fleaflicker, or MFL)</li>
            <li>Choose the league year (2024, 2025, or 2026)</li>
            <li>Click "Load Leagues" to import your data</li>
          </ol>
          <p>Your data is processed securely and we never store sensitive information. The connection pulls publicly available league data only.</p>
        `
      },
      {
        id: "start-4",
        question: "Is Fantasy Navigator free to use?",
        answer: `
          <p>Yes! Fantasy Navigator is completely free to use. All our tools and features are available at no cost.</p>
          <p>We support the platform through:</p>
          <ul>
            <li>Community donations (Buy Me a Coffee link in footer)</li>
            <li>Partnerships with fantasy football data providers</li>
            <li>Potential future premium features (basic tools will always remain free)</li>
          </ul>
          <p>Our goal is to democratize access to high-quality fantasy football analytics for all managers.</p>
        `
      }
    ]
  },
  {
    title: "Using Our Tools",
    faqs: [
      {
        id: "tools-1",
        question: "How does the Trade Calculator work?",
        answer: `
          <p>The Trade Calculator evaluates trades using multiple expert ranking sources:</p>
          <h4>How to Use:</h4>
          <ol>
            <li>Select players for each side of the trade</li>
            <li>Choose your league settings (Superflex, TE Premium, etc.)</li>
            <li>Review the value comparison across multiple sources</li>
            <li>See win/lose indicators and percentage differences</li>
          </ol>
          <h4>Data Sources:</h4>
          <ul>
            <li><strong>KeepTradeCut:</strong> Community-driven dynasty values</li>
            <li><strong>FantasyCalc:</strong> Mathematical model-based rankings</li>
            <li><strong>DynastyProcess:</strong> Analytical approach to player values</li>
            <li><strong>DraftDynasty:</strong> Rookie-focused evaluations</li>
          </ul>
          <p>The tool shows you how different experts value the trade, helping you make informed decisions.</p>
        `
      },
      {
        id: "tools-2",
        question: "What do the different ranking sources mean?",
        answer: `
          <p>Each ranking source has a different methodology:</p>
          <h4>KeepTradeCut (KTC)</h4>
          <ul>
            <li>Based on real user voting and trade data</li>
            <li>Reflects current market sentiment</li>
            <li>Great for understanding trade market values</li>
            <li>Can be influenced by hype and recent performance</li>
          </ul>
          <h4>FantasyCalc (FC)</h4>
          <ul>
            <li>Mathematical model considering age, production, and opportunity</li>
            <li>Less influenced by short-term fluctuations</li>
            <li>Excellent for long-term dynasty planning</li>
            <li>Provides age-adjusted values</li>
          </ul>
          <h4>DynastyProcess (DP)</h4>
          <ul>
            <li>Data-driven approach using advanced metrics</li>
            <li>Incorporates predictive modeling</li>
            <li>Focuses on sustainable production</li>
            <li>Good for identifying value discrepancies</li>
          </ul>
          <h4>DraftDynasty (DD)</h4>
          <ul>
            <li>Specializes in rookie and young player evaluation</li>
            <li>Uses college metrics and NFL opportunity</li>
            <li>Strong focus on upside potential</li>
            <li>Valuable for rookie draft preparation</li>
          </ul>
        `
      },
      {
        id: "tools-3",
        question: "How do I interpret team power rankings?",
        answer: `
          <p>Power rankings show your team's strength across different evaluation methods:</p>
          <h4>Understanding the Rankings:</h4>
          <ul>
            <li><strong>Overall Rank:</strong> Where your team stands in the league (1 = best)</li>
            <li><strong>Positional Breakdown:</strong> Strength at QB, RB, WR, TE positions</li>
            <li><strong>Age-Adjusted:</strong> How your team projects for future seasons</li>
            <li><strong>Multiple Sources:</strong> Rankings from KTC, FantasyCalc, and DynastyProcess</li>
          </ul>
          <h4>What Different Rankings Mean:</h4>
          <ul>
            <li><strong>High overall, low age-adjusted:</strong> Win-now team with aging assets</li>
            <li><strong>Low overall, high age-adjusted:</strong> Young team building for future</li>
            <li><strong>Consistent across sources:</strong> Clear consensus on team strength</li>
            <li><strong>Varied across sources:</strong> Team has polarizing assets</li>
          </ul>
        `
      },
      {
        id: "tools-4",
        question: "How accurate are the player projections?",
        answer: `
          <p>Our projections aggregate data from multiple sources to provide comprehensive forecasts:</p>
          <h4>Projection Sources:</h4>
          <ul>
            <li><strong>ESPN:</strong> Season-long statistical projections</li>
            <li><strong>NFL.com:</strong> Official NFL projections</li>
            <li><strong>CBS Sports:</strong> Expert consensus projections</li>
            <li><strong>FantasyPros:</strong> Aggregated expert opinions</li>
          </ul>
          <h4>Important Notes:</h4>
          <ul>
            <li>Projections are estimates based on current information</li>
            <li>Injuries, trades, and role changes can impact accuracy</li>
            <li>Use projections as one factor in decision-making</li>
            <li>Historical performance shows ~60-70% correlation with actual results</li>
          </ul>
          <p>Projections are updated regularly throughout the season to reflect the latest information.</p>
        `
      }
    ]
  },
  {
    title: "Fantasy Football Strategy",
    faqs: [
      {
        id: "strategy-1",
        question: "What's the difference between Dynasty and Redraft leagues?",
        answer: `
          <h4>Redraft Leagues:</h4>
          <ul>
            <li>Fresh draft every year</li>
            <li>Focus on single-season production</li>
            <li>Age and long-term outlook less important</li>
            <li>Veteran players often preferred</li>
            <li>Simpler roster management</li>
          </ul>
          <h4>Dynasty Leagues:</h4>
          <ul>
            <li>Keep your roster year over year</li>
            <li>Long-term planning essential</li>
            <li>Age and development curve crucial</li>
            <li>Young players with upside prioritized</li>
            <li>Complex roster management with trades</li>
            <li>Separate rookie draft each year</li>
          </ul>
          <p>Fantasy Navigator's tools work for both formats, with dynasty-specific features like long-term player values and age-adjusted rankings.</p>
        `
      },
      {
        id: "strategy-2",
        question: "When should I compete vs. rebuild in dynasty?",
        answer: `
          <h4>Signs You Should Compete:</h4>
          <ul>
            <li>Top 3 team in power rankings</li>
            <li>Strong at QB and multiple skill positions</li>
            <li>Depth to handle injuries</li>
            <li>Window of 2-3 competitive years</li>
          </ul>
          <h4>Signs You Should Rebuild:</h4>
          <ul>
            <li>Bottom half of league standings</li>
            <li>Aging roster with declining players</li>
            <li>Lack of depth at key positions</li>
            <li>Multiple years away from contention</li>
          </ul>
          <h4>Rebuild Strategy:</h4>
          <ul>
            <li>Trade aging veterans for young assets</li>
            <li>Accumulate draft picks</li>
            <li>Target players 25 and under</li>
            <li>Focus on ceiling over floor</li>
          </ul>
          <h4>Compete Strategy:</h4>
          <ul>
            <li>Trade picks for proven veterans</li>
            <li>Add depth for injury protection</li>
            <li>Target high-floor players</li>
            <li>Make strategic waiver claims</li>
          </ul>
        `
      },
      {
        id: "strategy-3",
        question: "How should I value draft picks?",
        answer: `
          <p>Draft picks are valuable assets that require careful evaluation:</p>
          <h4>Pick Value Factors:</h4>
          <ul>
            <li><strong>Draft Position:</strong> Earlier picks significantly more valuable</li>
            <li><strong>Draft Class Strength:</strong> Strong classes increase all pick values</li>
            <li><strong>Timeline:</strong> Current year vs future year picks</li>
            <li><strong>League Competitiveness:</strong> Affects late-round pick likelihood</li>
          </ul>
          <h4>General Value Guidelines:</h4>
          <ul>
            <li><strong>Early 1st (1.01-1.04):</strong> Worth established WR2/RB2</li>
            <li><strong>Mid 1st (1.05-1.08):</strong> Worth young WR3/RB3 with upside</li>
            <li><strong>Late 1st (1.09-1.12):</strong> Worth veteran depth or young lottery tickets</li>
            <li><strong>2nd Round:</strong> Worth bench players with potential</li>
            <li><strong>3rd+ Rounds:</strong> Lottery tickets and depth</li>
          </ul>
          <p>Use Fantasy Navigator's trade calculator to see current market values for picks vs established players.</p>
        `
      },
      {
        id: "strategy-4",
        question: "How do I handle Superflex leagues differently?",
        answer: `
          <p>Superflex (2QB) leagues dramatically change positional values:</p>
          <h4>Key Differences:</h4>
          <ul>
            <li><strong>QB Values Skyrocket:</strong> QBs become the most valuable position</li>
            <li><strong>QB Depth Essential:</strong> Need 3-4 QBs on roster</li>
            <li><strong>Draft Strategy Changes:</strong> Target QBs early and often</li>
            <li><strong>Waivers Different:</strong> QB pickups more valuable than RB/WR</li>
          </ul>
          <h4>Superflex Draft Strategy:</h4>
          <ul>
            <li>Secure your starting QBs first (rounds 1-3)</li>
            <li>Don't wait on QB3 - depth is crucial</li>
            <li>Young QBs with rushing upside preferred</li>
            <li>Rookie QBs in good situations are gold</li>
          </ul>
          <h4>Trade Strategy:</h4>
          <ul>
            <li>QB trades command premium prices</li>
            <li>Never trade away your QB2 without replacement</li>
            <li>Target teams with QB depth for other positions</li>
            <li>Injuries create massive trade opportunities</li>
          </ul>
          <p>Fantasy Navigator automatically adjusts values for Superflex settings in all tools.</p>
        `
      }
    ]
  },
  {
    title: "Technical Questions",
    faqs: [
      {
        id: "tech-1",
        question: "Why can't I see my league after entering my username?",
        answer: `
          <h4>Common Issues and Solutions:</h4>
          <ul>
            <li><strong>Wrong Platform:</strong> Make sure you selected the correct platform (Sleeper/Fleaflicker/MFL)</li>
            <li><strong>Username Spelling:</strong> Double-check your username spelling and capitalization</li>
            <li><strong>League Year:</strong> Ensure you selected the correct year (2024, 2025, or 2026)</li>
            <li><strong>Private Leagues:</strong> Some leagues may have privacy settings that prevent data access</li>
            <li><strong>Platform Issues:</strong> Occasionally, fantasy platforms have API downtime</li>
          </ul>
          <h4>Troubleshooting Steps:</h4>
          <ol>
            <li>Try refreshing the page and re-entering information</li>
            <li>Check if you can access your league on the platform's website</li>
            <li>Try a different browser or clear your cache</li>
            <li>Contact us if the issue persists</li>
          </ol>
        `
      },
      {
        id: "tech-2",
        question: "How often is player data updated?",
        answer: `
          <p>We update data from multiple sources on different schedules:</p>
          <h4>Update Frequencies:</h4>
          <ul>
            <li><strong>Player Rankings:</strong> Updated daily from KTC, FantasyCalc, DynastyProcess</li>
            <li><strong>League Data:</strong> Updated when you refresh/reload leagues</li>
            <li><strong>Projections:</strong> Updated weekly during season, bi-weekly in offseason</li>
            <li><strong>Trade Data:</strong> Updated in real-time when leagues sync</li>
          </ul>
          <h4>Manual Updates:</h4>
          <p>You can force refresh your league data by:</p>
          <ol>
            <li>Going back to the League Dashboard</li>
            <li>Re-entering your information</li>
            <li>Clicking "Load Leagues" again</li>
          </ol>
          <p>This pulls the latest data from your fantasy platform.</p>
        `
      },
      {
        id: "tech-3",
        question: "Is my league data secure?",
        answer: `
          <p>Yes, we take data security seriously:</p>
          <h4>Data Practices:</h4>
          <ul>
            <li><strong>No Storage:</strong> We don't permanently store your league data</li>
            <li><strong>Public Data Only:</strong> We only access publicly available league information</li>
            <li><strong>No Passwords:</strong> We never ask for or store platform passwords</li>
            <li><strong>Session-Based:</strong> Data is only loaded for your current session</li>
          </ul>
          <h4>What We Access:</h4>
          <ul>
            <li>League rosters and settings</li>
            <li>Trade history and transactions</li>
            <li>Public league standings</li>
            <li>Player ownership information</li>
          </ul>
          <h4>What We Don't Access:</h4>
          <ul>
            <li>Private messages or league chat</li>
            <li>Payment or financial information</li>
            <li>Personal account details</li>
            <li>League commissioner tools</li>
          </ul>
        `
      },
      {
        id: "tech-4",
        question: "Can I suggest new features?",
        answer: `
          <p>Absolutely! We love hearing from the fantasy football community.</p>
          <h4>How to Suggest Features:</h4>
          <ul>
            <li><strong>Email:</strong> Send suggestions to fantasypilot1@gmail.com</li>
            <li><strong>Social Media:</strong> Follow us on Blue Sky @fantasynavigator</li>
            <li><strong>Contact Form:</strong> Use the contact page on our site</li>
          </ul>
          <h4>What We're Looking For:</h4>
          <ul>
            <li>Tools that would help your fantasy decision-making</li>
            <li>Data sources you'd like to see integrated</li>
            <li>Platform support requests</li>
            <li>User experience improvements</li>
          </ul>
          <h4>Recent Community-Requested Features:</h4>
          <ul>
            <li>Trade history analysis</li>
            <li>Multi-year player value trends</li>
            <li>League power ranking comparisons</li>
            <li>Rookie pick value calculator</li>
          </ul>
          <p>While we can't implement every suggestion, we carefully consider all feedback and prioritize features that benefit the most users.</p>
        `
      }
    ]
  }
])
</script>

<style scoped>
.faq-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.faq-header {
  text-align: center;
  margin-bottom: 48px;
}

.faq-header h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--color-text);
}

.faq-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.faq-sections {
  display: grid;
  gap: 40px;
}

.section-title {
  font-size: 1.8rem;
  color: var(--color-primary);
  margin-bottom: 24px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 8px;
}

.faq-collapse {
  background: transparent;
  border: none;
}

.faq-panel {
  margin-bottom: 16px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.faq-answer {
  line-height: 1.7;
  color: var(--color-text);
}

.faq-answer h4 {
  color: var(--color-primary);
  margin-top: 20px;
  margin-bottom: 12px;
  font-size: 1.1rem;
}

.faq-answer ul, .faq-answer ol {
  margin-bottom: 16px;
  padding-left: 24px;
}

.faq-answer li {
  margin-bottom: 8px;
}

.faq-answer strong {
  color: var(--color-primary);
}

.faq-answer p {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .faq-header h1 {
    font-size: 2rem;
  }
  
  .faq-subtitle {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .faq-container {
    padding: 16px;
  }
}
</style>