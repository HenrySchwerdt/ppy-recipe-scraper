export function getMinutes(timeStr: string | null | undefined): number | undefined {
  if (!timeStr) return undefined;
  
  // Handle ISO 8601 duration format (PT30M, PT1H30M, etc.)
  const iso8601Match = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (iso8601Match) {
    const hours = parseInt(iso8601Match[1] || '0');
    const minutes = parseInt(iso8601Match[2] || '0');
    return hours * 60 + minutes;
  }
  
  // Handle common text formats
  const textMatch = timeStr.match(/(\d+)\s*(hour|hr|h|minute|min|m)/gi);
  let totalMinutes = 0;
  
  if (textMatch) {
    textMatch.forEach(match => {
      const [, num, unit] = match.match(/(\d+)\s*(hour|hr|h|minute|min|m)/i) || [];
      const value = parseInt(num);
      if (unit && unit.toLowerCase().startsWith('h')) {
        totalMinutes += value * 60;
      } else {
        totalMinutes += value;
      }
    });
    return totalMinutes;
  }
  
  return undefined;
}

export function getYields(yieldStr: string | null | undefined): string | undefined {
  if (!yieldStr) return undefined;
  
  // Extract number from yield string
  const match = yieldStr.match(/(\d+)/);
  return match ? match[1] : yieldStr;
}

export function normalizeString(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function getEquipment(equipmentItems: string[]): string[] {
  // Remove duplicates and filter out empty strings
  return [...new Set(equipmentItems.filter(item => item.trim().length > 0))];
}