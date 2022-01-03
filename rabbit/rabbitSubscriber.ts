import amqp from "amqplib";
import reqBody from "../interfaces/requrestInterface";



class RabbitClass {
    channelName: string;
    channel: amqp.Channel | null = null;
    consumingFunction:Function;

    constructor(channel: string,consumingFunction:Function) {
        this.channelName = channel;
        this.consumingFunction=consumingFunction;
    }

    async initializeQueue() {
        const rabbitRes: amqp.Channel | null = await this.connectChannel();
        this.channel = rabbitRes;
        console.log(this.channel ? `connected to rabbitmq, queue: ${this.channelName}` : "ERROR COULD NOT CONNECT TO RABBITMQ");
    }

    getChannel(): amqp.Channel | null {
        return this.channel;
    }

    resetChannel():void{
        this.channel=null;
    }

    async consumeMessages(): Promise<void> {
        try {
            if(!this.channel) throw ("channel is null");

            await this.channel.consume(this.channelName, async (message:amqp.Message|null): Promise<any> => {
                if(!this.channel)
                    throw new Error("Channel is null");

                await this.consumingFunction(message,this);
            });
        }
        catch(err){
            console.log(err);
        }
    }

    async reAddMessageToQueue (message: reqBody):Promise<void>  {
        if (message.retryCount===undefined || message.retryCount <= 3) {
            await waitForMS(3000);
            const messageBuffedWithRetry = Buffer.from(JSON.stringify(message));
            this.channel?.sendToQueue("orders", messageBuffedWithRetry);
            console.log("message added to queue ,retry number: ", message.retryCount);
        }
    }

    async connectChannel(retries: number = 0): Promise<amqp.Channel | null> {
        try {
            const connection: amqp.Connection = await amqp.connect("amqp://localhost");
            const channel: amqp.Channel = await connection.createChannel();
            await channel.assertQueue(this.channelName);
            return channel;

        } catch (err) {
            console.log(err);
            if (retries <= 3) {
                await waitForMS(1000);
                return await this.connectChannel(retries + 1);
            }
            return null;
        }
    }

    async connectRabbit(): Promise<boolean> {
        try {
            await this.initializeQueue();
            await this.consumeMessages();
            return true;

        } catch (err) {
            return false;
        }
    }


}


const waitForMS = async (number: number): Promise<Boolean> => {

    const prom = new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, number);
    })

    await prom;
    return true;
}


export default RabbitClass;
