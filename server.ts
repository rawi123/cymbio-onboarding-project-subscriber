import db from "./mysql-connection/mysql";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import rabbitConnect from "./rabbit/rabbitSubscriber";
import router from "./router/router";
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

// rabbitConnect().then(res=>{
//     console.log("connected to rabbit")
// });

app.listen(8080, (): void => {
    console.log("server on port 8080");
})

