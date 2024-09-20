export const colorPalette = {
  red: '#E03C31',
  blue: '#002395',
  green: '#007A4D',
  yellow: '#FDB913',
  white: '#FFFFFF',
  black: '#000000',
};

export const getCategoryColor = (category, isDark = false) => {
  switch (category) {
    case 'Diversity Questions':
      return isDark ? colorPalette.blue : colorPalette.red;
    case 'Storytelling Prompts':
      return isDark ? colorPalette.green : colorPalette.yellow;
    case 'Challenge Cards':
      return isDark ? colorPalette.yellow : colorPalette.green;
    case 'Unity Cards':
      return isDark ? colorPalette.red : colorPalette.blue;
    default:
      return isDark ? colorPalette.black : colorPalette.white;
  }
};
