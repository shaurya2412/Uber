import { MongoClient } from "mongodb"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"
import "dotenv/config"

const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string)

async function main() {
  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db("test")
    const collection = db.collection("rides")

    await collection.dropIndexes().catch(() => {})
    await collection.createSearchIndex({
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 768,
            similarity: "cosine",
          },
        ],
      },
    })
    console.log("✅ Vector search index created")

    const rides = await collection.find({}).toArray()
    console.log(`📦 Found ${rides.length} rides to process`)

    for (const ride of rides) {
      const pickupAddress = ride.pickup?.address || "unknown location"
      const dropAddress = ride.destination?.address || "unknown location"
      const fare = ride.fare ?? "N/A"
      const status = ride.status || "unknown"
      const paymentStatus = ride.paymentStatus || "unknown"
      const createdAt = new Date(ride.createdAt).toLocaleString()
      const completedAt = ride.completedAt
        ? new Date(ride.completedAt).toLocaleString()
        : "not completed yet"

      const summary = `
        Ride from ${pickupAddress} to ${dropAddress}.
        Fare: ₹${fare}.
        Ride status: ${status}.
        Payment status: ${paymentStatus}.
        Started at: ${createdAt}.
        Completed at: ${completedAt}.
      `.replace(/\s+/g, " ").trim()

      await MongoDBAtlasVectorSearch.fromDocuments(
        [
          {
            pageContent: summary, 
            metadata: {
              rideId: ride._id,
              user: ride.user,
              captain: ride.captain,
              fare: ride.fare,
              status: ride.status,
              pickup: ride.pickup,
              destination: ride.destination,
              createdAt: ride.createdAt,
              completedAt: ride.completedAt,
            },
          },
        ],
        new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GOOGLE_API_KEY,
          model: "text-embedding-004",
        }),
        {
          collection,
          indexName: "vector_index",
          textKey: "embedding_text",
          embeddingKey: "embedding",
        }
      )

      console.log(`✅ Embedded ride: ${ride._id}`)
    }

    console.log("🎉 All rides processed successfully with embeddings added!")
  } catch (error) {
    console.error("❌ Error while processing rides:", error)
  } finally {
    await client.close()
  }
}

main().catch(console.error)
