// species-api Lambda function - Handles all D&D species and class API requests

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.DYNAMODB_TABLE;

// CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  try {
    // Extract route info
    const httpMethod = event.requestContext?.http?.method || event.httpMethod;
    const path = event.requestContext?.http?.path || event.path;
    const pathParameters = event.pathParameters || {};

    // Handle OPTIONS request (CORS preflight)
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'OK' }),
      };
    }

    // Route based on path
    if (path === '/species' || path.endsWith('/species')) {
      // GET all species
      return await getAllSpecies();
    } else if (path.includes('/species/') || pathParameters.id) {
      // GET species by ID
      const speciesId = pathParameters.id || path.split('/').pop();
      return await getSpeciesById(speciesId);
    } else {
      // Unknown route
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Route not found",
        }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};

// Get all species
async function getAllSpecies() {
  try {
    const command = new ScanCommand({
      TableName: tableName,
    });

    const response = await docClient.send(command);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        count: response.Items.length,
        data: response.Items,
      }),
    };
  } catch (error) {
    console.error("Error getting all species:", error);
    throw error;
  }
}

// Get species by ID
async function getSpeciesById(speciesId) {
  if (!speciesId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: "Species ID is required",
      }),
    };
  }

  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        id: speciesId,
      },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Species not found",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: response.Item,
      }),
    };
  } catch (error) {
    console.error("Error getting species by ID:", error);
    throw error;
  }
}

