interface Player {
  player_id: string
  full_name: string
  position: string
  team: string
  age?: number
  sf_value?: number
  one_qb_value?: number
  value?: number
  overallRank?: number
}

interface DraftPick {
  round: number
  pick: number
  overallPick: number
  team: number
  player?: Player
}

interface DraftSlot {
  round: number
  pick: number
  overallPick: number
  team: number
  expectedPlayer?: Player
  availablePlayers: Player[]
}

interface TeamScoreResult {
  totalScore: number
  pickAnalysis: PickAnalysis[]
  explanation: string
}

interface PickAnalysis {
  player: Player
  overallRank: number
  positionalRank: number
  expectedRound: string
  roundPosition: string
}

export class DraftSimulator {
  private players: Player[]
  private rankedPlayers: Player[]
  
  constructor(players: Player[]) {
    this.players = players
    this.rankedPlayers = this.rankPlayers(players)
  }
  
  private rankPlayers(players: Player[]): Player[] {
    return [...players]
      .filter(p => p.value && p.value > 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .map((player, index) => ({
        ...player,
        overallRank: index + 1
      }))
  }
  
  simulateSnakeDraft(rounds: number = 9, teams: number = 12): DraftSlot[] {
    const draftSlots: DraftSlot[] = []
    const availablePlayers = [...this.rankedPlayers]
    
    for (let round = 1; round <= rounds; round++) {
      const isEvenRound = round % 2 === 0
      const pickOrder = isEvenRound 
        ? Array.from({length: teams}, (_, i) => teams - i)
        : Array.from({length: teams}, (_, i) => i + 1)
      
      for (let i = 0; i < teams; i++) {
        const team = pickOrder[i]
        const pick = i + 1
        const overallPick = (round - 1) * teams + pick
        
        const expectedPlayer = availablePlayers[0]
        const currentAvailable = [...availablePlayers.slice(0, Math.min(20, availablePlayers.length))]
        
        draftSlots.push({
          round,
          pick,
          overallPick,
          team,
          expectedPlayer,
          availablePlayers: currentAvailable
        })
        
        if (availablePlayers.length > 0) {
          availablePlayers.shift()
        }
      }
    }
    
    return draftSlots
  }
  
  analyzeUserTeam(userPlayers: Player[]): TeamScoreResult {
    const pickAnalysis: PickAnalysis[] = []
    
    for (const player of userPlayers) {
      const overallRank = player.overallRank || this.getPlayerRank(player)
      const positionalRank = this.getPositionalRank(player)
      const expectedRound = this.calculateExpectedRound(overallRank)
      const roundPosition = this.calculateRoundPosition(overallRank)
      
      pickAnalysis.push({
        player,
        overallRank,
        positionalRank,
        expectedRound,
        roundPosition
      })
    }
    
    // Simple team value calculation for overall scoring
    const totalScore = this.calculateTeamScore(userPlayers)
    const explanation = this.generateSimpleExplanation(userPlayers, totalScore)
    
    return {
      totalScore,
      pickAnalysis,
      explanation
    }
  }
  
  private getPlayerRank(player: Player): number {
    const playerInRanked = this.rankedPlayers.find(p => p.player_id === player.player_id)
    return playerInRanked?.overallRank || 999
  }
  
  private getPositionalRank(player: Player): number {
    const playersAtPosition = this.rankedPlayers.filter(p => p.position === player.position)
    const playerIndex = playersAtPosition.findIndex(p => p.player_id === player.player_id)
    return playerIndex !== -1 ? playerIndex + 1 : 999
  }
  
  private calculateExpectedRound(overallRank: number): string {
    // 12 teams × 9 rounds = 108 total picks
    // Round 1: picks 1-12, Round 2: picks 13-24, etc.
    const calculatedRound = Math.ceil(overallRank / 12)
    return calculatedRound > 16 ? '16+' : calculatedRound.toString()
  }
  
  private calculateRoundPosition(overallRank: number): string {
    const round = Math.ceil(overallRank / 12)
    const pickInRound = ((overallRank - 1) % 12) + 1
    
    // Early = picks 1-4, Mid = picks 5-8, Late = picks 9-12
    let position: string
    if (pickInRound <= 4) {
      position = 'Early'
    } else if (pickInRound <= 8) {
      position = 'Mid'
    } else {
      position = 'Late'
    }
    
    const roundStr = round > 16 ? '16+' : round.toString()
    return `${position} ${roundStr}`
  }
  
  private calculateTeamScore(userPlayers: Player[]): number {
    const totalValue = userPlayers.reduce((sum, player) => sum + (player.value || 0), 0)
    
    // Much more stringent scoring thresholds
    if (totalValue >= 55000) return 100
    if (totalValue >= 48000) return 95
    if (totalValue >= 42000) return 90
    if (totalValue >= 36000) return 85
    if (totalValue >= 30000) return 80
    if (totalValue >= 25000) return 75
    if (totalValue >= 20000) return 70
    if (totalValue >= 16000) return 65
    if (totalValue >= 12000) return 60
    if (totalValue >= 8000) return 50
    if (totalValue >= 4000) return 25
    return Math.max(0, Math.floor(totalValue / 100))
  }
  
  private generateSimpleExplanation(userPlayers: Player[], totalScore: number): string {
    const totalValue = userPlayers.reduce((sum, player) => sum + (player.value || 0), 0)
    
    if (totalScore >= 90) {
      return `Excellent team with ${totalValue.toLocaleString()} total value. Strong across all positions.`
    } else if (totalScore >= 80) {
      return `Very good team with ${totalValue.toLocaleString()} total value. Competitive roster construction.`
    } else if (totalScore >= 70) {
      return `Solid team with ${totalValue.toLocaleString()} total value. Good foundation with room for improvement.`
    } else if (totalScore >= 60) {
      return `Average team with ${totalValue.toLocaleString()} total value. Consider upgrading key positions.`
    } else {
      return `Rebuilding team with ${totalValue.toLocaleString()} total value. Focus on long-term development.`
    }
  }
  
  getDraftSlotsByRound(slots: DraftSlot[], round: number): DraftSlot[] {
    return slots.filter(slot => slot.round === round)
  }
  
  getAvailablePlayersAtPick(slots: DraftSlot[], overallPick: number): Player[] {
    const slot = slots.find(s => s.overallPick === overallPick)
    return slot?.availablePlayers || []
  }
}