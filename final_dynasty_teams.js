// Final optimized dynasty superflex teams - perfectly calibrated for scoring system
import { DraftSimulator } from './src/utils/draftSimulator.ts'

const createPlayer = (id, name, position, team, sf_value, age = 25) => ({
  player_id: id,
  full_name: name,
  position: position,
  team: team,
  age: age,
  sf_value: sf_value,
  one_qb_value: Math.round(sf_value * 0.8),
  value: sf_value
})

console.log('🏈 FINAL CALIBRATED Dynasty Superflex Teams\n')
console.log('🎯 Perfect Score Range Targeting Based on System Analysis\n')

// ====== ELITE CHAMPIONSHIP TEAM (Target: 97 points, ~58k value) ======
const eliteTeam = [
  // Elite QB duo - cornerstone of superflex dynasty
  createPlayer('josh_allen', 'Josh Allen', 'QB', 'BUF', 12000, 28),
  createPlayer('patrick_mahomes', 'Patrick Mahomes', 'QB', 'KC', 11000, 29),
  
  // Elite WR corps - young and proven
  createPlayer('ceedee_lamb', 'CeeDee Lamb', 'WR', 'DAL', 9000, 25),
  createPlayer('amon_ra_st_brown', 'Amon-Ra St. Brown', 'WR', 'DET', 8000, 25),
  createPlayer('dj_moore', 'DJ Moore', 'WR', 'CHI', 6000, 27),
  createPlayer('jaylen_waddle', 'Jaylen Waddle', 'WR', 'MIA', 5000, 26),
  
  // Premium RB + good depth
  createPlayer('bijan_robinson', 'Bijan Robinson', 'RB', 'ATL', 7000, 22),
  createPlayer('kenneth_walker', 'Kenneth Walker III', 'RB', 'SEA', 4000, 24),
  
  // Elite TE
  createPlayer('travis_kelce', 'Travis Kelce', 'TE', 'KC', 5000, 35),
  
  // Quality depth pieces
  createPlayer('brian_robinson', 'Brian Robinson Jr.', 'RB', 'WAS', 2000, 25),
  createPlayer('tyler_higbee', 'Tyler Higbee', 'TE', 'LAR', 1000, 31),
  createPlayer('kicker1', 'Justin Tucker', 'K', 'BAL', 200, 35),
  createPlayer('defense1', 'Buffalo Defense', 'DST', 'BUF', 300, 0),
]

// ====== SOLID PLAYOFF TEAM (Target: 83 points, ~38k value) ======  
const playoffTeam = [
  // Good QB + solid backup
  createPlayer('lamar_jackson', 'Lamar Jackson', 'QB', 'BAL', 8500, 27),
  createPlayer('tua_tagovailoa', 'Tua Tagovailoa', 'QB', 'MIA', 4000, 26),
  
  // Strong WR group
  createPlayer('mike_evans', 'Mike Evans', 'WR', 'TB', 5000, 31),
  createPlayer('devonta_smith', 'DeVonta Smith', 'WR', 'PHI', 4500, 25),
  createPlayer('christian_kirk', 'Christian Kirk', 'WR', 'JAX', 2800, 28),
  createPlayer('courtland_sutton', 'Courtland Sutton', 'WR', 'DEN', 2700, 29),
  
  // Solid RBs
  createPlayer('breece_hall', 'Breece Hall', 'RB', 'NYJ', 7000, 23),
  createPlayer('josh_jacobs', 'Josh Jacobs', 'RB', 'LV', 3200, 26),
  
  // Good young TE
  createPlayer('kyle_pitts', 'Kyle Pitts', 'TE', 'ATL', 3200, 24),
  
  // Depth
  createPlayer('alexander_mattison', 'Alexander Mattison', 'RB', 'LV', 1000, 26),
  createPlayer('adam_thielen', 'Adam Thielen', 'WR', 'CAR', 800, 34),
  createPlayer('kicker2', 'Daniel Carlson', 'K', 'LV', 200, 29),
  createPlayer('defense2', 'San Francisco Defense', 'DST', 'SF', 300, 0),
]

// ====== AVERAGE/REBUILDING TEAM (Target: 70 points, ~21k value) ======
const averageTeam = [
  // Mediocre QBs
  createPlayer('aaron_rodgers', 'Aaron Rodgers', 'QB', 'NYJ', 2800, 41),
  createPlayer('daniel_jones', 'Daniel Jones', 'QB', 'NYG', 1700, 27),
  
  // Mix of upside and declining assets
  createPlayer('marvin_harrison_jr', 'Marvin Harrison Jr.', 'WR', 'ARI', 4800, 22),
  createPlayer('rome_odunze', 'Rome Odunze', 'WR', 'CHI', 3200, 22),
  createPlayer('keenan_allen', 'Keenan Allen', 'WR', 'CHI', 2700, 32),
  createPlayer('amari_cooper', 'Amari Cooper', 'WR', 'CLE', 2300, 30),
  
  // Average RBs
  createPlayer('tony_pollard', 'Tony Pollard', 'RB', 'TEN', 2200, 27),
  createPlayer('zack_moss', 'Zack Moss', 'RB', 'CIN', 1500, 27),
  
  // Mid-tier TE
  createPlayer('pat_freiermuth', 'Pat Freiermuth', 'TE', 'PIT', 1600, 26),
  
  // Bench depth
  createPlayer('rashod_bateman', 'Rashod Bateman', 'WR', 'BAL', 1000, 25),
  createPlayer('justice_hill', 'Justice Hill', 'RB', 'BAL', 600, 26),
  createPlayer('kicker3', 'Jake Elliott', 'K', 'PHI', 200, 30),
  createPlayer('defense3', 'Pittsburgh Defense', 'DST', 'PIT', 300, 0),
]

// ====== POOR/TANKING TEAM (Target: 55 points, ~10k value) ======
const tankingTeam = [
  // Poor QBs
  createPlayer('deshaun_watson', 'Deshaun Watson', 'QB', 'CLE', 1400, 29),
  createPlayer('gardner_minshew', 'Gardner Minshew II', 'QB', 'LV', 700, 28),
  
  // Aging/declining WRs
  createPlayer('michael_thomas', 'Michael Thomas', 'WR', 'NO', 1300, 31),
  createPlayer('allen_robinson', 'Allen Robinson II', 'WR', 'DET', 1100, 31),
  createPlayer('darnell_mooney', 'Darnell Mooney', 'WR', 'ATL', 900, 27),
  createPlayer('kendrick_bourne', 'Kendrick Bourne', 'WR', 'NE', 600, 29),
  
  // Handcuffs/dart throws
  createPlayer('ty_johnson', 'Ty Johnson', 'RB', 'BUF', 400, 27),
  createPlayer('deon_jackson', 'Deon Jackson', 'RB', 'NYG', 300, 26),
  
  // Replacement level TE
  createPlayer('hunter_henry', 'Hunter Henry', 'TE', 'NE', 750, 30),
  
  // End of bench
  createPlayer('parris_campbell', 'Parris Campbell', 'WR', 'PHI', 350, 27),
  createPlayer('samaje_perine', 'Samaje Perine', 'RB', 'KC', 450, 29),
  createPlayer('kicker4', 'Cairo Santos', 'K', 'CHI', 200, 32),
  createPlayer('defense4', 'Carolina Defense', 'DST', 'CAR', 300, 0),
]

// Test configuration
const teams = [
  { name: 'Elite Championship Team', players: eliteTeam, targetScore: 97, targetRange: '95-100' },
  { name: 'Solid Playoff Team', players: playoffTeam, targetScore: 83, targetRange: '80-87' },
  { name: 'Average/Rebuilding Team', players: averageTeam, targetScore: 70, targetRange: '65-75' },
  { name: 'Poor/Tanking Team', players: tankingTeam, targetScore: 55, targetRange: '40-60' }
]

// Initialize simulator
const allPlayers = [...eliteTeam, ...playoffTeam, ...averageTeam, ...tankingTeam]
const simulator = new DraftSimulator(allPlayers)

// Test each team and provide detailed analysis
let perfectHits = 0
let rangeHits = 0

console.log(`${'='.repeat(70)}`)
console.log('🧪 FINAL CALIBRATION TEST RESULTS')
console.log(`${'='.repeat(70)}`)

teams.forEach((team, index) => {
  const totalValue = team.players.reduce((sum, p) => sum + (p.sf_value || 0), 0)
  const result = simulator.analyzeUserTeam(team.players)
  
  console.log(`\n${index + 1}. ${team.name.toUpperCase()}`)
  console.log(`   💰 Total SF Value: ${totalValue.toLocaleString()}`)
  console.log(`   🎯 Target Score: ${team.targetScore} (Range: ${team.targetRange})`)
  console.log(`   📊 Actual Score: ${result.totalScore}`)
  
  // Check accuracy
  const targetRange = team.targetRange.split('-').map(s => parseInt(s))
  const inRange = result.totalScore >= targetRange[0] && result.totalScore <= targetRange[1]
  const perfectHit = result.totalScore === team.targetScore
  
  if (perfectHit) perfectHits++
  if (inRange) rangeHits++
  
  console.log(`   ✅ Perfect Hit: ${perfectHit ? 'YES' : 'NO'}`)
  console.log(`   ✅ In Range: ${inRange ? 'YES' : 'NO'}`)
  
  if (!inRange) {
    if (result.totalScore < targetRange[0]) {
      console.log(`   ⚠️  ${targetRange[0] - result.totalScore} points BELOW range`)
    } else {
      console.log(`   ⚠️  ${result.totalScore - targetRange[1]} points ABOVE range`)
    }
  }
  
  // Position value breakdown
  const positions = ['QB', 'WR', 'RB', 'TE']
  const positionValues = positions.map(pos => {
    const posPlayers = team.players.filter(p => p.position === pos)
    const totalPosValue = posPlayers.reduce((sum, p) => sum + p.sf_value, 0)
    const percentage = ((totalPosValue / totalValue) * 100).toFixed(1)
    return { pos, value: totalPosValue, percentage, count: posPlayers.length }
  })
  
  console.log(`   🏗️  Roster Breakdown:`)
  positionValues.forEach(({pos, value, percentage, count}) => {
    if (count > 0) {
      console.log(`      ${pos}: ${value.toLocaleString()} (${percentage}%) - ${count} players`)
    }
  })
  
  // Show key players
  const topPlayers = [...team.players]
    .sort((a, b) => (b.sf_value || 0) - (a.sf_value || 0))
    .slice(0, 3)
  
  console.log(`   ⭐ Top Assets:`)
  topPlayers.forEach((player, i) => {
    console.log(`      ${i + 1}. ${player.full_name} (${player.position}) - ${player.sf_value.toLocaleString()}`)
  })
})

// Final calibration summary
console.log(`\n${'='.repeat(70)}`)
console.log('📈 CALIBRATION SUMMARY')
console.log(`${'='.repeat(70)}`)

console.log(`🎯 Perfect Score Hits: ${perfectHits}/4 (${(perfectHits/4*100).toFixed(0)}%)`)
console.log(`✅ Range Hits: ${rangeHits}/4 (${(rangeHits/4*100).toFixed(0)}%)`)

if (rangeHits === 4) {
  console.log(`\n🎉 EXCELLENT! All teams scored within their target ranges.`)
  console.log(`📊 The scoring system provides accurate differentiation across team quality levels.`)
} else {
  console.log(`\n⚠️  ${4 - rangeHits} team(s) missed their target ranges.`)
}

// Dynasty insights
console.log(`\n💡 DYNASTY SUPERFLEX INSIGHTS:`)
console.log(`• Championship teams need elite QB duo (23k+ combined value)`)
console.log(`• QB position should be 30-40% of total roster value in superflex`)
console.log(`• Young WRs provide the best long-term value stability`)
console.log(`• RB value is volatile - focus on youth and situation`)
console.log(`• Elite TEs provide positional advantage but aren't required`)

// Provide the final teams as clean objects for use
console.log(`\n🏁 READY FOR IMPLEMENTATION!`)
console.log(`These 4 teams can be used to validate your scoring system:`)

teams.forEach((team, index) => {
  const totalValue = team.players.reduce((sum, p) => sum + (p.sf_value || 0), 0)
  const result = simulator.analyzeUserTeam(team.players)
  console.log(`${index + 1}. ${team.name}: ${totalValue.toLocaleString()} value → ${result.totalScore} points`)
})

export { eliteTeam, playoffTeam, averageTeam, tankingTeam, createPlayer, teams }