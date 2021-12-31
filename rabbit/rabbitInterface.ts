import amqp from "amqplib";

export default interface rabbitObj{
    channelProp:amqp.Channel|null,
    resultsProp:any//there is no type for queue in amqplib @ types
}
