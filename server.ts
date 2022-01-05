import db from "./mysql-connection/mysql";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./router/router";
import addToDbConsumer from "./rabbit/orderMessageConsumer";
import RabbitClass from "./rabbit/rabbitSubscriber";
import {dbConnect} from "./mysql-connection/connectDb";

const app: express.Application = express();
export const ordersQueue:RabbitClass= new RabbitClass("orders",addToDbConsumer);

app.use(cors());
app.use(bodyParser.json());
app.use("/",router);


dbConnect(db).then().catch(err=>{
    console.log(err);
});


ordersQueue.connectRabbit().then(rabbitConnectedFlag=>{
    console.log(rabbitConnectedFlag?"rabbit connected": "rabbit not connected");
}).catch(err=>console.log(err))


app.listen(8080, (): void => {
    console.log("server on port 8080");
})

