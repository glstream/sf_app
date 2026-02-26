<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />
    <a-layout-content class="responsive-padding">
      <BreadcrumbNavigation />
      
      <div class="guide-container">
        <div class="guide-header">
          <h1>How to Use Fantasy Navigator</h1>
          <p class="guide-subtitle">
            Step-by-step tutorials for getting the most out of our fantasy football tools
          </p>
        </div>

        <div class="guide-sections">
          <div class="guide-section" v-for="guide in guides" :key="guide.id">
            <div class="guide-card">
              <div class="guide-icon">
                <component :is="guide.icon" />
              </div>
              <h2>{{ guide.title }}</h2>
              <p class="guide-description">{{ guide.description }}</p>
              
              <div class="guide-content">
                <div class="steps-container">
                  <div class="step" v-for="(step, index) in guide.steps" :key="index">
                    <div class="step-number">{{ index + 1 }}</div>
                    <div class="step-content">
                      <h4>{{ step.title }}</h4>
                      <p v-html="step.content"></p>
                      <div class="step-tips" v-if="step.tips">
                        <h5>💡 Pro Tips:</h5>
                        <ul>
                          <li v-for="tip in step.tips" :key="tip" v-html="tip"></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="guide-summary" v-if="guide.summary">
                  <h4>📋 Summary</h4>
                  <p v-html="guide.summary"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script setup>
import { ref } from 'vue'
import { 
  TeamOutlined, 
  BarChartOutlined, 
  SwapOutlined, 
  TrophyOutlined,
  DatabaseOutlined,
  LineChartOutlined
} from '@ant-design/icons-vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import BreadcrumbNavigation from './BreadcrumbNavigation.vue'
import ThemeToggleButton from './ThemeToggleButton.vue'

const guides = ref([
  {
    id: 1,
    title: "Connecting Your Fantasy League",
    description: "Learn how to import and analyze your fantasy league data",
    icon: TeamOutlined,
    steps: [
      {
        title: "Navigate to League Dashboard",
        content: "Click on <strong>'League Dashboard'</strong> in the main navigation or homepage. This is your starting point for all league-specific analysis.",
        tips: [
          "Bookmark this page for quick access during the season",
          "The dashboard works with all supported platforms"
        ]
      },
      {
        title: "Enter Your Platform Information",
        content: "Fill out the form with your details:<br/>• <strong>Username:</strong> Your exact username on the fantasy platform<br/>• <strong>Platform:</strong> Select Sleeper, Fleaflicker, or MFL<br/>• <strong>Year:</strong> Choose 2024, 2025, or 2026",
        tips: [
          "Username is case-sensitive on some platforms",
          "Make sure you're using your display name, not email",
          "2026 leagues may not be available until platform creates them"
        ]
      },
      {
        title: "Load Your Leagues",
        content: "Click <strong>'Load Leagues'</strong> to import your data. The system will:<br/>• Find all your leagues for the selected year<br/>• Import roster information<br/>• Calculate power rankings<br/>• Load trade history",
        tips: [
          "This may take 10-15 seconds for large leagues",
          "Refresh the page if leagues don't appear",
          "Private leagues may not be accessible"
        ]
      },
      {
        title: "Select and Analyze",
        content: "Choose a league from the list to access:<br/>• <strong>Roster Analysis:</strong> See your team's strengths and weaknesses<br/>• <strong>Power Rankings:</strong> Compare against league mates<br/>• <strong>Trade Targets:</strong> Identify potential trade partners<br/>• <strong>Best Available:</strong> Find waiver wire gems",
        tips: [
          "Try different ranking sources for varied perspectives",
          "Check both current and future-focused rankings",
          "Use filters to focus on specific positions"
        ]
      }
    ],
    summary: "Once connected, your league data updates automatically. Return to the dashboard anytime to refresh or view different leagues."
  },
  {
    id: 2,
    title: "Using the Trade Calculator",
    description: "Master trade evaluation with our multi-source analysis tool",
    icon: SwapOutlined,
    steps: [
      {
        title: "Access the Trade Calculator",
        content: "Navigate to <strong>'Trade Calculator'</strong> from the main menu. This tool works independently - no league connection required.",
        tips: [
          "Bookmark for quick access during trade negotiations",
          "Works for both dynasty and redraft evaluations"
        ]
      },
      {
        title: "Configure League Settings",
        content: "Set your league parameters:<br/>• <strong>League Type:</strong> Dynasty, Redraft, or Keeper<br/>• <strong>Scoring:</strong> Standard, PPR, or Half-PPR<br/>• <strong>Format:</strong> 1QB or Superflex<br/>• <strong>Bonuses:</strong> TE Premium, 6pt Pass TD",
        tips: [
          "These settings dramatically affect player values",
          "Superflex makes QBs 2-3x more valuable",
          "TE Premium boosts tight end rankings significantly"
        ]
      },
      {
        title: "Build Your Trade",
        content: "Add players to each side:<br/>• Type player names for autocomplete suggestions<br/>• Include draft picks using format '2024 1.05'<br/>• Add multiple players per side<br/>• Remove players by clicking the X",
        tips: [
          "Draft picks format: 'YEAR ROUND.PICK' (e.g., '2025 2.08')",
          "Include all relevant players and picks",
          "Consider packaging deals for better value"
        ]
      },
      {
        title: "Analyze the Results",
        content: "Review the analysis across multiple sources:<br/>• <strong>Overall Value:</strong> Total points for each side<br/>• <strong>Win/Lose Indicator:</strong> Green for favorable, red for unfavorable<br/>• <strong>Percentage Difference:</strong> How lopsided the trade appears<br/>• <strong>Source Breakdown:</strong> KTC, FantasyCalc, DynastyProcess views",
        tips: [
          "Look for consensus across sources",
          "Large discrepancies may indicate market inefficiencies",
          "Consider your team's specific needs beyond raw value"
        ]
      },
      {
        title: "Factor in Context",
        content: "The calculator shows value, but consider:<br/>• <strong>Team Needs:</strong> Positional requirements<br/>• <strong>Timeline:</strong> Competing vs rebuilding<br/>• <strong>League Context:</strong> Trade partner's motivations<br/>• <strong>Injury Risk:</strong> Health concerns",
        tips: [
          "A 'losing' trade might help your team more",
          "Consider playoff timeline and bye weeks",
          "Factor in league mate relationships"
        ]
      }
    ],
    summary: "The Trade Calculator provides objective value analysis, but always consider your specific team context and league dynamics when making decisions."
  },
  {
    id: 3,
    title: "Understanding Player Rankings",
    description: "Navigate our comprehensive ranking system and data sources",
    icon: BarChartOutlined,
    steps: [
      {
        title: "Access Player Rankings",
        content: "Go to <strong>'Player Rankings'</strong> to see consolidated rankings from top fantasy experts. This page shows real-time values from multiple sources.",
        tips: [
          "Rankings update daily during season",
          "Use this for waiver wire decisions",
          "Great for draft preparation"
        ]
      },
      {
        title: "Filter by Position and League",
        content: "Customize your view:<br/>• <strong>Position:</strong> All, QB, RB, WR, TE<br/>• <strong>League Type:</strong> Dynasty, Redraft, Rookie<br/>• <strong>Format:</strong> Standard vs Superflex<br/>• <strong>Source:</strong> Specific expert or combined",
        tips: [
          "Superflex dramatically changes QB values",
          "Dynasty focuses on long-term potential",
          "Rookie rankings help with draft prep"
        ]
      },
      {
        title: "Interpret the Data",
        content: "Understanding what you see:<br/>• <strong>Consensus Rank:</strong> Average across all sources<br/>• <strong>Value:</strong> Numerical trade value<br/>• <strong>Tier:</strong> Groupings of similarly valued players<br/>• <strong>Trend:</strong> Recent movement up or down",
        tips: [
          "Look for tier breaks in drafts",
          "Trends indicate recent news impact",
          "Large source discrepancies suggest uncertainty"
        ]
      },
      {
        title: "Compare Sources",
        content: "Each expert has different methodologies:<br/>• <strong>KeepTradeCut:</strong> Market-based, crowd-sourced<br/>• <strong>FantasyCalc:</strong> Model-based, age-adjusted<br/>• <strong>DynastyProcess:</strong> Analytics-driven approach<br/>• <strong>ESPN/FantasyPros:</strong> Traditional expert rankings",
        tips: [
          "Use multiple sources for balanced perspective",
          "Market vs model values show different insights",
          "Redraft vs dynasty rankings vary significantly"
        ]
      },
      {
        title: "Apply to Your Decisions",
        content: "Use rankings for:<br/>• <strong>Draft Preparation:</strong> Target players and avoid reaches<br/>• <strong>Waiver Claims:</strong> Prioritize adds and drops<br/>• <strong>Trade Negotiations:</strong> Establish player values<br/>• <strong>Lineup Decisions:</strong> Start/sit analysis",
        tips: [
          "Don't follow rankings blindly",
          "Consider your team's specific situation",
          "Factor in matchups and game scripts"
        ]
      }
    ],
    summary: "Player rankings provide the foundation for most fantasy decisions. Use them as a starting point, then adjust for your specific league and team context."
  },
  {
    id: 4,
    title: "Team Analysis & Power Rankings",
    description: "Evaluate your roster strength and identify areas for improvement",
    icon: TrophyOutlined,
    steps: [
      {
        title: "Connect Your League",
        content: "First, import your league data using the League Dashboard. Team analysis requires your actual roster information to provide accurate assessments.",
        tips: [
          "Make sure your league data is current",
          "Analysis updates when you refresh league data"
        ]
      },
      {
        title: "View Your Power Ranking",
        content: "Your team receives rankings in several categories:<br/>• <strong>Overall:</strong> Complete roster strength<br/>• <strong>Positional:</strong> QB, RB, WR, TE breakdowns<br/>• <strong>Age-Adjusted:</strong> Future outlook<br/>• <strong>Multiple Sources:</strong> Different expert perspectives",
        tips: [
          "Compare your ranking across different sources",
          "Age-adjusted rankings show dynasty trajectory",
          "Positional rankings highlight strengths/weaknesses"
        ]
      },
      {
        title: "Analyze Positional Strength",
        content: "Drill down into position groups:<br/>• <strong>Depth Charts:</strong> Your starters vs bench<br/>• <strong>Value Distribution:</strong> How points are allocated<br/>• <strong>Age Profiles:</strong> Current vs future value<br/>• <strong>Tier Analysis:</strong> Elite vs replacement level",
        tips: [
          "Look for drop-offs after starters",
          "Young players with upside valuable in dynasty",
          "Consider bye week coverage"
        ]
      },
      {
        title: "Identify Improvement Areas",
        content: "Use the analysis to find:<br/>• <strong>Weak Positions:</strong> Areas needing upgrades<br/>• <strong>Excess Depth:</strong> Tradeable assets<br/>• <strong>Age Concerns:</strong> Players to move before decline<br/>• <strong>Breakout Candidates:</strong> Young players to hold",
        tips: [
          "Target other teams' excess depth",
          "Trade aging players at peak value",
          "Address weakest position first"
        ]
      },
      {
        title: "Plan Your Strategy",
        content: "Based on your ranking, determine if you should:<br/>• <strong>Compete:</strong> Top 1/3 of league, go all-in<br/>• <strong>Retool:</strong> Middle tier, make targeted improvements<br/>• <strong>Rebuild:</strong> Bottom tier, focus on youth and picks",
        tips: [
          "Don't get stuck in the middle - commit to a direction",
          "Competing teams should trade picks for veterans",
          "Rebuilding teams should trade veterans for picks"
        ]
      }
    ],
    summary: "Team analysis helps you understand your competitive window and make strategic decisions about whether to compete, retool, or rebuild."
  },
  {
    id: 5,
    title: "Advanced Analytics & Projections",
    description: "Leverage data-driven insights for competitive advantages",
    icon: LineChartOutlined,
    steps: [
      {
        title: "Understanding Projections",
        content: "Our projections aggregate multiple sources:<br/>• <strong>ESPN:</strong> Season-long statistical forecasts<br/>• <strong>NFL.com:</strong> Official NFL projections<br/>• <strong>CBS Sports:</strong> Expert consensus views<br/>• <strong>FantasyPros:</strong> Aggregated expert opinions",
        tips: [
          "Projections are estimates, not guarantees",
          "Use for relative comparison between players",
          "Consider injury risk and role changes"
        ]
      },
      {
        title: "Analyzing Value Discrepancies",
        content: "Look for differences between sources:<br/>• <strong>Market vs Model:</strong> KTC vs FantasyCalc gaps<br/>• <strong>Expert Disagreement:</strong> Wide ranking ranges<br/>• <strong>Projection Variance:</strong> Statistical forecast differences<br/>• <strong>Trend Divergence:</strong> Recent movement conflicts",
        tips: [
          "Large discrepancies may indicate opportunities",
          "Market values reflect current sentiment",
          "Model values show long-term projections"
        ]
      },
      {
        title: "Using Advanced Metrics",
        content: "Dig deeper than surface stats:<br/>• <strong>Target Share:</strong> WR opportunity metrics<br/>• <strong>Red Zone Usage:</strong> TD upside indicators<br/>• <strong>Snap Count Trends:</strong> Role expansion/reduction<br/>• <strong>Strength of Schedule:</strong> Upcoming matchups",
        tips: [
          "High target share with low production = buy opportunity",
          "Red zone usage predicts touchdown regression",
          "Snap count trends predict role changes"
        ]
      },
      {
        title: "Applying Predictive Analytics",
        content: "Use data to predict future performance:<br/>• <strong>Age Curves:</strong> When players typically decline<br/>• <strong>Breakout Profiles:</strong> Young player indicators<br/>• <strong>Regression Candidates:</strong> Unsustainable production<br/>• <strong>Opportunity Changes:</strong> Role evolution",
        tips: [
          "RBs decline sharply after age 28",
          "WRs often break out in year 2-3",
          "High TD rates often regress to mean"
        ]
      },
      {
        title: "Building Your Analysis Framework",
        content: "Develop systematic evaluation:<br/>• <strong>Data Collection:</strong> Gather multiple sources<br/>• <strong>Weight Factors:</strong> Prioritize key metrics<br/>• <strong>Context Integration:</strong> Consider situation<br/>• <strong>Decision Framework:</strong> Consistent process",
        tips: [
          "Create your own player evaluation rubric",
          "Don't rely on single data points",
          "Update your framework as you learn"
        ]
      }
    ],
    summary: "Advanced analytics provide edge opportunities, but require systematic approach and contextual understanding to be effective."
  }
])
</script>

<style scoped>
.guide-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.guide-header {
  text-align: center;
  margin-bottom: 48px;
}

.guide-header h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--color-text);
}

.guide-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

.guide-sections {
  display: grid;
  gap: 48px;
}

.guide-card {
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid var(--color-border);
}

.guide-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-size: 24px;
  margin: 0 auto 24px;
}

.guide-card h2 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 16px;
  color: var(--color-text);
}

.guide-description {
  text-align: center;
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.steps-container {
  display: grid;
  gap: 32px;
}

.step {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.step-content {
  flex-grow: 1;
}

.step-content h4 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: var(--color-text);
}

.step-content p {
  line-height: 1.7;
  color: var(--color-text);
  margin-bottom: 16px;
}

.step-tips {
  background: var(--color-background-mute);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
  margin-top: 16px;
}

.step-tips h5 {
  color: var(--color-primary);
  margin-bottom: 8px;
  font-size: 1rem;
}

.step-tips ul {
  margin: 0;
  padding-left: 20px;
}

.step-tips li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.guide-summary {
  margin-top: 32px;
  padding: 20px;
  background: var(--color-background-mute);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.guide-summary h4 {
  color: var(--color-primary);
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.guide-summary p {
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
}

@media (max-width: 768px) {
  .guide-header h1 {
    font-size: 2rem;
  }
  
  .guide-subtitle {
    font-size: 1rem;
  }
  
  .guide-card {
    padding: 24px;
  }
  
  .step {
    flex-direction: column;
    gap: 16px;
  }
  
  .step-number {
    align-self: flex-start;
  }
}
</style>