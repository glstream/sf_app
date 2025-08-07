const { DraftSimulator } = require('./src/utils/draftSimulator.js');

// Player data for test scenarios
const testPlayers = [
  // QBs
  { player_id: 'allen', full_name: 'Josh Allen', position: 'QB', team: 'BUF', value: 12000 },
  { player_id: 'mahomes', full_name: 'Patrick Mahomes', position: 'QB', team: 'KC', value: 11000 },
  { player_id: 'herbert', full_name: 'Justin Herbert', position: 'QB', team: 'LAC', value: 8000 },
  { player_id: 'burrow', full_name: 'Joe Burrow', position: 'QB', team: 'CIN', value: 7000 },
  { player_id: 'herbert2', full_name: 'Justin Herbert', position: 'QB', team: 'LAC', value: 6000 }, // Lower value for scenario 2
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
  { player_id: 'pitts2', full_name: 'Kyle Pitts', position: 'TE', team: 'ATL', value: 3200 }, // For scenario 4
];

// Test scenarios
const scenarios = [
  {
    name: "Scenario 1: QB-Heavy Team",
    description: "4 QBs (should get penalized for imbalance)",
    players: [
      testPlayers.find(p => p.player_id === 'allen')!,
      testPlayers.find(p => p.player_id === 'mahomes')!,
      testPlayers.find(p => p.player_id === 'herbert')!,
      testPlayers.find(p => p.player_id === 'burrow')!,
      testPlayers.find(p => p.player_id === 'lamb')!,
      testPlayers.find(p => p.player_id === 'arsb')!,
      testPlayers.find(p => p.player_id === 'bijan')!,
      testPlayers.find(p => p.player_id === 'breece')!,
      testPlayers.find(p => p.player_id === 'kelce')!,
    ]
  },
  {
    name: "Scenario 2: Balanced Elite Team",
    description: "Optimal positional distribution (should score highest)",
    players: [
      testPlayers.find(p => p.player_id === 'allen')!,
      testPlayers.find(p => p.player_id === 'mahomes')!,
      testPlayers.find(p => p.player_id === 'herbert2')!, // 6k value version
      testPlayers.find(p => p.player_id === 'lamb')!,
      testPlayers.find(p => p.player_id === 'arsb')!,
      testPlayers.find(p => p.player_id === 'djmoore')!,
      testPlayers.find(p => p.player_id === 'waddle')!,
      testPlayers.find(p => p.player_id === 'bijan')!,
      testPlayers.find(p => p.player_id === 'breece')!,
      testPlayers.find(p => p.player_id === 'walker')!,
      testPlayers.find(p => p.player_id === 'kelce')!,
      testPlayers.find(p => p.player_id === 'pitts')!,
    ]
  },
  {
    name: "Scenario 3: Missing Key Position",
    description: "Only 1 QB in superflex (should get heavily penalized)",
    players: [
      testPlayers.find(p => p.player_id === 'allen')!,
      testPlayers.find(p => p.player_id === 'lamb')!,
      testPlayers.find(p => p.player_id === 'arsb')!,
      testPlayers.find(p => p.player_id === 'djmoore')!,
      testPlayers.find(p => p.player_id === 'waddle')!,
      testPlayers.find(p => p.player_id === 'metcalf')!,
      testPlayers.find(p => p.player_id === 'bijan')!,
      testPlayers.find(p => p.player_id === 'breece')!,
      testPlayers.find(p => p.player_id === 'walker')!,
      testPlayers.find(p => p.player_id === 'kelce')!,
      testPlayers.find(p => p.player_id === 'pitts')!,
    ]
  },
  {
    name: "Scenario 4: Perfectly Balanced Average Team",
    description: "Meets all minimums with average players",
    players: [
      testPlayers.find(p => p.player_id === 'jackson')!,
      testPlayers.find(p => p.player_id === 'tua')!,
      testPlayers.find(p => p.player_id === 'evans')!,
      testPlayers.find(p => p.player_id === 'smith')!,
      testPlayers.find(p => p.player_id === 'kirk')!,
      testPlayers.find(p => p.player_id === 'jacobs')!,
      testPlayers.find(p => p.player_id === 'pollard')!,
      testPlayers.find(p => p.player_id === 'pitts2')!, // 3.2k value version
    ]
  }
];

// Simple total value calculation (old system)
function calculateSimpleTotalValue(players: any[]): number {
  return players.reduce((sum, player) => sum + (player.value || 0), 0);
}

// Test function
function runPositionalScoringTests() {
  console.log('='.repeat(80));
  console.log('POSITIONAL SCORING SYSTEM TEST');
  console.log('='.repeat(80));
  console.log();

  const simulator = new DraftSimulator(testPlayers);
  
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

  // Display results
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
    console.log();
  });

  // Comparison table
  console.log('COMPARISON SUMMARY:');
  console.log('='.repeat(80));
  console.log('Scenario                    | Raw Value | New Score | Difference');
  console.log('-'.repeat(80));
  
  // Sort by new positional score for ranking
  const sortedResults = [...results].sort((a, b) => b.analysis.totalScore - a.analysis.totalScore);
  
  sortedResults.forEach((result, index) => {
    const rawValue = result.simpleTotalValue;
    const newScore = result.analysis.totalScore;
    const scenarioName = result.scenario.name.padEnd(26);
    const rawValueStr = rawValue.toString().padStart(9);
    const newScoreStr = newScore.toString().padStart(9);
    const rank = `#${index + 1}`;
    
    console.log(`${scenarioName} | ${rawValueStr} | ${newScoreStr} | ${rank}`);
  });

  console.log();
  console.log('ANALYSIS:');
  console.log('='.repeat(80));
  
  // Find the scenario that would rank highest by raw value vs new system
  const rawValueSorted = [...results].sort((a, b) => b.simpleTotalValue - a.simpleTotalValue);
  const newSystemSorted = [...results].sort((a, b) => b.analysis.totalScore - a.analysis.totalScore);
  
  console.log(`Highest by Raw Value:      ${rawValueSorted[0].scenario.name}`);
  console.log(`Highest by New System:     ${newSystemSorted[0].scenario.name}`);
  
  if (rawValueSorted[0].scenario.name !== newSystemSorted[0].scenario.name) {
    console.log('✓ New system shows different winner - demonstrates increased sensitivity!');
  } else {
    console.log('⚠ New system has same winner as raw value - may need adjustment');
  }
  
  // Check penalties
  const scenario3Result = results.find(r => r.scenario.name.includes('Missing Key'));
  if (scenario3Result && scenario3Result.analysis.totalScore < 50) {
    console.log('✓ Missing position penalty working - team with 1 QB scored very low');
  }
  
  const scenario1Result = results.find(r => r.scenario.name.includes('QB-Heavy'));
  const scenario2Result = results.find(r => r.scenario.name.includes('Balanced Elite'));
  if (scenario2Result && scenario1Result && scenario2Result.analysis.totalScore > scenario1Result.analysis.totalScore) {
    console.log('✓ Balance rewards working - balanced team beats QB-heavy team');
  }
}

// Run the tests
runPositionalScoringTests();