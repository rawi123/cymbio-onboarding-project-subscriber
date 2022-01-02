import amqp from "amqplib";



class RabbitClass {
    channelName: string;
    channel: amqp.Channel | null = null;


    constructor(channel: string) {
        this.channelName = channel;
    }

    async initializeQueue() {
        const rabbitRes: amqp.Channel | null = await this.connect();
        this.channel = rabbitRes;
        console.log(this.channel ? `connecteds to rabbitmq, queue: ${this.channelName}` : "ERROR COULD NOT CONNECT TO RABBITMQ");
    }

    getChannel(): amqp.Channel | null {
        return this.channel;
    }

    async consumeMessages(callBack: Function): Promise<void> {

        try {
            if(!this.channel) throw ("channel is null");

            await this.channel.consume("orders", async (message): Promise<any> => {
                if(!this.channel)
                    throw new Error("Channel is null");

                await callBack(message,this);
            });
        }
        catch(err){
            console.log(err);
        }
    }

    async reAddMessageToQueue (message: any)  {
        if (message.retryCount <= 3) {
            await waitForMS(3000);
            const messageBuffedWithRetry = Buffer.from(JSON.stringify(message));
            this.channel?.sendToQueue("orders", messageBuffedWithRetry);
            console.log("message added to queue ,retry number: ", message.retryCount);
        }
    }


    async connect(retries: number = 0): Promise<amqp.Channel | null> {
        try {
            const connection: amqp.Connection = await amqp.connect("amqp://localhost");
            const channel: amqp.Channel = await connection.createChannel();
            await channel.assertQueue(this.channelName);
            return channel;

        } catch (err) {
            console.log(err);
            if (retries <= 3) {
                await waitForMS(4000);
                return await this.connect(retries + 1);
            }
            return null;
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
