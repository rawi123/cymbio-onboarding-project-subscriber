import db from "./mysql-connection/mysql";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./router/router";
import addToDbConsumer from "./rabbit/messageConsumer";
import RabbitClass from "./rabbit/rabbitSubscriber";
const app: express.Application = express();


app.use(cors());
app.use(bodyParser.json());
app.use("/",router);

console.log("connecting to DB");

db.connect(async (err: any): Promise<any> => {
    if (err)
        throw(err);
    console.log("connected to mysql");
});

export const ordersQueue:RabbitClass= new RabbitClass("orders",addToDbConsumer);

ordersQueue.connectRabbit().then(rabbitConnectedFlag=>{
    console.log(rabbitConnectedFlag?"rabbit connected": "rabbit not connected");
}).catch(err=>console.log(err))


app.listen(8080, (): void => {
    console.log("server on port 8080");
})

