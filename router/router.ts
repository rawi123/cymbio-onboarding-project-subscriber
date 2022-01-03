import express,{Request,Response} from "express";
import db from "../mysql-connection/mysql"
import {rabbitConnectionUp} from "../rabbit/controllers/rabbitController";

const router:express.Router=express.Router();

router.get("/orders",async (req:Request,res:Response):Promise<void>=>{
    res.status(200).json(await getOrdersAndLines());
})

router.get("/rabbit-health-check",async(req:Request,res:Response)=>{
    await rabbitConnectionUp(req,res);
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