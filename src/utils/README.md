# Utils Directory Documentation

## 📋 Overview

The `utils` directory contains a collection of utility functions designed to handle various text processing, date formatting, location parsing, and web scraping helper tasks. These functions provide essential support for data manipulation, cleaning, and validation across the application.

## 🚀 Key Components

### Location Utilities
- `getIsCountry(text)`: Validates if a given text represents a country name
- `getIsCity(text)`: Checks if a text represents a valid city name
- `getLocationFromText(text)`: Parses location strings into structured location objects

### Text Processing
- `getCleanText(text)`: Cleans and standardizes text by removing unnecessary whitespaces, line breaks, and specific phrases
- `statusLog(section, message)`: Logs status messages for scraping processes

### Date Utilities
- `formatDate(date)`: Converts dates to ISO string format
- `getDurationInDays(startDate, endDate)`: Calculates duration between two dates

### Web Scraping Helpers
- `autoScroll(page)`: Automatically scrolls a web page for dynamic content loading
- `getHostname(url)`: Extracts the hostname from a URL

## 🔧 Dependencies

- `moment-timezone`: Date and time manipulation
- `puppeteer`: Web scraping and browser automation
- `i18n-iso-countries`: Country name validation
- `all-the-cities`: City name validation

## 📦 Installation

```bash
npm install moment-timezone puppeteer i18n-iso-countries all-the-cities
```

## 🎯 Usage Examples

### Location Parsing
```typescript
const location = getLocationFromText('Amsterdam, North-Holland, Netherlands');
// Returns: { city: 'Amsterdam', province: 'North-Holland', country: 'Netherlands' }

const isCity = getIsCity('New York');  // Returns: true
const isCountry = getIsCountry('Netherlands');  // Returns: true
```

### Text Cleaning
```typescript
const cleanedText = getCleanText('Some text with  extra   spaces.');
// Returns: 'Some text with extra spaces.'
```

### Date Handling
```typescript
const formattedDate = formatDate('2023-01-15');
// Returns: ISO formatted date string

const duration = getDurationInDays('2022-01-01', '2023-01-01');
// Returns: 366 (days between dates)
```

### Web Scraping
```typescript
await autoScroll(page);  // Scrolls page to load dynamic content
const hostname = getHostname('https://example.com/page');  // Returns: 'example.com'
```

## 🚨 Important Notes

- Functions assume English language input
- Location parsing might have limitations with complex or ambiguous location strings
- Date parsing uses moment.js with UTC timezone

## 🤝 Contributing

- Ensure comprehensive test coverage
- Follow existing code style and conventions
- Update documentation when adding/modifying functions

## 📜 License

[Insert project license information]

## 🔍 Version

Current version: 1.0.0
Last updated: [Current Date]