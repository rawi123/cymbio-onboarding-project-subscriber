import express from "express";
import db from "../mysql-connection/mysql"
const router:express.Router=express.Router();

router.get("/orders",async (req:express.Request,res:express.Response):Promise<void>=>{
    res.status(200).json(await getOrdersAndLines());
})

const getOrdersAndLines = async ():Promise<any> => {//interface
    const getAllDataSQL:string=`SELECT *
                FROM orders o
                JOIN retailers r
                USING (retailer_id)
                JOIN order_lines ol
                USING (order_id)
                JOIN variants v
                USING (variant_id); `

    const query = new Promise<void>((resolve, reject) => {
        db.query(getAllDataSQL, (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        })
    })

    return query;
}









export default router;