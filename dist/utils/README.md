# Utils Directory - Utility Functions

## Overview

The `utils` directory contains a collection of utility functions designed to assist with various tasks such as location parsing, date formatting, text cleaning, and web scraping helpers. These functions provide reusable, common functionality across the application, supporting operations like location extraction, date manipulation, and logging.

## Table of Contents
- [Installation](#installation)
- [Dependencies](#dependencies)
- [Functions](#functions)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Dependencies

- `moment-timezone`: Date and time manipulation
- `i18n-iso-countries`: Country name validation
- `all-the-cities`: City name validation
- `puppeteer`: Web scraping utilities

## Functions

### Location and Text Utilities

#### `getIsCountry(text: string): boolean`
Checks if the given text represents a valid country name.

#### `getIsCity(text: string): boolean`
Determines if the provided text is a recognized city name.

#### `getLocationFromText(text: string): Location | null`
Parses location text and extracts city, province, and country information.

#### `getCleanText(text: string | null): string | null`
Removes unnecessary whitespaces, line breaks, and specific text patterns from input.

### Date and Time Utilities

#### `formatDate(date: moment.MomentInput | string): string`
Converts input dates to ISO string format, handling special cases like "Present".

#### `getDurationInDays(formattedStartDate: string, formattedEndDate: Date | string): number | null`
Calculates the duration between two dates in days.

### Web Scraping Helpers

#### `statusLog(section: string, message: string, scraperSessionId?: string | number): void`
Logs scraper-related status messages with optional session tracking.

#### `autoScroll(page: Page): Promise<void>`
Automatically scrolls a web page to load dynamic content.

#### `getHostname(url: string): string`
Extracts the hostname from a given URL.

## Usage Examples

### Location Parsing
```typescript
const location = getLocationFromText('San Francisco, CA, United States');
console.log(location);
// Output: { city: 'San Francisco', province: 'CA', country: 'United States' }
```

### Date Formatting
```typescript
const formattedDate = formatDate('Jan 2023');
console.log(formattedDate);
// Output: ISO formatted date string
```

### Text Cleaning
```typescript
const cleanedText = getCleanText('  Multiple   Spaces \n and Line Breaks  ');
console.log(cleanedText);
// Output: 'Multiple Spaces and Line Breaks'
```

### Logging
```typescript
statusLog('Scraping', 'Starting LinkedIn profile extraction', 'session-123');
// Console output: Scraper (Scraping) (session-123): Starting LinkedIn profile extraction
```

## Best Practices

- Always handle potential `null` or `undefined` inputs
- Use type checking when working with location and text utilities
- Validate dates before processing
- Consider performance when using text parsing functions with large datasets

## Error Handling

- Most functions return `null` for invalid inputs
- Check return values before further processing
- Use try-catch blocks when calling functions that might throw exceptions

## Contribution

Please ensure all utility functions:
- Have clear, single-responsibility purposes
- Include comprehensive input validation
- Maintain consistent error handling
- Have corresponding unit tests

## License

[Include your project's license information]

## Contact

[Include contact information or support channels]

---

**Last Updated:** [Current Date]
**Version:** 1.0.0