import db from "./mysql-connection/mysql";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./router/router";
import DBconsumer from "./rabbit/messageConsumer";
import RabbitClass from "./rabbit/rabbitSubscriber";
const app: express.Application = express();

app.use("/",router);
app.use(cors());
app.use(bodyParser.json());

console.log("connecting to DB");

db.connect(async (err: any): Promise<any> => {
    if (err)
        throw(err);
    console.log("connected to mysql");
});

const ordersQueue:RabbitClass= new RabbitClass("orders");

ordersQueue.initializeQueue().then(()=>{
    if(ordersQueue.getChannel()){
        ordersQueue.consumeMessages(DBconsumer);
    }
}).catch(err=>{
    console.log(err);
})

app.listen(8080, (): void => {
    console.log("server on port 8080");
})

