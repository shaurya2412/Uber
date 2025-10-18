  import 'dotenv/config'
  import express, {Express, Request, Response} from "express";
  import {MongoClient} from "mongodb"
  import {callAgent} from './agent'

  const app: Express = express()

  import cors from 'cors'
  app.use(cors());
  app.use(express.json())

  const client = new MongoClient(process.env.MONGODB_ATLAS_URL as string)

  async function startServer(){
    try{

        await client.connect();
        await client.db("admin").command({ping:1})
        console.log("you successfully connected to mongodb!")

        app.get("/", (req: Request, res: Response)=>{
            res.send('Langchain Agent Server')
        })
       app.post('/chat', async (req: Request, res: Response)=>{
        const initialMessage = req.body.message
        const threadId = Date.now().toString()
        console.log(initialMessage)
        try{
             const Response = await callAgent(client,initialMessage,threadId)
             res.json({threadId,Response})
        }catch(error){
console.error("there is a error", error);
res.status(500).json({error: 'Internal server error'})
        }
       })

       app.post('/chat/:threadId', async( req: Request, res: Response)=>{
        const {threadId} = req.params
        const {message} = req.body

        try{
            const res = await callAgent(client, message,threadId)
            res.json({res})
        }catch(error){
            console.error(error)
            res.status(500).json({error: "Internal server error"})
        }
        
       })

       const PORT = process.env.PORT || 5500;
       app.listen(PORT, ()=>{
        console.log("listening to the port", PORT);
       })

    }catch(error){
        console.log("there is a issue connecting to mongodb!", error)

    }
  }
  startServer();    