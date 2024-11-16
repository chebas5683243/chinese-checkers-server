import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

console.log("DynamoDBClient initialized");

const dynamoDBClient = new DynamoDBClient({
  region: "us-east-2",
});

export default dynamoDBClient;
