# Utils Directory Documentation

## 📋 Overview

The `utils` directory contains a collection of utility functions designed to help with text processing, date formatting, location parsing, and web scraping helper functions. These utilities provide reusable methods for handling common tasks such as cleaning text, identifying locations, formatting dates, and performing web scraping operations.

## 🚀 Key Components

### Location Utilities
- `getIsCity(text: string)`: Checks if a given text represents a valid city
- `getIsCountry(text: string)`: Determines if a given text is a country name
- `getLocationFromText(text: string)`: Parses location text into city, province, and country components

### Text Processing
- `getCleanText(text: string)`: Cleans and normalizes text by removing line breaks, extra spaces, and unwanted phrases
- `statusLog(section: string, message: string)`: Logs status messages for scraping processes

### Date Utilities
- `formatDate(date: moment.MomentInput | string)`: Formats dates consistently
- `getDurationInDays(startDate: string, endDate: string)`: Calculates duration between two dates in days

### Web Scraping Helpers
- `autoScroll(page: Page)`: Automatically scrolls a web page
- `getHostname(url: string)`: Extracts hostname from a URL

## 🔧 Dependencies

- `moment-timezone`: Date and time manipulation
- `i18n-iso-countries`: Country name validation
- `all-the-cities`: City name validation
- `puppeteer`: Web scraping and browser automation (for `autoScroll`)

## 📦 Installation

```bash
npm install moment-timezone i18n-iso-countries all-the-cities puppeteer
```

## 🛠️ Usage Examples

### Location Detection
```typescript
// Identify location components
const location = getLocationFromText('Amsterdam, North-Holland, Netherlands');
console.log(location);
// Output: { city: 'Amsterdam', province: 'North-Holland', country: 'Netherlands' }

// Check if text represents a city or country
console.log(getIsCity('New York')); // true
console.log(getIsCountry('Netherlands')); // true
```

### Text Cleaning
```typescript
const cleanedText = getCleanText('Some text with  extra   spaces. See more');
console.log(cleanedText); // 'Some text with extra spaces.'
```

### Date Handling
```typescript
const duration = getDurationInDays('2019-12-31', '2020-12-31');
console.log(duration); // 367 days

const formattedDate = formatDate('2020-12-31');
console.log(formattedDate); // ISO formatted date string
```

### Web Scraping
```typescript
// Scroll a page automatically
await autoScroll(page);

// Get hostname from URL
const hostname = getHostname('https://example.com/page');
console.log(hostname); // 'example.com'
```

## 📝 Notes and Considerations

- Requires Node.js environment
- Uses UTC timezone (Europe/Amsterdam) for consistent date parsing
- Text processing methods are case-insensitive
- Location detection relies on external libraries for validation

## 🔍 Error Handling

Most functions include basic error handling:
- Returns `null` for invalid inputs
- Handles edge cases like incomplete location information
- Supports 'Present' as a valid date input

## 🤝 Contributing

1. Ensure all dependencies are installed
2. Run tests to verify functionality
3. Follow existing code style and patterns
4. Add/update tests for new functionality

## 📄 License

[Include your project's license information]

## 🕒 Last Updated
[Current Date]