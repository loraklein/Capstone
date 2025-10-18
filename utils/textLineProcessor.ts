// Utility to process Google Vision annotations and group words into lines

export interface WordAnnotation {
  description: string;
  boundingPoly: {
    vertices: Array<{ x: number; y: number }>;
  };
}

export interface TextLine {
  lineNumber: number;
  words: WordAnnotation[];
  text: string;
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export interface LineSegment {
  segmentNumber: number;
  lines: TextLine[];
  text: string;
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * Groups words into lines based on their Y-coordinates
 * Uses clustering by Y position to detect actual text lines
 */
export function groupWordsIntoLines(annotations: WordAnnotation[]): TextLine[] {
  if (!annotations || annotations.length === 0) {
    return [];
  }

  // Calculate center Y for each word
  const wordsWithY = annotations.map(word => {
    const centerY = word.boundingPoly.vertices.reduce((sum, v) => sum + v.y, 0) / 4;
    const centerX = word.boundingPoly.vertices.reduce((sum, v) => sum + v.x, 0) / 4;
    return {
      word,
      centerY,
      centerX,
    };
  });

  // Sort by Y position first (top to bottom), then X (left to right)
  wordsWithY.sort((a, b) => {
    const yDiff = a.centerY - b.centerY;
    if (Math.abs(yDiff) < 30) { // If roughly same Y, sort by X
      return a.centerX - b.centerX;
    }
    return yDiff;
  });

  // Group words into lines - words within 40px of each other vertically are on same line
  const lines: TextLine[] = [];
  let currentLine: WordAnnotation[] = [];
  let currentLineY = 0;

  wordsWithY.forEach(({ word, centerY }) => {
    if (currentLine.length === 0) {
      // Start new line
      currentLine = [word];
      currentLineY = centerY;
    } else {
      // Check if this word is close enough in Y to be on same line
      const yDifference = Math.abs(centerY - currentLineY);
      
      if (yDifference < 40) {
        // Same line - add word
        currentLine.push(word);
        // Update average Y for the line
        currentLineY = (currentLineY * (currentLine.length - 1) + centerY) / currentLine.length;
      } else {
        // New line - save current and start new
        if (currentLine.length > 0) {
          lines.push(createTextLine(currentLine, lines.length));
        }
        currentLine = [word];
        currentLineY = centerY;
      }
    }
  });

  // Save the last line
  if (currentLine.length > 0) {
    lines.push(createTextLine(currentLine, lines.length));
  }

  console.log('DEBUG line detection:', {
    totalWords: annotations.length,
    detectedLines: lines.length,
    avgWordsPerLine: (annotations.length / lines.length).toFixed(1)
  });

  return lines;
}

/**
 * Creates a TextLine object from an array of words
 */
function createTextLine(words: WordAnnotation[], lineNumber: number): TextLine {
  // Sort words in line by X position (left to right)
  const sortedWords = [...words].sort((a, b) => {
    const avgXA = a.boundingPoly.vertices.reduce((sum, v) => sum + v.x, 0) / 4;
    const avgXB = b.boundingPoly.vertices.reduce((sum, v) => sum + v.x, 0) / 4;
    return avgXA - avgXB;
  });

  // Combine words into text
  const text = sortedWords.map(w => w.description).join(' ');

  // Calculate bounding box for entire line
  const allVertices = sortedWords.flatMap(w => w.boundingPoly.vertices);
  const boundingBox = {
    minX: Math.min(...allVertices.map(v => v.x)),
    maxX: Math.max(...allVertices.map(v => v.x)),
    minY: Math.min(...allVertices.map(v => v.y)),
    maxY: Math.max(...allVertices.map(v => v.y)),
  };

  return {
    lineNumber,
    words: sortedWords,
    text,
    boundingBox,
  };
}

/**
 * Groups lines into segments (for editing 2-3 lines at a time)
 */
export function groupLinesIntoSegments(
  lines: TextLine[],
  linesPerSegment: number = 3
): LineSegment[] {
  const segments: LineSegment[] = [];

  for (let i = 0; i < lines.length; i += linesPerSegment) {
    const segmentLines = lines.slice(i, i + linesPerSegment);
    const text = segmentLines.map(l => l.text).join('\n');
    
    // Calculate bounding box for entire segment
    const allBoxes = segmentLines.map(l => l.boundingBox);
    const boundingBox = {
      minX: Math.min(...allBoxes.map(b => b.minX)),
      maxX: Math.max(...allBoxes.map(b => b.maxX)),
      minY: Math.min(...allBoxes.map(b => b.minY)),
      maxY: Math.max(...allBoxes.map(b => b.maxY)),
    };

    segments.push({
      segmentNumber: segments.length,
      lines: segmentLines,
      text,
      boundingBox,
    });
  }

  return segments;
}

/**
 * Combines all edited segments back into full text
 */
export function combineSegmentTexts(segments: LineSegment[], editedTexts: Map<number, string>): string {
  return segments.map((segment, index) => {
    return editedTexts.get(index) || segment.text;
  }).join('\n');
}

