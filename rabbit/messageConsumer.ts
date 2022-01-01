import amqp from "amqplib";
import addToDBThrowIfErr from "../mysql-connection/addToDB";

const consumer = async (channel: amqp.Channel): Promise<any> => {
    await channel.consume("orders", async (message): Promise<any> => {
        try {
            const input = message ? JSON.parse(message.content.toString()) : "";

            if (messageIsEmpty(message))
                throw new Error("input is empty");

            if (input.retryCount >= 3)
                throw new Error("max retries reached");

            await addToDBThrowIfErr(input);
            deleteMessage(message, channel);
            console.log("added to DB");

        } catch (err: any) {
            handelReject(err,message,channel);

        }
    })
}

const handelReject=(err:any,message:any,channel:amqp.Channel):void=>{
    let messageUpdateRetries = incrementMessageRetry(message);

    if (err.message === "input is empty") {
        logError(err, "message deleted - input is empty");
        deleteMessage(message, channel);
        return;
    }

    if (err.message === "max retries reached") {
        logError(err, " message in queue for further investigation ");
        return
    }

    if (err.message === "didnt pass tests") {
        logError(err, "");
    }

    else {
        logError(err, "data base error might be a wrong query!");
    }


    deleteMessage(message, channel);
    addMessageToQueue(messageUpdateRetries,channel);
}

const addMessageToQueue=(message:any,channel:amqp.Channel)=>{

    if (message.retryCount <= 3) {
        const messageBuffedWithRetry=Buffer.from(JSON.stringify(message));
        channel.sendToQueue("orders", messageBuffedWithRetry);
        console.log("message added to queue ,retry number: ",message.retryCount );
    }
}

const messageIsEmpty = (message: any): boolean => {
    return (!message || !Object.keys(message).length);
}

const incrementMessageRetry = (message: any): any => {
    let input=message!==null?JSON.parse(message.content.toString()):"";
    input.retryCount = input.retryCount + 1 || 1;
    return input;
}

const logError = (err: any, message: String): void => {
    console.log(err.message)
    console.log(message)
}


const deleteMessage = (message: any, channel: amqp.Channel): void => {
    if (message)
        channel.ack(message);
}


export default consumer;

