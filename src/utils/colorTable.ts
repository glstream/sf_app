export function getCellStyle(rank: number) {
  if (rank === 1) {
    return { backgroundColor: 'rgba(68, 184, 73, 0.69)' } // Green for rank 1
  } else if (rank === 2) {
    return { backgroundColor: 'rgba(104, 178, 68, 0.69)' } // Slightly different green for rank 2
  } else if (rank === 3) {
    return { backgroundColor: 'rgba(140, 172, 63, 0.69)' } // Another green/yellow for rank 3
  } else if (rank === 4) {
    return { backgroundColor: 'rgba(176, 166, 57, 0.69)' } // Yellowish for rank 4
  } else if (rank === 5) {
    return { backgroundColor: 'rgba(212, 160, 52, 0.69)' } // More orange for rank 5
  } else if (rank === 6) {
    return { backgroundColor: 'rgba(248, 154, 47, 0.69)' } // Orange for rank 6
  } else if (rank === 7) {
    return { backgroundColor: 'rgba(255, 128, 43, 0.69)' } // Darker orange for rank 7
  } else if (rank === 8) {
    return { backgroundColor: 'rgba(255, 102, 39, 0.69)' } // Orange-red for rank 8
  } else if (rank === 9) {
    return { backgroundColor: 'rgba(255, 76, 34, 0.69)' } // Reddish for rank 9
  } else if (rank === 10) {
    return { backgroundColor: 'rgba(255, 51, 30, 0.69)' } // Red for rank 10
  } else if (rank === 11) {
    return { backgroundColor: 'rgba(255, 25, 25, 0.69)' } // Darker red for rank 11
  } else if (rank === 12) {
    return { backgroundColor: 'rgba(255, 0, 0, 0.69)' } // Bright red for rank 12
  } else {
    return { backgroundColor: 'rgba(49, 65, 68, 0.69)' } // A neutral/dark color for ranks higher than 12
  }
}
