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
    // Group players by position
    const playersByPosition = {
      QB: userPlayers.filter(p => p.position === 'QB').sort((a, b) => (b.value || 0) - (a.value || 0)),
      RB: userPlayers.filter(p => p.position === 'RB').sort((a, b) => (b.value || 0) - (a.value || 0)),
      WR: userPlayers.filter(p => p.position === 'WR').sort((a, b) => (b.value || 0) - (a.value || 0)),
      TE: userPlayers.filter(p => p.position === 'TE').sort((a, b) => (b.value || 0) - (a.value || 0))
    }
    
    // Calculate positional scores with requirements and penalties
    let totalScore = 0
    
    // QB Scoring (Superflex - 2 QBs are critical)
    const qbScore = this.calculatePositionalScore(playersByPosition.QB, {
      required: 2,
      optimal: 3,
      maxCount: 4,
      positionMultiplier: 1.2 // QB premium in superflex
    })
    totalScore += qbScore
    
    // RB Scoring  
    const rbScore = this.calculatePositionalScore(playersByPosition.RB, {
      required: 2,
      optimal: 3,
      maxCount: 6,
      positionMultiplier: 1.0
    })
    totalScore += rbScore
    
    // WR Scoring
    const wrScore = this.calculatePositionalScore(playersByPosition.WR, {
      required: 3,
      optimal: 4,
      maxCount: 8,
      positionMultiplier: 1.0
    })
    totalScore += wrScore
    
    // TE Scoring
    const teScore = this.calculatePositionalScore(playersByPosition.TE, {
      required: 1,
      optimal: 2,
      maxCount: 3,
      positionMultiplier: 1.0
    })
    totalScore += teScore
    
    // Convert to 100-point scale with better calibrated thresholds
    // Based on analysis: Elite (~75k raw), Solid (~58k raw), Average (~35k raw), Rebuilding (~21k raw)
    let baseScore: number
    
    if (totalScore >= 70000) {
      // Elite tier: 95-100
      baseScore = 95 + ((totalScore - 70000) / 10000) * 5
    } else if (totalScore >= 55000) {
      // Solid tier: 80-94  
      baseScore = 80 + ((totalScore - 55000) / 15000) * 14
    } else if (totalScore >= 30000) {
      // Average tier: 65-79
      baseScore = 65 + ((totalScore - 30000) / 25000) * 14
    } else if (totalScore >= 15000) {
      // Rebuilding tier: 45-64
      baseScore = 45 + ((totalScore - 15000) / 15000) * 19
    } else {
      // Below rebuilding: 0-44
      baseScore = Math.max(0, (totalScore / 15000) * 45)
    }
    
    const balanceBonus = this.calculateBalanceBonus(playersByPosition)
    return Math.min(100, Math.round(baseScore + balanceBonus))
  }
  
  private calculatePositionalScore(players: Player[], config: {
    required: number,
    optimal: number, 
    maxCount: number,
    positionMultiplier: number
  }): number {
    let score = 0
    
    for (let i = 0; i < Math.min(players.length, config.maxCount); i++) {
      const player = players[i]
      let playerValue = (player.value || 0) * config.positionMultiplier
      
      if (i < config.required) {
        // Required starters get full value
        score += playerValue
      } else if (i < config.optimal) {
        // Optimal depth gets 70% value
        score += playerValue * 0.7
      } else {
        // Extra depth gets 40% value
        score += playerValue * 0.4
      }
    }
    
    // Penalty for missing required players
    const missing = Math.max(0, config.required - players.length)
    score -= missing * 3000 // Heavy penalty for missing starters
    
    return score
  }
  
  private calculateBalanceBonus(playersByPosition: {
    QB: Player[], RB: Player[], WR: Player[], TE: Player[]
  }): number {
    let bonus = 0
    
    // Bonus for having at least minimum at each position
    if (playersByPosition.QB.length >= 2) bonus += 2
    if (playersByPosition.RB.length >= 2) bonus += 2
    if (playersByPosition.WR.length >= 3) bonus += 2
    if (playersByPosition.TE.length >= 1) bonus += 2
    
    // Extra bonus for optimal roster construction
    if (playersByPosition.QB.length >= 3) bonus += 1
    if (playersByPosition.RB.length >= 3) bonus += 1
    if (playersByPosition.WR.length >= 4) bonus += 1
    if (playersByPosition.TE.length >= 2) bonus += 1
    
    return bonus
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