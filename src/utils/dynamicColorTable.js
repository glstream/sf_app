export function getCellStyle(rank) {
  const safeRank = Math.max(1, Math.min(rank, 12))
  const ratio = (safeRank - 1) / 11

  // Define the start, middle, and end colors
  const startColor = { r: 76, g: 175, b: 80 } // Vibrant Green
  const middleColor = { r: 255, g: 193, b: 7 } // Sunshine Yellow
  const endColor = { r: 244, g: 67, b: 54 } // Alerting Red

  let red, green, blue
  if (ratio < 0.5) {
    const midRatio = ratio * 2
    red = Math.round(startColor.r + (middleColor.r - startColor.r) * midRatio)
    green = Math.round(startColor.g + (middleColor.g - startColor.g) * midRatio)
    blue = Math.round(startColor.b + (middleColor.b - startColor.b) * midRatio)
  } else {
    const midRatio = (ratio - 0.5) * 2
    red = Math.round(middleColor.r + (endColor.r - middleColor.r) * midRatio)
    green = Math.round(middleColor.g + (endColor.g - middleColor.g) * midRatio)
    blue = Math.round(middleColor.b + (endColor.b - middleColor.b) * midRatio)
  }

  // Darken the color more for the text and border
  const textAndBorderColor = {
    r: Math.round(red * 0.6), // Darken more by using a lower multiplier
    g: Math.round(green * 0.6),
    b: Math.round(blue * 0.6)
  }

  return {
    backgroundColor: `rgba(${red}, ${green}, ${blue}, 0.55)`,
    color: `rgba(${textAndBorderColor.r}, ${textAndBorderColor.g}, ${textAndBorderColor.b})`,
    border: `1px solid rgba(${textAndBorderColor.r}, ${textAndBorderColor.g}, ${textAndBorderColor.b})`
  }
}
