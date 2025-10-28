// agent.ts
// ───────────────────────────────────────────────────────────────
// 📦 Imports
// ───────────────────────────────────────────────────────────────
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { z } from "zod";
import "dotenv/config";

// ───────────────────────────────────────────────────────────────
// Retry helper
// ───────────────────────────────────────────────────────────────
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.warn(`Rate limit hit. Retry #${attempt} in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// ───────────────────────────────────────────────────────────────
// Main exported function
// ───────────────────────────────────────────────────────────────
export async function callRideAgent(client: MongoClient, query: string, thread_id: string) {
  try {
    // sanity checks
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("Missing GOOGLE_API_KEY in environment");
    }

    const dbName = "test";
    const db = client.db(dbName);
    const collection = db.collection("rides");

    // ------------------ Graph State (cast to any to avoid deep inference) ------------------
    const GraphState = (Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    }) as any) as typeof Annotation.Root;

    // ------------------ Tool: ride lookup ------------------
    const rideLookupTool = tool(
      async ({ query, n = 5 }: { query: string; n?: number }) => {
        try {
          console.log("ride_lookup called with:", query, "n=", n);

          const totalCount = await collection.countDocuments();
          if (totalCount === 0) {
            return JSON.stringify({
              error: "No rides found in database",
              message: "The rides collection appears empty.",
              count: 0,
            });
          }

          const dbConfig = {
            collection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          };

          const vectorStore = new MongoDBAtlasVectorSearch(
            new GoogleGenerativeAIEmbeddings({
              apiKey: process.env.GOOGLE_API_KEY!,
              model: "text-embedding-004",
            }),
            dbConfig
          );

          // Similarity search with backoff for network hiccups
          const result = await retryWithBackoff(() => vectorStore.similaritySearchWithScore(query, n));

          if (!result || result.length === 0) {
            const textResults = await collection
              .find({
                $or: [
                  { "pickup.address": { $regex: query, $options: "i" } },
                  { "destination.address": { $regex: query, $options: "i" } },
                  { status: { $regex: query, $options: "i" } },
                  { paymentStatus: { $regex: query, $options: "i" } },
                ],
              })
              .limit(n)
              .toArray();

            return JSON.stringify({
              results: textResults,
              searchType: "text",
              count: textResults.length,
            });
          }

          return JSON.stringify({
            results: result,
            searchType: "vector",
            count: result.length,
          });
        } catch (err: any) {
          console.error("Error inside rideLookupTool:", err);
          return JSON.stringify({ error: "ride_lookup_error", details: err?.message ?? String(err) });
        }
      },
      {
        name: "ride_lookup",
        description: "Find rides by pickup, destination, fare, or status.",
        schema: z.object({
          query: z.string().describe("User query (e.g., 'find my Delhi rides')"),
          n: z.number().optional().default(5),
        }),
      }
    );

    // ------------------ Tools & ToolNode (use any to avoid deep type recursion) ------------------
    const tools = [rideLookupTool];
    const toolNode = new ToolNode<any>(tools);

    // ------------------ Model ------------------
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0,
      maxRetries: 0,
      apiKey: process.env.GOOGLE_API_KEY!,
    }).bindTools(tools);

    // ------------------ Decision function ------------------
    function shouldContinue(state: any) {
      const messages: BaseMessage[] = state.messages ?? [];
      const lastMessage = messages[messages.length - 1] as AIMessage | undefined;
      return lastMessage?.tool_calls?.length ? "tools" : "__end__";
    }

    // ------------------ callModel ------------------
    async function callModel(state: any) {
      return retryWithBackoff(async () => {
        const prompt = ChatPromptTemplate.fromMessages([
          [
            "system",
            `You are a helpful Ride Assistant AI for a ride-hailing app.

You can use the 'ride_lookup' tool to fetch details about rides (pickup/destination/fare/status/payment).
Always call the tool when a user asks about rides. If there are no results, inform the user politely.

Current time: {time}`,
          ],
          new MessagesPlaceholder("messages"),
        ]);

        const formattedPrompt = await prompt.formatMessages({
          time: new Date().toISOString(),
          messages: state.messages,
        });

        const result = await model.invoke(formattedPrompt);
        return { messages: [result] };
      });
    }

    // ------------------ Workflow ------------------
    const workflow = new StateGraph(GraphState as any)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .addEdge("tools", "agent");

    // ------------------ Checkpointer & compile ------------------
    const checkpointer = new MongoDBSaver({ client, dbName });
    const app = workflow.compile({ checkpointer });

    // ------------------ Invoke ------------------
    const finalState = await app.invoke(
      { messages: [new HumanMessage(query)] },
      {
        recursionLimit: 15,
        configurable: { thread_id },
      }
    );

    const last = finalState.messages[finalState.messages.length - 1];
    const response = last?.content ?? "No response content";
    console.log("Ride Agent response:", response);
    return response;
  } catch (err: any) {
    console.error("callRideAgent failed:", err);
    if (err?.status === 429) throw new Error("Rate limit — please try again later.");
    if (err?.status === 401) throw new Error("Auth failed — check API keys.");
    throw err;
  }
}
