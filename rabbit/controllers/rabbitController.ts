import {Request, Response} from "express";
import {ordersQueue} from "../../server";
import RabbitClass from "../rabbitSubscriber";
import rabbitHealthCheck from "../healthCheck";
import rabbitHealthCheckObj from "../../interfaces/rabbitHealthCheckObj";


const rabbitDownError:string="Could not connect to rabbitmq resetting channel";
const queueDoesntExistError:string="Queue does not exist";
const channelNotConnectedError:string="Queue not connected";
const connectedMessage:string="Connected to rabbitmq queue";

const checkRabbitConnection=async(queueName:string):Promise<rabbitHealthCheckObj>=>{
    const queue:RabbitClass|null = getQueue(queueName);
    if(!queue)
        return ({
            connected:false,
            message:queueDoesntExistError
        });

    if(!queue.getChannel())
        return ({
            connected:false,
            message:`${channelNotConnectedError}: ${queueName}`
        });

    if (!await rabbitHealthCheck()) {
        queue.resetChannel();
        console.log(rabbitDownError);
        return ({
            connected: false,
            message: rabbitDownError
        });
    }

    return {
        connected:true,
        message:`${connectedMessage}: ${queueName}`
    }
}

export const checkRabbitConnectIfDown = async (req: Request, res: Response): Promise<void> => {
    const rabbitConnectionCheck:rabbitHealthCheckObj=await checkRabbitConnection(req.body?.queueName || "")

    if(rabbitConnectionCheck.connected)
        res.status(200).json(rabbitConnectionCheck.message);

    else if(rabbitConnectionCheck.message===rabbitDownError)
        res.status(404).json(rabbitConnectionCheck.message);

    else if(rabbitConnectionCheck.message===queueDoesntExistError)
        res.status(404).json(rabbitConnectionCheck.message);

    else if(rabbitConnectionCheck.message===channelNotConnectedError){
        const queue:RabbitClass|null = getQueue(req.body?.queueName||"");

        if(await queue?.connectRabbit())
            res.status(200).json(`${queue?.channelName} queue connection has been reset, queue up`);

        else
            res.status(200).json(`could not connect to ${queue?.channelName} queue`);
    }
}




const getQueue = (queueName: string): RabbitClass | null => {
    if (queueName === "orders")
        return ordersQueue;
    return null
}
