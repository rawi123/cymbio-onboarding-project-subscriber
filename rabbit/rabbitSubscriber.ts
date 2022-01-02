import amqp from "amqplib";
import consumer from "./messageConsumer";


class RabbitClass {
    channelName: string;
    channel: amqp.Channel | null = null;


    constructor(channel: string) {
        this.channelName = channel;
    }

    async initializeQueue() {
        const rabbitRes: amqp.Channel | null = await this.connect();
        this.channel = rabbitRes;
        console.log(this.channel ? `connected to rabbitmq, ${this.channelName}` : "ERROR COULD NOT CONNECT TO RABBITMQ");
    }

    getChannel(): amqp.Channel | null {
        return this.channel;
    }



    //await consumer(channel);
     async connect (retries: number = 0): Promise<amqp.Channel | null>{
        try {
            const connection: amqp.Connection = await amqp.connect("amqp://localhost");
            const channel: amqp.Channel = await connection.createChannel();
            await channel.assertQueue(this.channelName);
            console.log("Connected to rabbit my");
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
