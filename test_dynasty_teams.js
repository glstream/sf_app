// Test script for 4 dynasty superflex teams at different quality levels
import { DraftSimulator } from './src/utils/draftSimulator.ts'

// Create realistic Player objects for testing
const createPlayer = (id, name, position, team, sf_value, age = 25) => ({
  player_id: id,
  full_name: name,
  position: position,
  team: team,
  age: age,
  sf_value: sf_value,
  one_qb_value: Math.round(sf_value * 0.8), // Estimate 1QB value
  value: sf_value // For superflex testing, use sf_value as the value
})

console.log('🏈 Testing 4 Dynasty Superflex Teams at Different Quality Levels\n')

// ====== ELITE CHAMPIONSHIP TEAM (Target: 95-100 score) ======
console.log('🏆 ELITE CHAMPIONSHIP TEAM')
console.log('Expected Score: 95-100')
console.log('Target Total Value: 55,000+')

const eliteTeam = [
  // Premium QBs
  createPlayer('josh_allen', 'Josh Allen', 'QB', 'BUF', 12000, 28),
  createPlayer('patrick_mahomes', 'Patrick Mahomes', 'QB', 'KC', 11000, 29),
  
  // Top WRs
  createPlayer('ceedee_lamb', 'CeeDee Lamb', 'WR', 'DAL', 9000, 25),
  createPlayer('amon_ra_st_brown', 'Amon-Ra St. Brown', 'WR', 'DET', 8000, 25),
  createPlayer('dj_moore', 'DJ Moore', 'WR', 'CHI', 6000, 27),
  createPlayer('jaylen_waddle', 'Jaylen Waddle', 'WR', 'MIA', 5000, 26),
  
  // Elite RB
  createPlayer('bijan_robinson', 'Bijan Robinson', 'RB', 'ATL', 7000, 22),
  createPlayer('kenneth_walker', 'Kenneth Walker III', 'RB', 'SEA', 4000, 24),
  
  // Top TE
  createPlayer('travis_kelce', 'Travis Kelce', 'TE', 'KC', 5000, 35),
  
  // Depth pieces
  createPlayer('brian_robinson', 'Brian Robinson Jr.', 'RB', 'WAS', 2000, 25),
  createPlayer('tyler_higbee', 'Tyler Higbee', 'TE', 'LAR', 1000, 31),
  createPlayer('kicker', 'Justin Tucker', 'K', 'BAL', 200, 35),
  createPlayer('defense', 'Buffalo Defense', 'DST', 'BUF', 300, 0),
]

// ====== SOLID PLAYOFF TEAM (Target: 80-87 score) ======
console.log('\n🥈 SOLID PLAYOFF TEAM')
console.log('Expected Score: 80-87')
console.log('Target Total Value: 30,000-36,000')

const playoffTeam = [
  // Good QBs
  createPlayer('lamar_jackson', 'Lamar Jackson', 'QB', 'BAL', 9000, 27),
  createPlayer('tua_tagovailoa', 'Tua Tagovailoa', 'QB', 'MIA', 6000, 26),
  
  // Solid WRs
  createPlayer('mike_evans', 'Mike Evans', 'WR', 'TB', 6000, 31),
  createPlayer('devonta_smith', 'DeVonta Smith', 'WR', 'PHI', 5000, 25),
  createPlayer('christian_kirk', 'Christian Kirk', 'WR', 'JAX', 3000, 28),
  createPlayer('courtland_sutton', 'Courtland Sutton', 'WR', 'DEN', 3000, 29),
  
  // Good RBs
  createPlayer('breece_hall', 'Breece Hall', 'RB', 'NYJ', 8000, 23),
  createPlayer('josh_jacobs', 'Josh Jacobs', 'RB', 'LV', 4000, 26),
  
  // TE
  createPlayer('kyle_pitts', 'Kyle Pitts', 'TE', 'ATL', 4000, 24),
  
  // Depth
  createPlayer('alexander_mattison', 'Alexander Mattison', 'RB', 'LV', 1500, 26),
  createPlayer('adam_thielen', 'Adam Thielen', 'WR', 'CAR', 1500, 34),
  createPlayer('kicker2', 'Daniel Carlson', 'K', 'LV', 200, 29),
  createPlayer('defense2', 'San Francisco Defense', 'DST', 'SF', 300, 0),
]

// ====== AVERAGE/REBUILDING TEAM (Target: 65-75 score) ======
console.log('\n🔄 AVERAGE/REBUILDING TEAM')
console.log('Expected Score: 65-75')
console.log('Target Total Value: 16,000-25,000')

const averageTeam = [
  // Aging/inconsistent QBs
  createPlayer('aaron_rodgers', 'Aaron Rodgers', 'QB', 'NYJ', 4000, 41),
  createPlayer('daniel_jones', 'Daniel Jones', 'QB', 'NYG', 2000, 27),
  
  // Mix of older WRs and young prospects
  createPlayer('keenan_allen', 'Keenan Allen', 'WR', 'CHI', 4000, 32),
  createPlayer('amari_cooper', 'Amari Cooper', 'WR', 'CLE', 3000, 30),
  createPlayer('rome_odunze', 'Rome Odunze', 'WR', 'CHI', 4000, 22),
  createPlayer('marvin_harrison_jr', 'Marvin Harrison Jr.', 'WR', 'ARI', 6000, 22),
  
  // Inconsistent RBs
  createPlayer('tony_pollard', 'Tony Pollard', 'RB', 'TEN', 3000, 27),
  createPlayer('zack_moss', 'Zack Moss', 'RB', 'CIN', 2000, 27),
  
  // Mid-tier TE
  createPlayer('pat_freiermuth', 'Pat Freiermuth', 'TE', 'PIT', 2000, 26),
  
  // Depth/Lottery tickets
  createPlayer('rashod_bateman', 'Rashod Bateman', 'WR', 'BAL', 1500, 25),
  createPlayer('justice_hill', 'Justice Hill', 'RB', 'BAL', 800, 26),
  createPlayer('kicker3', 'Jake Elliott', 'K', 'PHI', 200, 30),
  createPlayer('defense3', 'Pittsburgh Defense', 'DST', 'PIT', 300, 0),
]

// ====== POOR/TANKING TEAM (Target: 40-60 score) ======
console.log('\n💥 POOR/TANKING TEAM')
console.log('Expected Score: 40-60')
console.log('Target Total Value: 4,000-12,000')

const tankingTeam = [
  // Bad QBs
  createPlayer('deshaun_watson', 'Deshaun Watson', 'QB', 'CLE', 2000, 29),
  createPlayer('gardner_minshew', 'Gardner Minshew II', 'QB', 'LV', 1000, 28),
  
  // Aging/declining WRs
  createPlayer('michael_thomas', 'Michael Thomas', 'WR', 'NO', 2000, 31),
  createPlayer('allen_robinson', 'Allen Robinson II', 'WR', 'DET', 1500, 31),
  createPlayer('darnell_mooney', 'Darnell Mooney', 'WR', 'ATL', 1200, 27),
  createPlayer('kendrick_bourne', 'Kendrick Bourne', 'WR', 'NE', 800, 29),
  
  // Handcuffs/backups
  createPlayer('ty_johnson', 'Ty Johnson', 'RB', 'BUF', 500, 27),
  createPlayer('deon_jackson', 'Deon Jackson', 'RB', 'NYG', 300, 26),
  
  // Waiver wire TE
  createPlayer('hunter_henry', 'Hunter Henry', 'TE', 'NE', 1000, 30),
  
  // Deep bench scrubs
  createPlayer('parris_campbell', 'Parris Campbell', 'WR', 'PHI', 400, 27),
  createPlayer('samaje_perine', 'Samaje Perine', 'RB', 'KC', 600, 29),
  createPlayer('kicker4', 'Cairo Santos', 'K', 'CHI', 200, 32),
  createPlayer('defense4', 'Carolina Defense', 'DST', 'CAR', 300, 0),
]

// Test all teams
const teams = [
  { name: 'Elite Championship Team', players: eliteTeam, expectedScore: '95-100' },
  { name: 'Solid Playoff Team', players: playoffTeam, expectedScore: '80-87' },
  { name: 'Average/Rebuilding Team', players: averageTeam, expectedScore: '65-75' },
  { name: 'Poor/Tanking Team', players: tankingTeam, expectedScore: '40-60' }
]

// Create a player database for the simulator
const allPlayers = [
  ...eliteTeam,
  ...playoffTeam,
  ...averageTeam,
  ...tankingTeam
]

// Initialize the simulator
const simulator = new DraftSimulator(allPlayers)

// Test each team
teams.forEach((team, index) => {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔍 TESTING: ${team.name.toUpperCase()}`)
  console.log(`${'='.repeat(60)}`)
  
  // Calculate total sf_value
  const totalValue = team.players.reduce((sum, player) => sum + (player.sf_value || 0), 0)
  console.log(`📊 Total SF Value: ${totalValue.toLocaleString()}`)
  console.log(`🎯 Expected Score Range: ${team.expectedScore}`)
  
  // Test through DraftSimulator
  const result = simulator.analyzeUserTeam(team.players)
  
  console.log(`\n📈 ACTUAL RESULTS:`)
  console.log(`Final Score: ${result.totalScore}`)
  console.log(`Explanation: ${result.explanation}`)
  
  // Grade the score
  let grade
  if (result.totalScore >= 95) grade = 'A+ (Championship Level)'
  else if (result.totalScore >= 90) grade = 'A (Elite)'
  else if (result.totalScore >= 85) grade = 'A- (Very Strong)'
  else if (result.totalScore >= 80) grade = 'B+ (Playoff Contender)'
  else if (result.totalScore >= 75) grade = 'B (Solid)'
  else if (result.totalScore >= 70) grade = 'B- (Above Average)'
  else if (result.totalScore >= 65) grade = 'C+ (Average)'
  else if (result.totalScore >= 60) grade = 'C (Below Average)'
  else if (result.totalScore >= 50) grade = 'C- (Poor)'
  else if (result.totalScore >= 25) grade = 'D (Very Poor)'
  else grade = 'F (Disaster)'
  
  console.log(`Letter Grade: ${grade}`)
  
  // Show top 3 most valuable players
  const sortedPlayers = [...team.players].sort((a, b) => (b.sf_value || 0) - (a.sf_value || 0))
  console.log(`\n🌟 Top 3 Most Valuable Players:`)
  sortedPlayers.slice(0, 3).forEach((player, i) => {
    console.log(`${i + 1}. ${player.full_name} (${player.position}) - ${player.sf_value?.toLocaleString() || 0}`)
  })
  
  // Check if score meets expectations
  const expectedRange = team.expectedScore.split('-').map(s => parseInt(s))
  const meetsExpectation = result.totalScore >= expectedRange[0] && result.totalScore <= expectedRange[1]
  console.log(`\n✅ Meets Expectation: ${meetsExpectation ? 'YES' : 'NO'}`)
  
  if (!meetsExpectation) {
    if (result.totalScore < expectedRange[0]) {
      console.log(`⚠️  Score is ${expectedRange[0] - result.totalScore} points BELOW expected range`)
    } else {
      console.log(`⚠️  Score is ${result.totalScore - expectedRange[1]} points ABOVE expected range`)
    }
  }
})

console.log(`\n${'='.repeat(60)}`)
console.log('🏁 SUMMARY')
console.log(`${'='.repeat(60)}`)

teams.forEach((team, index) => {
  const totalValue = team.players.reduce((sum, player) => sum + (player.sf_value || 0), 0)
  const result = simulator.analyzeUserTeam(team.players)
  
  console.log(`${index + 1}. ${team.name}:`)
  console.log(`   Total Value: ${totalValue.toLocaleString()}`)
  console.log(`   Score: ${result.totalScore} (Expected: ${team.expectedScore})`)
  console.log(`   Status: ${result.explanation}`)
  console.log('')
})

console.log('✅ Testing Complete! Review the scores to validate your scoring system.')