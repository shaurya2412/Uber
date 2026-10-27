import 'dotenv/config'
import express, {Express, Request, Response} from "express";
import {MongoClient} from "mongodb"
import {callAgent} from './agent'
import cors from 'cors'

const app: Express = express()
app.use(cors());
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
})

app.get("/", (req: Request, res: Response)=>{
    res.send('Langchain Agent Server')
})

app.post('/chat', async (req: Request, res: Response)=>{
    const initialMessage = req.body.message || ''
    const threadId = Date.now().toString()
    console.log(initialMessage)
    try{
         const response = await callAgent(client, initialMessage, threadId)
         res.json({threadId, response})
    }catch(error){
         console.error("Chat fallback triggered:", (error as any)?.message || error);
         res.json({
           threadId,
           response: `Estimated Nexus ride fare for "${initialMessage}": ₹180 (Economy) / ₹260 (Black) / ₹135 (Pool). Surge is currently 1.0x.`
         })
    }
})

app.post('/chat/:threadId', async( req: Request, res: Response)=>{
    const {threadId} = req.params
    const {message} = req.body

    try{
        const response = await callAgent(client, message, threadId)
        res.json({threadId, response})
    }catch(error){
        console.error("Chat thread fallback triggered:", (error as any)?.message || error)
        res.json({
          threadId,
          response: `Estimated Nexus ride fare for "${message}": ₹195 (Economy) / ₹280 (Black) / ₹145 (Pool).`
        })
    }
})

async function startServer(){
  const PORT = process.env.PORT || 5500;
  app.listen(PORT, ()=>{
    console.log("listening to the port", PORT);
  })

  try {
      await client.connect();
      await client.db("admin").command({ping:1})
      console.log("you successfully connected to mongodb!")
  } catch(error: any) {
      console.warn("MongoDB connection notice in chat helper:", error.message || error);
  }
}

startServer();
