const checkArrayWithLength:string="array-length";
const checkArrayOnly:string="array";
const reqTypes:string[]=["string",checkArrayWithLength,"number","string","number","boolean"];
const orderLineTypes:string[]=[checkArrayOnly,"number","number","number","number","number"];

const AisInstanceOfB = (message: any,typesArray:string[]): boolean => {
    return Object.keys(message).every((val,idx)=>{

        if(typesArray[idx]===checkArrayWithLength)
            return (Array.isArray(message[val])&&message[val].length);

        if(typesArray[idx]===checkArrayOnly)
            return Array.isArray(message[val]);

        return typeof message[val]===typesArray[idx]
    })
};

export const validOrderBody = (message: any): boolean => {

    if (AisInstanceOfB(message,reqTypes))
        return message.order_lines.every((val: any): boolean => AisInstanceOfB(val,orderLineTypes));

    return false;
};