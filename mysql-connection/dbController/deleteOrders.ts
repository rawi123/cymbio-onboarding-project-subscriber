import runSqlQuery from "../runSql/runSqlQuery";
import db from "../mysql";
import {Request,Response} from "express";
import mysql from "mysql";

const deleteAllOrders=async(dataBase:mysql.Connection):Promise<boolean>=>{
    console.log(`deleting all orders`);
    try {
        const sql: string = `DELETE FROM order_lines;
                      DELETE FROM orders;`
        await runSqlQuery(sql, dataBase);
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

const deleteAllOrdersRequest=async(req:Request,res:Response)=>{
    if(await deleteAllOrders(db))
        res.json("all orders deleted").status(200);
    res.json("fail in deleting orders").status(404);
}

export default deleteAllOrdersRequest;
