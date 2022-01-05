import db from "./mysql";
import {reqBody, orderLine} from "../interfaces/requrestInterface";
import {didntPassTests} from "../rabbit/orderMessageConsumer";
import {checkRetailerExsit, checkVariantsForLines} from "./orderTests/orderTests";
import runQueryReturnRes from "./runSql/runSqlQuery";
import {runQueryThrowIfError} from "./runSql/runSqlQuery";
import runSqlQuery from "./runSql/runSqlQuery";

const addToDBThrowIfErr = async (message: reqBody): Promise<any> => {
    if (await runOrderTests(message)) {
        if (await insertToDb(message))
            return true;
    }
    throw new Error(didntPassTests);

}
const runOrderTests = async (message: reqBody): Promise<boolean> => {

    if (!await checkRetailerExsit(message) ||
        !await checkVariantsForLines(message)) {
        return false;
    }

    return true;
}


const insertToDb = async (message: reqBody): Promise<boolean> => {
    const orderNumber: number = await addOrder(message);
    await addOrderLines(message, orderNumber);
    return true;
}

const addOrder = async (message: reqBody): Promise<number> => {

    const sql: string = `
            INSERT INTO orders
            VALUES (DEFAULT, 
                    "${message.type}",
                    ${message.shipping_paid},
                    "${message.shipping_method_code}",
                    ${message.retailer_id},
                    ${message.expired},
                    DEFAULT);`

    const orderId: number = await runQueryReturnId(sql);
    console.log("order has been added!")
    return orderId;
}

const addOrderLines = async (message: reqBody, orderNumber: number): Promise<boolean> => {
    try {
        let allOrderLinesAdded: boolean = true;

        for (let i = 0; i < message.order_lines.length; i++) {
            const single_order_line = message.order_lines[i];
            const sql: string = `
            INSERT INTO order_lines
            VALUES (DEFAULT, 
                    "${JSON.stringify(single_order_line.notes)}", 
                    ${orderNumber},
                    ${single_order_line.quantity},
                    ${single_order_line.billed_amount},
                    ${single_order_line.unit_price},
                    ${single_order_line.tax_billed_amount},
                    ${single_order_line.variant_id});
            `

            await runQueryThrowIfError(sql,db)
        }

        console.log("all order lines has been added")
        return allOrderLinesAdded;
    } catch (err) {
        await deleteOrder(orderNumber);
        throw err;
    }
}

const deleteOrder = async (orderNumber: number) => {
    console.log(`deleting order number:${orderNumber} and order_lines due to fail in adding order line`);
    const sql: string = `DELETE FROM order_lines
                      WHERE order_id=${orderNumber};
                      DELETE FROM orders
                      WHERE order_id=${orderNumber};`;
    await runSqlQuery(sql,db);
}

export const runQueryCheckExists = async (sql: string): Promise<boolean> => {
    const sqlResponse=await runQueryReturnRes(sql,db);
    if(sqlResponse.length)
        return true
    return false;
}

const runQueryReturnId = async (sql: string): Promise<number> => {
    const sqlResponse=await runQueryReturnRes(sql,db);
    return sqlResponse.insertId;
}

export default addToDBThrowIfErr;
