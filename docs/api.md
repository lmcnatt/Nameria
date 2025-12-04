# API Documentation - Nameria D&D Species Portal

## Overview

The Nameria API provides access to Dungeons & Dragons species data for the campaign. Built with AWS API Gateway and Lambda, the API is RESTful and returns JSON responses.

**Base URL**: `https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/dev`

---

## Authentication

Currently, the API is public and does not require authentication. For production, consider implementing:
- API Keys
- AWS Cognito
- OAuth 2.0
- IAM authentication

---

## Endpoints

### 1. Get All Species

Retrieves all D&D species in the database.

**Endpoint**: `GET /species`

**Request**:
```bash
curl https://YOUR_API_URL/species
```

**Response** (200 OK):
```json
{
  "success": true,
  "count": 9,
  "data": [
    {
      "id": "dragonborn",
      "name": "Dragonborn",
      "description": "Born of dragons...",
      "size": "Medium",
      "speed": 30,
      "abilityScores": {
        "Strength": 2,
        "Charisma": 1
      },
      "traits": [
        "Draconic Ancestry",
        "Breath Weapon",
        "Damage Resistance"
      ],
      "languages": ["Common", "Draconic"],
      "imageUrl": ""
    }
    // ... more species
  ]
}
```

**Response Codes**:
- `200 OK`: Success
- `500 Internal Server Error`: Server error

**Example**:
```javascript
fetch('https://YOUR_API_URL/species')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

### 2. Get Species by ID

Retrieves a single D&D species by its unique identifier.

**Endpoint**: `GET /species/{id}`

**Parameters**:
- `id` (path parameter): Species identifier (e.g., "dragonborn", "elf", "dwarf")

**Request**:
```bash
curl https://YOUR_API_URL/species/dragonborn
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "dragonborn",
    "name": "Dragonborn",
    "description": "Born of dragons, as their name proclaims...",
    "size": "Medium",
    "speed": 30,
    "abilityScores": {
      "Strength": 2,
      "Charisma": 1
    },
    "traits": [
      "Draconic Ancestry",
      "Breath Weapon",
      "Damage Resistance"
    ],
    "languages": ["Common", "Draconic"],
    "imageUrl": ""
  }
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Species not found"
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Species ID is required"
}
```

**Response Codes**:
- `200 OK`: Success
- `400 Bad Request`: Missing or invalid ID
- `404 Not Found`: Species not found
- `500 Internal Server Error`: Server error

**Example**:
```javascript
fetch('https://YOUR_API_URL/species/elf')
  .then(response => response.json())
  .then(data => console.log(data));
```

---

## Data Model

### Species Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (lowercase, hyphenated) |
| `name` | String | Display name of the species |
| `description` | String | Detailed description of the species |
| `size` | String | Size category (Small, Medium, Large) |
| `speed` | Number | Base walking speed in feet |
| `abilityScores` | Object | Ability score increases |
| `traits` | Array[String] | List of racial traits |
| `languages` | Array[String] | Languages known |
| `imageUrl` | String | URL to species image (optional) |

### Example Species Object

```json
{
  "id": "elf",
  "name": "Elf",
  "description": "Elves are a magical people of otherworldly grace...",
  "size": "Medium",
  "speed": 30,
  "abilityScores": {
    "Dexterity": 2
  },
  "traits": [
    "Darkvision",
    "Keen Senses",
    "Fey Ancestry",
    "Trance"
  ],
  "languages": ["Common", "Elvish"],
  "imageUrl": "https://example.com/elf.jpg"
}
```

---

## CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS) with the following configuration:

- **Allowed Origins**: `*` (all origins)
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Allowed Headers**: `content-type`, `x-amz-date`, `authorization`, `x-api-key`
- **Max Age**: 300 seconds

For production, restrict `Allowed Origins` to your specific domain(s).

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:
- API Gateway throttling
- AWS WAF rate-based rules
- Per-client quotas

**Recommended Limits**:
- Burst: 100 requests per second
- Steady state: 50 requests per second
- Daily quota: 10,000 requests per API key

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description",
  "message": "Additional technical details (optional)"
}
```

### Common Error Codes

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side issue |
| 503 | Service Unavailable - Temporary outage |

---

## Performance

### Response Times
- **Average**: ~100ms
- **P95**: ~200ms
- **P99**: ~500ms

### Caching
- CloudFront caches responses for 1 hour
- API Gateway caching: Not enabled (optional)

### Optimization Tips
1. Use CloudFront for geographic distribution
2. Enable API Gateway caching for frequently accessed endpoints
3. Implement client-side caching
4. Use ETags for conditional requests

---

## Versioning

**Current Version**: v1 (implicit)

Future versions will be explicitly versioned:
- `/v1/species`
- `/v2/species`

---

## Future Endpoints (Planned)

### Search Species
```
GET /species/search?q={query}
```

### Filter by Trait
```
GET /species?trait={trait_name}
```

### Filter by Size
```
GET /species?size={size_category}
```

### Get Random Species
```
GET /species/random
```

### Create Species (Admin)
```
POST /species
```

### Update Species (Admin)
```
PUT /species/{id}
```

### Delete Species (Admin)
```
DELETE /species/{id}
```

---

## Testing

### Test with cURL

```bash
# Get all species
curl -X GET https://YOUR_API_URL/species

# Get specific species
curl -X GET https://YOUR_API_URL/species/dragonborn

# With headers
curl -X GET https://YOUR_API_URL/species \
  -H "Content-Type: application/json"
```

### Test with JavaScript

```javascript
// Using Fetch API
async function getAllSpecies() {
  try {
    const response = await fetch('https://YOUR_API_URL/species');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Using Axios
import axios from 'axios';

async function getSpeciesById(id) {
  try {
    const response = await axios.get(`https://YOUR_API_URL/species/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Test with Postman

1. Import collection from `/docs/postman_collection.json` (if available)
2. Set environment variable `API_URL` to your API Gateway URL
3. Run tests

---

## Monitoring

### CloudWatch Metrics

Monitor these metrics in CloudWatch:
- `4XXError`: Client errors
- `5XXError`: Server errors
- `Count`: Total requests
- `Latency`: Response time
- `IntegrationLatency`: Backend processing time

### Alarms

Recommended CloudWatch alarms:
- 5XX errors > 10 in 5 minutes
- Latency > 1000ms for 3 consecutive periods
- Throttles > 100 in 5 minutes

---

## SDK Examples

### Python (boto3)

```python
import requests

API_URL = "https://YOUR_API_URL"

# Get all species
response = requests.get(f"{API_URL}/species")
species = response.json()

# Get specific species
response = requests.get(f"{API_URL}/species/dragonborn")
dragonborn = response.json()
```

### Node.js

```javascript
const axios = require('axios');

const API_URL = 'https://YOUR_API_URL';

// Get all species
axios.get(`${API_URL}/species`)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// Get specific species
axios.get(`${API_URL}/species/elf`)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

## Support

For API issues or questions:
- Check CloudWatch Logs
- Review error messages
- Verify endpoint URLs
- Test with curl first
- Contact: Logan McNatt

---

*Last Updated: December 2024*

