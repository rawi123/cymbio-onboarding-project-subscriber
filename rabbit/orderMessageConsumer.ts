import amqp from "amqplib";
import addToDBThrowIfErr from "../mysql-connection/addToDB";
import RabbitClass from "./rabbitSubscriber";
import {reqBody} from "../interfaces/requrestInterface";
import {validOrderBody} from "../interfaces/reqInterfaceTest/requestInterfaceTest";

export const invalidInputErr: string = "input is invalid";
export const maxRetriesReached: string = "max retries reached";
export const didntPassTests: string = "didnt pass tests";

const addToDbConsumer = async (message: amqp.Message|null, queue: RabbitClass): Promise<void> => {

    const objectMessage: reqBody = message ? JSON.parse(message.content.toString()) : "";

    try {
        if (messageIsInvalid(objectMessage)) {
            throw new Error(invalidInputErr);
        }

        if (objectMessage.retryCount && objectMessage.retryCount >= 3)
            throw new Error(maxRetriesReached);

        await addToDBThrowIfErr(objectMessage);
        //@ts-ignore
        deleteMessage(message, queue.channel);
        console.log("added to DB");

    } catch (err: any) {
        //@ts-ignore
        await handelReject(err, message, queue);
    }
}

const handelReject = async (err: any, message: amqp.Message|null, queue: RabbitClass): Promise<void> => {

    if (err.message === invalidInputErr) {
        logError(err, "message deleted - input is invalid");
        //@ts-ignore
        deleteMessage(message, queue.channel);
        return;
    }
    //@ts-ignore can't be null- null is handled in the case above
    let messageUpdatedRetries = incrementMessageRetry(message);


    if (err.message === maxRetriesReached) {
        logError(err, " message in queue for further investigation ");
        return
    }

    if (err.message === didntPassTests) {
        logError(err, "");
    } else {
        logError(err, "data base error might be a wrong query!");
    }

    //@ts-ignore
    deleteMessage(message, queue.channel);
    await queue.reAddMessageToQueue(messageUpdatedRetries);
}


const incrementMessageRetry = (message: amqp.Message): any => {
    let input = message !== null ? JSON.parse(message.content.toString()) : "";
    input.retryCount = input.retryCount + 1 || 1;
    return input;
}


const logError = (err: any, message: String): void => {
    console.log(err.message);
    console.log(message);
}


const deleteMessage = (message: amqp.Message|null, channel: amqp.Channel): void => {
    if (message)
        channel.ack(message);
}

const messageIsInvalid = (message: any): boolean => {
    return (!message || !Object.keys(message).length || !validOrderBody(message));
}

export default addToDbConsumer;

