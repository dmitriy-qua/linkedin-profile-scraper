# utils

> Utility functions for date formatting, location parsing, text cleaning, and browser automation support.

---

## Table of Contents

- [Overview](#overview)
- [Key Components](#key-components)
- [Dependencies and Requirements](#dependencies-and-requirements)
- [Usage Examples](#usage-examples)
  - [City and Country Identification](#city-and-country-identification)
  - [Date Formatting and Duration Calculation](#date-formatting-and-duration-calculation)
  - [Location Parsing](#location-parsing)
  - [Text Cleaning](#text-cleaning)
  - [Browser Automation Helpers](#browser-automation-helpers)
- [Important Notes and Considerations](#important-notes-and-considerations)

---

## Overview

The `utils` directory contains a set of reusable utility functions primarily focused on:

- Handling and parsing location-related strings to determine if they represent cities or countries.
- Formatting and calculating durations from date inputs.
- Cleaning and normalizing text data.
- Facilitating browser automation tasks such as automatic page scrolling and extracting hostnames.

These functions support consistent data handling and parsing, especially useful in scraping or data normalization contexts.

---

## Key Components

### Location Utilities

- `getIsCity(text: string): boolean`  
  Determines if the input string corresponds to a known city.

- `getIsCountry(text: string): boolean`  
  Determines if the input string corresponds to a known country.

- `getLocationFromText(text: string): Location | null`  
  Parses a location string into a structured object containing city, province/state, and country fields.

### Date Utilities

- `formatDate(date: moment.MomentInput | string): string`  
  Formats dates into ISO strings, supporting the special `"Present"` keyword to represent the current UTC datetime.

- `getDurationInDays(formattedStartDate: string, formattedEndDate: Date | string): number | null`  
  Calculates the inclusive duration in days between two dates.

### Text Utility

- `getCleanText(text: string | null): string | null`  
  Cleans input text by removing excessive whitespace, line breaks, trailing ellipsis, and certain trailing phrases like "see more" or "see less".

### Browser Automation Utilities

- `autoScroll(page: Page): Promise<void>`  
  Automatically scrolls a Puppeteer page to the bottom by repeatedly scrolling down on intervals. Useful for lazy-loaded content.

- `getHostname(url: string): string`  
  Extracts the hostname portion from a URL string.

- `statusLog(section: string, message: string, scraperSessionId?: string | number): void`  
  Logs scraper status messages to the console, optionally including a session ID.

---

## Dependencies and Requirements

- [moment-timezone](https://momentjs.com/timezone/) (^0.5.34)  
  For date manipulation and formatting with timezone support.
  
- [i18n-iso-countries](https://www.npmjs.com/package/i18n-iso-countries) (^7.1.0)  
  Provides ISO country code data and localized country names.

- [all-the-cities](https://www.npmjs.com/package/all-the-cities) (^1.1.0)  
  Supplies a comprehensive list of city names globally.

- [puppeteer](https://pptr.dev/) (used typings)  
  For browser automation tasks particularly with the `Page` type.

---

## Usage Examples

### City and Country Identification

```ts
import { getIsCity, getIsCountry } from './index';

console.log(getIsCity('Amsterdam'));       // true
console.log(getIsCity('New York City'));   // true
console.log(getIsCity('Netherlands'));     // false

console.log(getIsCountry('Netherlands'));             // true
console.log(getIsCountry('United States of America')); // true
console.log(getIsCountry('Amsterdam'));               // false
```

### Date Formatting and Duration Calculation

```ts
import { formatDate, getDurationInDays } from './index';

// Format date or use current date for "Present"
const formattedDate1 = formatDate(new Date('2020-12-31T01:11:00+01:00'));
console.log(formattedDate1); // "2020-12-31T00:11:00.000Z" (ISO in UTC)

const formattedDate2 = formatDate('Present');
console.log(formattedDate2); // Current ISO UTC date string

// Calculate duration in days (inclusive)
const days = getDurationInDays('2019-12-31', '2020-12-31');
console.log(days); // 367
```

### Location Parsing

```ts
import { getLocationFromText } from './index';

const loc1 = getLocationFromText('Amsterdam, North-Holland, Netherlands');
/* Returns:
{
  city: 'Amsterdam',
  province: 'North-Holland',
  country: 'Netherlands'
}
*/

const loc2 = getLocationFromText('Sacramento, California Area');
/* Returns:
{
  city: 'Sacramento',
  province: 'California',
  country: null
}
*/

const loc3 = getLocationFromText('Netherlands');
/* Returns:
{
  city: null,
  province: null,
  country: 'Netherlands'
}
*/
```

### Text Cleaning

```ts
import { getCleanText } from './index';

console.log(getCleanText('Some text. See more'));       // "Some text."
console.log(getCleanText('Some text...'));              // "Some text"
console.log(getCleanText('Some text.\nOn a new line.')); // "Some text.On a new line."
console.log(getCleanText('Some text with  more   spacing.')); // "Some text with more spacing."
```

### Browser Automation Helpers

```ts
import { autoScroll, getHostname, statusLog } from './index';
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://example.com');

  // Auto-scroll to load content lazily loaded on scroll
  await autoScroll(page);

  const hostname = getHostname('https://example.com/page');
  console.log(hostname); // "example.com"

  statusLog('Navigation', 'Page loaded', 'session-123');

  await browser.close();
})();
```

---

## Important Notes and Considerations

- The country and city detection functions rely on external datasets (`i18n-iso-countries` and `all-the-cities`) and include manual adjustments for some special cases (e.g., `"United States"`, `"New York"`).

- The `formatDate` function treats the input `"Present"` (case-insensitive) specially by returning the current UTC time in ISO format.

- `getCleanText` removes common trailing phrases and extra whitespaces to normalize user or scraped input text; however, line-break handling may sometimes merge words without spaces (see TODO in tests).

- `getLocationFromText` makes assumptions about location string formats, splitting on commas and handling variants like `"Area"` suffixes. It attempts to categorize parts into city, province/state, and country but may return nulls if parts are ambiguous or missing.

- `autoScroll` performs incremental scrolling within a Puppeteer page to help with infinite-scroll or lazy-loaded web pages.

- Logging with `statusLog` adds context like section names and optional session IDs to aid debugging and scraping session traceability.

- The codebase uses **UTC** consistently for date/times, setting the default timezone to `Europe/Amsterdam` only in tests to ensure consistency in CI environments.

---

_Last Updated: June 2024_  
_Version: 1.0.0_

---

For further details or contributions, please see the [project documentation](../README.md) or contact the maintainers.