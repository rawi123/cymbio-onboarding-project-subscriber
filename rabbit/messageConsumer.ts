import amqp from "amqplib";
import addToDBThrowIfErr from "../mysql-connection/addToDB";
import RabbitClass from "./rabbitSubscriber";


//await consumer(channel);


const addToDbConsumer = async (message: any,queue:RabbitClass): Promise<void> => {

    const  objectMessage= message ? JSON.parse(message.content.toString()) : "";

    try {
        if (messageIsEmpty(objectMessage))
            throw new Error("input is empty");

        if (objectMessage.retryCount >= 3)
            throw new Error("max retries reached");

        await addToDBThrowIfErr(objectMessage);
        //@ts-ignore
        deleteMessage(message, queue.channel);
        console.log("added to DB");

    } catch (err: any) {
        //@ts-ignore
        handelReject(err, message, queue);
    }
}

const handelReject = (err: any, message: any, queue: RabbitClass): void => {
    let messageUpdatedRetries = incrementMessageRetry(message);

    if (err.message === "input is empty") {
        logError(err, "message deleted - input is empty");

        //@ts-ignore
        deleteMessage(message, queue.channel);
        return;
    }

    if (err.message === "max retries reached") {
        logError(err, " message in queue for further investigation ");
        return
    }

    if (err.message === "didnt pass tests") {
        logError(err, "");
    } else {
        logError(err, "data base error might be a wrong query!");
    }

    //@ts-ignore
    deleteMessage(message, queue.channel);
    queue.reAddMessageToQueue(messageUpdatedRetries);
}




const incrementMessageRetry = (message: any): any => {
    let input = message !== null ? JSON.parse(message.content.toString()) : "";
    input.retryCount = input.retryCount + 1 || 1;
    return input;
}


const logError = (err: any, message: String): void => {
    console.log(err.message);
    console.log(message);
}


const deleteMessage = (message: any, channel: amqp.Channel): void => {
    if (message)
        channel.ack(message);
}

const messageIsEmpty = (message: any): boolean => {
    return (!message || !Object.keys(message).length);
}

export default addToDbConsumer;

