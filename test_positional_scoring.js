// Manual implementation of the DraftSimulator logic for testing
class TestDraftSimulator {
  constructor(players) {
    this.players = players;
    this.rankedPlayers = this.rankPlayers(players);
  }
  
  rankPlayers(players) {
    return [...players]
      .filter(p => p.value && p.value > 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .map((player, index) => ({
        ...player,
        overallRank: index + 1
      }));
  }
  
  analyzeUserTeam(userPlayers) {
    const totalScore = this.calculateTeamScore(userPlayers);
    const totalValue = userPlayers.reduce((sum, player) => sum + (player.value || 0), 0);
    
    let explanation;
    if (totalScore >= 90) {
      explanation = `Excellent team with ${totalValue.toLocaleString()} total value. Strong across all positions.`;
    } else if (totalScore >= 80) {
      explanation = `Very good team with ${totalValue.toLocaleString()} total value. Competitive roster construction.`;
    } else if (totalScore >= 70) {
      explanation = `Solid team with ${totalValue.toLocaleString()} total value. Good foundation with room for improvement.`;
    } else if (totalScore >= 60) {
      explanation = `Average team with ${totalValue.toLocaleString()} total value. Consider upgrading key positions.`;
    } else {
      explanation = `Rebuilding team with ${totalValue.toLocaleString()} total value. Focus on long-term development.`;
    }
    
    return {
      totalScore,
      explanation
    };
  }
  
  calculateTeamScore(userPlayers) {
    // Group players by position
    const playersByPosition = {
      QB: userPlayers.filter(p => p.position === 'QB').sort((a, b) => (b.value || 0) - (a.value || 0)),
      RB: userPlayers.filter(p => p.position === 'RB').sort((a, b) => (b.value || 0) - (a.value || 0)),
      WR: userPlayers.filter(p => p.position === 'WR').sort((a, b) => (b.value || 0) - (a.value || 0)),
      TE: userPlayers.filter(p => p.position === 'TE').sort((a, b) => (b.value || 0) - (a.value || 0))
    };
    
    // Calculate positional scores with requirements and penalties
    let totalScore = 0;
    let debugScores = {};
    
    // QB Scoring (Superflex - 2 QBs are critical)
    const qbScore = this.calculatePositionalScore(playersByPosition.QB, {
      required: 2,
      optimal: 3,
      maxCount: 4,
      positionMultiplier: 1.2 // QB premium in superflex
    });
    totalScore += qbScore;
    debugScores.QB = qbScore;
    
    // RB Scoring  
    const rbScore = this.calculatePositionalScore(playersByPosition.RB, {
      required: 2,
      optimal: 3,
      maxCount: 6,
      positionMultiplier: 1.0
    });
    totalScore += rbScore;
    debugScores.RB = rbScore;
    
    // WR Scoring
    const wrScore = this.calculatePositionalScore(playersByPosition.WR, {
      required: 3,
      optimal: 4,
      maxCount: 8,
      positionMultiplier: 1.0
    });
    totalScore += wrScore;
    debugScores.WR = wrScore;
    
    // TE Scoring
    const teScore = this.calculatePositionalScore(playersByPosition.TE, {
      required: 1,
      optimal: 2,
      maxCount: 3,
      positionMultiplier: 1.0
    });
    totalScore += teScore;
    debugScores.TE = teScore;
    
    // Store debug info for later use
    this.lastDebugScores = debugScores;
    this.lastTotalScore = totalScore;
    
    // Convert to 100-point scale with positional balance bonus
    const baseScore = Math.min(100, Math.max(0, totalScore / 850)); // Adjusted denominator for better scaling
    const balanceBonus = this.calculateBalanceBonus(playersByPosition);
    
    this.lastBalanceBonus = balanceBonus;
    this.lastBaseScore = baseScore;
    
    return Math.min(100, Math.round(baseScore + balanceBonus));
  }
  
  calculatePositionalScore(players, config) {
    let score = 0;
    
    for (let i = 0; i < Math.min(players.length, config.maxCount); i++) {
      const player = players[i];
      let playerValue = (player.value || 0) * config.positionMultiplier;
      
      if (i < config.required) {
        // Required starters get full value
        score += playerValue;
      } else if (i < config.optimal) {
        // Optimal depth gets 70% value
        score += playerValue * 0.7;
      } else {
        // Extra depth gets 40% value
        score += playerValue * 0.4;
      }
    }
    
    // Penalty for missing required players
    const missing = Math.max(0, config.required - players.length);
    score -= missing * 3000; // Heavy penalty for missing starters
    
    return score;
  }
  
  calculateBalanceBonus(playersByPosition) {
    let bonus = 0;
    
    // Bonus for having at least minimum at each position
    if (playersByPosition.QB.length >= 2) bonus += 2;
    if (playersByPosition.RB.length >= 2) bonus += 2;
    if (playersByPosition.WR.length >= 3) bonus += 2;
    if (playersByPosition.TE.length >= 1) bonus += 2;
    
    // Extra bonus for optimal roster construction
    if (playersByPosition.QB.length >= 3) bonus += 1;
    if (playersByPosition.RB.length >= 3) bonus += 1;
    if (playersByPosition.WR.length >= 4) bonus += 1;
    if (playersByPosition.TE.length >= 2) bonus += 1;
    
    return bonus;
  }
}

// Player data for test scenarios
const testPlayers = [
  // QBs
  { player_id: 'allen', full_name: 'Josh Allen', position: 'QB', team: 'BUF', value: 12000 },
  { player_id: 'mahomes', full_name: 'Patrick Mahomes', position: 'QB', team: 'KC', value: 11000 },
  { player_id: 'herbert', full_name: 'Justin Herbert', position: 'QB', team: 'LAC', value: 8000 },
  { player_id: 'burrow', full_name: 'Joe Burrow', position: 'QB', team: 'CIN', value: 7000 },
  { player_id: 'herbert2', full_name: 'Justin Herbert (Alt)', position: 'QB', team: 'LAC', value: 6000 },
  { player_id: 'jackson', full_name: 'Lamar Jackson', position: 'QB', team: 'BAL', value: 8500 },
  { player_id: 'tua', full_name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', value: 4000 },
  
  // WRs
  { player_id: 'lamb', full_name: 'CeeDee Lamb', position: 'WR', team: 'DAL', value: 9000 },
  { player_id: 'arsb', full_name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', value: 8000 },
  { player_id: 'djmoore', full_name: 'DJ Moore', position: 'WR', team: 'CHI', value: 6000 },
  { player_id: 'waddle', full_name: 'Jaylen Waddle', position: 'WR', team: 'MIA', value: 5000 },
  { player_id: 'metcalf', full_name: 'DK Metcalf', position: 'WR', team: 'SEA', value: 5000 },
  { player_id: 'evans', full_name: 'Mike Evans', position: 'WR', team: 'TB', value: 5000 },
  { player_id: 'smith', full_name: 'DeVonta Smith', position: 'WR', team: 'PHI', value: 4500 },
  { player_id: 'kirk', full_name: 'Christian Kirk', position: 'WR', team: 'JAX', value: 2800 },
  
  // RBs
  { player_id: 'bijan', full_name: 'Bijan Robinson', position: 'RB', team: 'ATL', value: 7000 },
  { player_id: 'breece', full_name: 'Breece Hall', position: 'RB', team: 'NYJ', value: 7000 },
  { player_id: 'walker', full_name: 'Kenneth Walker III', position: 'RB', team: 'SEA', value: 4000 },
  { player_id: 'jacobs', full_name: 'Josh Jacobs', position: 'RB', team: 'GB', value: 3200 },
  { player_id: 'pollard', full_name: 'Tony Pollard', position: 'RB', team: 'TEN', value: 2200 },
  
  // TEs
  { player_id: 'kelce', full_name: 'Travis Kelce', position: 'TE', team: 'KC', value: 5000 },
  { player_id: 'pitts', full_name: 'Kyle Pitts', position: 'TE', team: 'ATL', value: 3000 },
  { player_id: 'pitts2', full_name: 'Kyle Pitts (Alt)', position: 'TE', team: 'ATL', value: 3200 },
];

// Helper function to find player
function findPlayer(id) {
  return testPlayers.find(p => p.player_id === id);
}

// Test scenarios
const scenarios = [
  {
    name: "Scenario 1: QB-Heavy Team",
    description: "4 QBs (should get penalized for imbalance)",
    players: [
      findPlayer('allen'),
      findPlayer('mahomes'),
      findPlayer('herbert'),
      findPlayer('burrow'),
      findPlayer('lamb'),
      findPlayer('arsb'),
      findPlayer('bijan'),
      findPlayer('breece'),
      findPlayer('kelce'),
    ].filter(Boolean)
  },
  {
    name: "Scenario 2: Balanced Elite Team",
    description: "Optimal positional distribution (should score highest)",
    players: [
      findPlayer('allen'),
      findPlayer('mahomes'),
      findPlayer('herbert2'),
      findPlayer('lamb'),
      findPlayer('arsb'),
      findPlayer('djmoore'),
      findPlayer('waddle'),
      findPlayer('bijan'),
      findPlayer('breece'),
      findPlayer('walker'),
      findPlayer('kelce'),
      findPlayer('pitts'),
    ].filter(Boolean)
  },
  {
    name: "Scenario 3: Missing Key Position",
    description: "Only 1 QB in superflex (should get heavily penalized)",
    players: [
      findPlayer('allen'),
      findPlayer('lamb'),
      findPlayer('arsb'),
      findPlayer('djmoore'),
      findPlayer('waddle'),
      findPlayer('metcalf'),
      findPlayer('bijan'),
      findPlayer('breece'),
      findPlayer('walker'),
      findPlayer('kelce'),
      findPlayer('pitts'),
    ].filter(Boolean)
  },
  {
    name: "Scenario 4: Perfectly Balanced Average Team",
    description: "Meets all minimums with average players",
    players: [
      findPlayer('jackson'),
      findPlayer('tua'),
      findPlayer('evans'),
      findPlayer('smith'),
      findPlayer('kirk'),
      findPlayer('jacobs'),
      findPlayer('pollard'),
      findPlayer('pitts2'),
    ].filter(Boolean)
  }
];

// Simple total value calculation (old system)
function calculateSimpleTotalValue(players) {
  return players.reduce((sum, player) => sum + (player.value || 0), 0);
}

// Test function
function runPositionalScoringTests() {
  console.log('='.repeat(80));
  console.log('POSITIONAL SCORING SYSTEM TEST');
  console.log('='.repeat(80));
  console.log();

  const simulator = new TestDraftSimulator(testPlayers);
  
  const results = scenarios.map(scenario => {
    const analysis = simulator.analyzeUserTeam(scenario.players);
    const simpleTotalValue = calculateSimpleTotalValue(scenario.players);
    
    // Group players by position for detailed breakdown
    const playersByPosition = {
      QB: scenario.players.filter(p => p.position === 'QB'),
      RB: scenario.players.filter(p => p.position === 'RB'),
      WR: scenario.players.filter(p => p.position === 'WR'),
      TE: scenario.players.filter(p => p.position === 'TE')
    };
    
    return {
      scenario,
      analysis,
      simpleTotalValue,
      playersByPosition
    };
  });

  // Display detailed results for each scenario
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.scenario.name}`);
    console.log(`   ${result.scenario.description}`);
    console.log('   ' + '-'.repeat(60));
    
    // Show roster composition
    console.log('   ROSTER COMPOSITION:');
    Object.entries(result.playersByPosition).forEach(([pos, players]) => {
      console.log(`   ${pos}: ${players.length} players`);
      players.forEach(p => {
        console.log(`     - ${p.full_name} (${(p.value || 0).toLocaleString()})`);
      });
    });
    
    console.log();
    console.log('   SCORING RESULTS:');
    console.log(`   Raw Total Value:           ${result.simpleTotalValue.toLocaleString()}`);
    console.log(`   New Positional Score:      ${result.analysis.totalScore}/100`);
    console.log(`   ${result.analysis.explanation}`);
    
    // Show what penalties/bonuses were applied
    console.log('   POSITIONAL ANALYSIS:');
    const qbCount = result.playersByPosition.QB.length;
    const rbCount = result.playersByPosition.RB.length;
    const wrCount = result.playersByPosition.WR.length;
    const teCount = result.playersByPosition.TE.length;
    
    console.log(`   QB: ${qbCount}/2 required ${qbCount < 2 ? '❌ MISSING' : qbCount >= 3 ? '✓ OPTIMAL+' : '✓ MET'}`);
    console.log(`   RB: ${rbCount}/2 required ${rbCount < 2 ? '❌ MISSING' : rbCount >= 3 ? '✓ OPTIMAL+' : '✓ MET'}`);
    console.log(`   WR: ${wrCount}/3 required ${wrCount < 3 ? '❌ MISSING' : wrCount >= 4 ? '✓ OPTIMAL+' : '✓ MET'}`);
    console.log(`   TE: ${teCount}/1 required ${teCount < 1 ? '❌ MISSING' : teCount >= 2 ? '✓ OPTIMAL+' : '✓ MET'}`);
    
    console.log();
  });

  // Comparison table
  console.log('COMPARISON SUMMARY:');
  console.log('='.repeat(100));
  console.log('Scenario                    | Raw Value | New Score | Old Rank | New Rank | Change');
  console.log('-'.repeat(100));
  
  // Sort by both systems
  const rawValueSorted = [...results].sort((a, b) => b.simpleTotalValue - a.simpleTotalValue);
  const newSystemSorted = [...results].sort((a, b) => b.analysis.totalScore - a.analysis.totalScore);
  
  results.forEach(result => {
    const rawRank = rawValueSorted.findIndex(r => r.scenario.name === result.scenario.name) + 1;
    const newRank = newSystemSorted.findIndex(r => r.scenario.name === result.scenario.name) + 1;
    const change = rawRank - newRank;
    const changeStr = change > 0 ? `+${change}` : change < 0 ? `${change}` : '0';
    
    const scenarioName = result.scenario.name.padEnd(26);
    const rawValueStr = result.simpleTotalValue.toString().padStart(9);
    const newScoreStr = result.analysis.totalScore.toString().padStart(9);
    const oldRankStr = `#${rawRank}`.padStart(8);
    const newRankStr = `#${newRank}`.padStart(8);
    const changeStrPad = changeStr.padStart(6);
    
    console.log(`${scenarioName} | ${rawValueStr} | ${newScoreStr} | ${oldRankStr} | ${newRankStr} | ${changeStrPad}`);
  });

  console.log();
  console.log('KEY INSIGHTS:');
  console.log('='.repeat(80));
  
  // Analysis of system differences
  const rawWinner = rawValueSorted[0];
  const newWinner = newSystemSorted[0];
  
  console.log(`Highest by Raw Value:      ${rawWinner.scenario.name} (${rawWinner.simpleTotalValue.toLocaleString()})`);
  console.log(`Highest by New System:     ${newWinner.scenario.name} (${newWinner.analysis.totalScore}/100)`);
  
  if (rawWinner.scenario.name !== newWinner.scenario.name) {
    console.log('✅ SYSTEM SENSITIVITY: Different winners - new system rewards balance over raw talent!');
  } else {
    console.log('⚠️  SYSTEM SENSITIVITY: Same winner - system may need more aggressive penalties');
  }
  
  // Check specific penalties
  const scenario3Result = results.find(r => r.scenario.name.includes('Missing Key'));
  const missingQBPenalty = scenario3Result ? scenario3Result.analysis.totalScore : 0;
  console.log(`Missing QB Penalty:        Score = ${missingQBPenalty}/100 ${missingQBPenalty < 40 ? '✅ SEVERE' : '⚠️  MILD'}`);
  
  const scenario1Result = results.find(r => r.scenario.name.includes('QB-Heavy'));
  const scenario2Result = results.find(r => r.scenario.name.includes('Balanced Elite'));
  if (scenario2Result && scenario1Result) {
    const balanceAdvantage = scenario2Result.analysis.totalScore - scenario1Result.analysis.totalScore;
    console.log(`Balance vs QB-Heavy:       +${balanceAdvantage} points for balance ${balanceAdvantage > 5 ? '✅ GOOD' : '⚠️  WEAK'}`);
  }
  
  const scenario4Result = results.find(r => r.scenario.name.includes('Average Team'));
  if (scenario4Result) {
    console.log(`Average Team Baseline:     ${scenario4Result.analysis.totalScore}/100 score for minimum roster`);
  }
  
  console.log();
  console.log('SYSTEM FEATURES DEMONSTRATED:');
  console.log('• Positional requirements with heavy penalties for missing starters');
  console.log('• QB premium (1.2x multiplier) for superflex format');  
  console.log('• Diminishing returns for depth (70% optimal, 40% extra)');
  console.log('• Balance bonuses for meeting/exceeding positional minimums');
  console.log('• Conversion to 100-point scale for easy comparison');
}

// Run the tests
runPositionalScoringTests();