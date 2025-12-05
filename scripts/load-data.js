// load-data.js - Script to load D&D species and class data into DynamoDB

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
    // Read D&D data (species and classes) from JSON file
    const dataPath = path.join(__dirname, "../data/data.json");
    const dndData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    console.log(`Loading ${dndData.length} items (species and classes) into DynamoDB table: ${tableName}`);

    // Insert each item into DynamoDB
    for (const item of dndData) {
      const command = new PutCommand({
        TableName: tableName,
        Item: item,
      });

      await docClient.send(command);
      const itemType = item.id.startsWith('s#') ? 'Species' : 'Class';
      console.log(`✓ Loaded ${itemType}: ${item.name}`);
    }

    console.log("\n✅ All D&D data loaded successfully!");
  } catch (error) {
    console.error("❌ Error loading data:", error);
    process.exit(1);
  }
}

// Run the script
loadData();

