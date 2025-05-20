# LinkedIn Profile Scraper Examples

## Overview

This directory contains example implementations demonstrating the usage of the LinkedIn Profile Scraper library. These examples showcase different scenarios and approaches for scraping LinkedIn user profiles, including scraping multiple URLs, individual profile retrieval, and creating a simple web server endpoint for profile scraping.

## Table of Contents
- [Overview](#overview)
- [Examples](#examples)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Configuration](#configuration)
- [Important Notes](#important-notes)

## Examples

### 1. List of URLs (`list-of-urls.js`)
Demonstrates scraping multiple LinkedIn profile URLs concurrently using `Promise.all()`.

### 2. Module Usage (`module.js`)
Shows how to scrape a single LinkedIn profile using the module's direct scraping method.

### 3. Express Server (`server.js`)
Implements an Express.js server that provides a web endpoint for scraping LinkedIn profiles dynamically.

## Requirements

- Node.js (v14+ recommended)
- npm or Yarn
- LinkedIn Session Cookie
- `.env` file with `LINKEDIN_SESSION_COOKIE_VALUE`

## Dependencies
- `dotenv`
- `express` (for server example)
- `tslib`
- LinkedIn Profile Scraper library

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file:
```bash
LINKEDIN_SESSION_COOKIE_VALUE=your_linkedin_session_cookie
PORT=3000  # Optional, defaults to 3000
```

## Usage

### List of URLs Example
```javascript
const scraper = new LinkedInProfileScraper({
  sessionCookieValue: process.env.LINKEDIN_SESSION_COOKIE_VALUE,
  keepAlive: true
});

const profiles = await Promise.all([
  scraper.run('https://linkedin.com/in/profile1'),
  scraper.run('https://linkedin.com/in/profile2')
]);
```

### Module Usage Example
```javascript
const result = await scraper.scrapeUserProfile({ 
  url: 'https://linkedin.com/in/example-profile' 
});
```

### Server Example
```bash
# Start the server
npm run start:server

# Make a request
curl "http://localhost:3000/?url=https://linkedin.com/in/example-profile"
```

## Configuration

The scraper supports several configuration options:
- `sessionCookieValue`: **Required** LinkedIn session cookie
- `keepAlive`: Maintain browser session (default: `false`)
- `timeout`: Request timeout in milliseconds
- `headless`: Run browser in headless mode

## Important Notes

⚠️ **Disclaimer**:
- Ensure compliance with LinkedIn's Terms of Service
- Web scraping may violate platform policies
- Use responsibly and ethically
- Obtain necessary permissions before scraping

## Troubleshooting

- Verify LinkedIn session cookie is valid
- Check network connectivity
- Ensure all dependencies are installed
- Update scraper to latest version

## License

[Include your project's license information]

## Contributing

[Include contribution guidelines]

---

**Last Updated**: [Current Date]
**Version**: [Your Library Version]