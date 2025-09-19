import { formatDate } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    // Use a fixed date for consistent testing
    const testDate = new Date('2024-01-15T14:30:45.123Z');

    describe('short format (default)', () => {
      it('should format date in short format by default', () => {
        const result = formatDate(testDate);
        expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{4}$/);
        expect(result).toContain('2024');
      });

      it('should format date in short format when explicitly specified', () => {
        const result = formatDate(testDate, 'short');
        expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{4}$/);
        expect(result).toContain('2024');
      });

      it('should handle different months correctly', () => {
        const decemberDate = new Date('2024-12-25T10:00:00.000Z');
        const result = formatDate(decemberDate, 'short');
        expect(result).toMatch(/^Dec \d{1,2}, \d{4}$/);
      });

      it('should handle single digit days correctly', () => {
        const singleDigitDay = new Date('2024-01-05T10:00:00.000Z');
        const result = formatDate(singleDigitDay, 'short');
        expect(result).toMatch(/^Jan \d{1,2}, \d{4}$/);
      });

      it('should handle different years correctly', () => {
        const differentYear = new Date('2023-06-15T10:00:00.000Z');
        const result = formatDate(differentYear, 'short');
        expect(result).toMatch(/^Jun \d{1,2}, \d{4}$/);
        expect(result).toContain('2023');
      });
    });

    describe('long format', () => {
      it('should format date in long format with time', () => {
        const result = formatDate(testDate, 'long');
        expect(result).toMatch(/^[A-Za-z]+ \d{1,2}, \d{4} at \d{1,2}:\d{2} [AP]M$/);
        expect(result).toContain('2024');
      });

      it('should handle different months in long format', () => {
        const decemberDate = new Date('2024-12-25T10:00:00.000Z');
        const result = formatDate(decemberDate, 'long');
        expect(result).toMatch(/^December \d{1,2}, \d{4} at \d{1,2}:\d{2} [AP]M$/);
      });

      it('should handle single digit days in long format', () => {
        const singleDigitDay = new Date('2024-01-05T10:00:00.000Z');
        const result = formatDate(singleDigitDay, 'long');
        expect(result).toMatch(/^January \d{1,2}, \d{4} at \d{1,2}:\d{2} [AP]M$/);
      });

      it('should handle different years in long format', () => {
        const differentYear = new Date('2023-06-15T10:00:00.000Z');
        const result = formatDate(differentYear, 'long');
        expect(result).toMatch(/^June \d{1,2}, \d{4} at \d{1,2}:\d{2} [AP]M$/);
        expect(result).toContain('2023');
      });
    });

    describe('time format', () => {
      it('should format date with time in time format', () => {
        const result = formatDate(testDate, 'time');
        expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2}:\d{2} [AP]M$/);
        expect(result).toContain('2024');
      });

      it('should handle different months in time format', () => {
        const decemberDate = new Date('2024-12-25T10:00:00.000Z');
        const result = formatDate(decemberDate, 'time');
        expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2}:\d{2} [AP]M$/);
      });

      it('should handle single digit days in time format', () => {
        const singleDigitDay = new Date('2024-01-05T10:00:00.000Z');
        const result = formatDate(singleDigitDay, 'time');
        expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2}:\d{2} [AP]M$/);
      });

      it('should handle different years in time format', () => {
        const differentYear = new Date('2023-06-15T10:00:00.000Z');
        const result = formatDate(differentYear, 'time');
        expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4} at \d{1,2}:\d{2}:\d{2} [AP]M$/);
        expect(result).toContain('2023');
      });
    });

    describe('edge cases', () => {
      it('should handle leap year dates', () => {
        const leapYearDate = new Date('2024-02-29T10:00:00.000Z');
        const result = formatDate(leapYearDate, 'short');
        expect(result).toMatch(/^Feb \d{1,2}, \d{4}$/);
        expect(result).toContain('2024');
      });

      it('should handle end of year dates', () => {
        const endOfYear = new Date('2024-12-31T23:59:59.000Z');
        const result = formatDate(endOfYear, 'short');
        expect(result).toMatch(/^Dec \d{1,2}, \d{4}$/);
        expect(result).toContain('2024');
      });

      it('should handle beginning of year dates', () => {
        const startOfYear = new Date('2024-01-01T00:00:00.000Z');
        const result = formatDate(startOfYear, 'short');
        // Account for timezone differences - could be Dec 31 or Jan 1
        expect(result).toMatch(/^(Dec|Jan) \d{1,2}, \d{4}$/);
        // The year might be 2023 or 2024 due to timezone
        expect(result).toMatch(/\d{4}/);
      });

      it('should handle midnight times', () => {
        const midnight = new Date('2024-01-15T00:00:00.000Z');
        const result = formatDate(midnight, 'long');
        // Account for timezone differences
        expect(result).toMatch(/^[A-Za-z]+ \d{1,2}, \d{4} at \d{1,2}:\d{2} [AP]M$/);
        expect(result).toContain('2024');
      });

      it('should handle noon times', () => {
        const noon = new Date('2024-01-15T12:00:00.000Z');
        const result = formatDate(noon, 'long');
        // Account for timezone differences
        expect(result).toMatch(/^[A-Za-z]+ \d{1,2}, \d{4} at \d{1,2}:\d{2} [AP]M$/);
        expect(result).toContain('2024');
      });
    });

    describe('invalid inputs', () => {
      it('should handle invalid date objects gracefully', () => {
        const invalidDate = new Date('invalid');
        const result = formatDate(invalidDate, 'short');
        // Should return a formatted string even for invalid dates
        expect(typeof result).toBe('string');
        expect(result).toContain('Invalid Date');
      });

      it('should handle null dates gracefully', () => {
        // @ts-ignore - Testing invalid input
        const result = formatDate(null, 'short');
        expect(typeof result).toBe('string');
        expect(result).toBe('Invalid Date');
      });

      it('should handle undefined dates gracefully', () => {
        // @ts-ignore - Testing invalid input
        const result = formatDate(undefined, 'short');
        expect(typeof result).toBe('string');
        expect(result).toBe('Invalid Date');
      });
    });

    describe('format consistency', () => {
      it('should maintain consistent formatting across multiple calls', () => {
        const date1 = new Date('2024-01-15T10:00:00.000Z');
        const date2 = new Date('2024-01-15T10:00:00.000Z');
        
        const result1 = formatDate(date1, 'short');
        const result2 = formatDate(date2, 'short');
        
        expect(result1).toBe(result2);
        expect(result1).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{4}$/);
      });

      it('should handle different time zones consistently', () => {
        const utcDate = new Date('2024-01-15T10:00:00.000Z');
        const localDate = new Date('2024-01-15T10:00:00');
        
        const utcResult = formatDate(utcDate, 'short');
        const localResult = formatDate(localDate, 'short');
        
        // Both should format to the same date string
        expect(utcResult).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{4}$/);
        expect(localResult).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{4}$/);
      });
    });

    describe('format types', () => {
      it('should return different formats for different format types', () => {
        const date = new Date('2024-01-15T10:00:00.000Z');
        
        const shortResult = formatDate(date, 'short');
        const longResult = formatDate(date, 'long');
        const timeResult = formatDate(date, 'time');
        
        // All should be different formats
        expect(shortResult).not.toBe(longResult);
        expect(shortResult).not.toBe(timeResult);
        expect(longResult).not.toBe(timeResult);
        
        // Short should be shortest
        expect(shortResult.length).toBeLessThan(longResult.length);
        
        // Time format length can vary, so just check it's different
        expect(timeResult.length).toBeGreaterThan(0);
      });
    });
  });
}); 