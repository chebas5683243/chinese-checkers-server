import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import dynamoDBClient from "../utils/dynamodbClient.js";

async function findGameById(id: string){
  try {
    const response = await dynamoDBClient.send(new GetItemCommand({
      TableName: 'games',
      Key: {
        id: {
          S: id,
        },
      }
    }));
  } catch (error) {
    console.log(error);
  }
}

export {
  findGameById
}