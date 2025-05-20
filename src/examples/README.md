# LinkedIn Profile Scraper - Server Example

## 📝 Overview

This is an Express.js server example demonstrating how to use the LinkedIn Profile Scraper to retrieve profile information via an HTTP endpoint. The server allows scraping LinkedIn profiles by providing a profile URL as a query parameter, utilizing environment-based configuration and providing a simple web interface for profile data retrieval.

## 🚀 Features

- Express.js web server
- LinkedIn profile scraping integration
- Dynamic URL-based profile retrieval
- Environment configuration support

## 🔧 Prerequisites

### Dependencies
- Node.js (v14+ recommended)
- npm or yarn
- LinkedIn session cookie

### Required Packages
- express
- dotenv
- linkedin-profile-scraper (local package)

## 🛠 Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Create a .env file
touch .env
```

## 📋 Configuration

Create a `.env` file with the following variables:

```env
LINKEDIN_SESSION_COOKIE_VALUE=your_linkedin_session_cookie
PORT=3000
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `LINKEDIN_SESSION_COOKIE_VALUE` | LinkedIn authentication cookie | Required |
| `PORT` | Server listening port | 3000 |

## 💻 Usage Example

### Starting the Server

```bash
npm start
```

### Scraping a Profile

Send a GET request to:
```
http://localhost:3000/?url=https://www.linkedin.com/in/profile-url
```

### Example Request

```javascript
fetch('http://localhost:3000/?url=https://www.linkedin.com/in/sample-profile')
  .then(response => response.json())
  .then(data => console.log(data))
```

## 🔒 Security Considerations

- Never share your LinkedIn session cookie publicly
- Use environment variables for sensitive information
- Implement proper authentication in production

## ⚠️ Important Notes

- Requires a valid LinkedIn session cookie
- Respects LinkedIn's terms of service
- Scraping might be subject to rate limits

## 🐛 Troubleshooting

- Ensure LinkedIn session cookie is current
- Check network connectivity
- Verify environment configuration
- Update scraper library if encountering issues

## 📄 License

[Your License Here]

## 🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

For issues or questions, please file a GitHub issue or contact [your contact information].

---

**Last Updated:** [Current Date]
**Version:** 1.0.0