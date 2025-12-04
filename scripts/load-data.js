// load-data.js - Script to load sample D&D species data into DynamoDB

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const fs = require("fs");
const path = require("path");

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-west-2" });
const docClient = DynamoDBDocumentClient.from(client);

// Get table name from environment or command line
const tableName = process.env.DYNAMODB_TABLE || process.argv[2];

if (!tableName) {
  console.error("Error: DynamoDB table name is required");
  console.error("Usage: node load-data.js <table-name>");
  console.error("Or set DYNAMODB_TABLE environment variable");
  process.exit(1);
}

async function loadData() {
  try {
    // Read species data from JSON file
    const dataPath = path.join(__dirname, "../data/species.json");
    const speciesData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    console.log(`Loading ${speciesData.length} species into DynamoDB table: ${tableName}`);

    // Insert each species into DynamoDB
    for (const species of speciesData) {
      const command = new PutCommand({
        TableName: tableName,
        Item: species,
      });

      await docClient.send(command);
      console.log(`✓ Loaded: ${species.name}`);
    }

    console.log("\n✅ All species data loaded successfully!");
  } catch (error) {
    console.error("❌ Error loading data:", error);
    process.exit(1);
  }
}

// Run the script
loadData();

