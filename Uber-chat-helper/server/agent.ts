import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";

// Define a tool for the agent to use
const calculateFareTool = tool(
  async ({ pickup, destination }) => {
    // In a real app, this would use a geocoding API and then call the backend fare route.
    // For demonstration, we'll return a simulated but realistic fare.
    const distanceKm = Math.floor(Math.random() * (20 - 2 + 1) + 2); // Random distance 2-20 km
    const baseFare = 50;
    const perKmRate = 12;
    const fare = baseFare + distanceKm * perKmRate;
    return `The estimated fare from ${pickup} to ${destination} is INR ${fare} (approx. ${distanceKm} km distance).`;
  },
  {
    name: "calculate_fare",
    description: "Calculates the estimated Uber ride fare between a pickup location and a destination.",
    schema: z.object({
      pickup: z.string().describe("The pickup location name or address"),
      destination: z.string().describe("The destination location name or address"),
    }),
  }
);

const tools = [calculateFareTool];

export async function callAgent(client: MongoClient, message: string, threadId: string) {
  const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
  }).bindTools(tools);

  const toolNode = new ToolNode(tools);

  // Define the function that calls the model
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke([
      { role: "system", content: "You are a helpful Uber customer support and fare estimation assistant. Use the calculate_fare tool to give price estimates." },
      ...state.messages,
    ]);
    return { messages: [response] };
  };

  // Define logic to route depending on whether the model called a tool
  const shouldContinue = (state: typeof MessagesAnnotation.State) => {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.additional_kwargs?.tool_calls?.length || lastMessage.tool_calls?.length) {
      return "tools";
    }
    return "__end__";
  };

  // Build the state graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  // Initialize the MongoDB checkpointer
  const checkpointer = new MongoDBSaver({
    client,
    dbName: "uber_chat",
    collectionName: "checkpoints",
  });

  const app = workflow.compile({ checkpointer });

  const finalState = await app.invoke(
    { messages: [{ role: "user", content: message }] },
    { configurable: { thread_id: threadId } }
  );

  const finalMessages = finalState.messages;
  return finalMessages[finalMessages.length - 1].content;
}
