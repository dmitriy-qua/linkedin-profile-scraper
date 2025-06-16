# examples

## Table of Contents

- [Overview](#overview)
- [Key Components](#key-components)
- [Dependencies and Requirements](#dependencies-and-requirements)
- [Usage Examples](#usage-examples)
- [Important Notes and Considerations](#important-notes-and-considerations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Version and Maintenance](#version-and-maintenance)
- [Contact](#contact)

## Overview

This directory contains example code demonstrating how to set up and run a LinkedIn profile scraper server using Express and the `LinkedInProfileScraper` class from the main library. The server listens for incoming HTTP requests with LinkedIn profile URLs in the query, scrapes the profile data, and returns it in JSON format.

## Key Components

### `src/examples/server.ts`

- **Purpose:** Implements an Express server that exposes a simple GET endpoint to scrape LinkedIn profiles on demand.
- **Main functionality:**
  - Loads environment variables (including the important LinkedIn session cookie) using `dotenv`.
  - Instantiates `LinkedInProfileScraper` with session cookie and options like `keepAlive` and `timeout`.
  - Calls `scraper.setup()` to initialize the scraper before accepting requests.
  - Defines a GET route `/` that takes a LinkedIn profile URL as a query parameter (`url`) and returns the scraped profile data as JSON.
  - Starts the HTTP server on the configured port.

### `src/examples/test.js`

- Currently empty; placeholder for potential tests or additional example scripts.

## Dependencies and Requirements

- Node.js environment
- The following main dependencies:
  - `express` (version compatible with the code, e.g., ^4.x)
  - `dotenv` (for environment variable loading)
  - The LinkedInProfileScraper library imported from `../index` (ensure this is installed or built locally)
- A valid LinkedIn session cookie value must be supplied via environment variables:
  - `LINKEDIN_SESSION_COOKIE_VALUE`
- Optional environment variable:
  - `PORT` (defaults to 3000 if not set)

## Usage Examples

### Running the server

1. Create a `.env` file in the root or `src/examples` directory specifying:

   ```
   LINKEDIN_SESSION_COOKIE_VALUE=your_valid_linkedin_session_cookie_here
   PORT=3000
   ```

2. Install required dependencies:

   ```bash
   npm install express dotenv
   # plus any necessary peer dependencies or build the main library
   ```

3. Start the server:

   ```bash
   node dist/examples/server.js
   ```

   Replace with `ts-node` or your preferred TypeScript runner if necessary.

### Scraping a LinkedIn Profile

Send an HTTP GET request to the server with the profile URL as a query param:

```bash
curl "http://localhost:3000/?url=https://www.linkedin.com/in/dmitriy-karpenko/"
```

#### Expected JSON response (example skeleton):

```json
{
  "profile": {
    "firstName": "Dmitriy",
    "lastName": "Karpenko",
    "headline": "Senior Software Developer",
    "location": "San Francisco Bay Area",
    "experience": [
      {
        "title": "Software Engineer",
        "company": "Example Corp",
        "startDate": "2018-01-01",
        "endDate": "2022-01-01"
      }
    ],
    ...
  }
}
```

*The exact shape depends on the LinkedInProfileScraper implementation.*

## Important Notes and Considerations

- The scraper requires a valid and active LinkedIn session cookie. Without it, scraping will fail.
- Session cookies expire periodically; update the `.env` value as needed.
- The server uses a persistent session by setting `keepAlive: true`, improving efficiency for multiple requests.
- Timeout is set to 30 seconds; adjust via the `timeout` option if needed.
- Currently, the scraper runs in headless mode. The `headless` option is commented out but can be enabled for debugging.
- This example server is minimal and intended for demonstration purposes. For production, consider adding proper error handling, security, and input validation.

## Troubleshooting

- **Issue: Server not starting or ENV variables missing**
  - Ensure `.env` file exists with required variables.
  - Verify the environment variables are loaded properly.

- **Issue: Scraping results are empty or error**
  - Confirm that the LinkedIn session cookie is valid and has not expired.
  - Check network connectivity and that LinkedIn is accessible.
  - Inspect the server logs for errors during scraping.

- **Issue: Port already in use**
  - Change the `PORT` environment variable or free the port.

## Contributing

Contributions to improve examples or add additional usage demonstrations are welcome. Please submit pull requests following the project's contribution guidelines.

## Version and Maintenance

- Last updated: 2024-06-15
- Version: 1.0.0 (example directory)
- No breaking changes currently documented for this example setup.
- For updates, see the main project changelog.

## Contact

For questions or issues related to this example code, please open an issue in the main repository or contact the maintainer at `support@example.com`.

---

*This README was auto-generated based on the current source code in `src/examples`.*