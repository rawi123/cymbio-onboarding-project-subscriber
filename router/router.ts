import express,{Request,Response} from "express";
import {checkRabbitConnectIfDown} from "../rabbit/controllers/rabbitController";
import {getOrdersAndLines} from "../mysql-connection/dbController/getAllOrders";
import deleteAllOrdersRequest from "../mysql-connection/dbController/deleteOrders";

const router:express.Router=express.Router();

router.get("/orders",async (req:Request,res:Response):Promise<void>=>{
    res.status(200).json(await getOrdersAndLines());
})

router.get("/rabbit-health-check",async(req:Request,res:Response)=>{
    await checkRabbitConnectIfDown(req,res);
})

router.delete("/delete-all-orders",async(req:Request,res:Response)=>{
    await deleteAllOrdersRequest(req,res);
})











export default router;