import express from "express";
import db from "./mysql-connection/mysql"
const router:express.Router=express.Router();

router.get("/orders",async (req:express.Request,res:express.Response):Promise<any>=>{

})

const getOrdersAndLines = async ():Promise<any> => {
    const sql:string=`SELECT * FROM orders
                      JOIN `
    const query = new Promise<any>((resolve, reject) => {
        db.query(sql, (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        })
    })

    return (await query).insertId;
}









export default router;