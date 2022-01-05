import mysql from "mysql";
import {waitForMS} from "../rabbit/rabbitSubscriber";

export const dbConnect=async(dataBase:mysql.Connection,retries:number=0):Promise<void>=>{
    console.log("connecting to DB retry number:",retries);

    if(retries>=3){
        console.log("failed to connect to db after 3 retries");
        return ;
    }

    dataBase.connect(async (err: any): Promise<void> => {
        if (err){
            console.log("db error", err,'retry number : ',retries);
            await waitForMS(3000);
            await dbConnect(dataBase,retries+1);
        }
        else
            console.log("connected to mysql");

    });

}