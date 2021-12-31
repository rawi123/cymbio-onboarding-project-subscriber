import amqp from "amqplib";
import addToDB from "../mysql-connection/addToDB";

const consumer = (channel: amqp.Channel): void => {
    channel.consume("orders", async (message): Promise<any> => {
        try {
            const input = message ? JSON.parse(message.content.toString()) : "";

            if (messageIsEmpty(message))
                throw new Error("input is empty");

            await addToDB(input)
            deleteMessage(message,channel)
            console.log("added to DB")

        }

        catch (err: any) {

            if (err.message === "input is empty" || err.message === "didnt pass tests") {
                deleteMessage(message,channel);
                logError(err,"deleted - input might be empty or is not as excepted");
            }

            else {
                deleteMessage(message,channel);
                logError(err,"data base error might be a wrong query!");
            }

        }
    })
}


const messageIsEmpty=(message:any):Boolean=>{
    return (!message || !Object.keys(message).length);
}


const logError=(err:any,message:String):void=>{
    console.log(err.message)
    console.log(message)
}


const deleteMessage=(message:any,channel:amqp.Channel):void=>{
    if(message)
        channel.ack(message);
}


export default consumer;

//message ? (JSON.parse(message.content.toString())) : message,
// console.log(message ? (JSON.parse(message.content.toString())) : message)