import db from "./mysql";
import messageConsumer from "../rabbit/messageConsumer";


const addToDB = async (message: any): Promise<any> => {
    if (await runTests(message)) {
        return true;
    }

    throw new Error("didnt pass tests");

}

const runTests = async (message: any): Promise<Boolean> => {

    if (!await checkRetailerExsit(message) ||
        !await checkVariantsForLines(message)) {
        return false;
    }

    if (!await insertToDb(message)) {
        return false;
    }

    return true;

}


const checkRetailerExsit = async (message: any): Promise<Boolean> => {

    try {
        let sql = `
        SELECT * FROM retailers
        WHERE retailer_id=${message.retailer_id}
        `;

        const retailerExist = await runQueryCheckExists(sql);
        if (!retailerExist) {
            console.log("failed test retailer does not exist")
        }
        return retailerExist;

    } catch (err) {
        throw(err);
    }

}


const checkVariantsForLines = async (message: any): Promise<Boolean> => {
    try {
        if (!message.order_lines || !message.order_lines.length)
            return false;

        let allVariantExists = true;

        for (let i = 0; i < message.order_lines.length; i++) {

            const sql = `
                SELECT * FROM variants
                WHERE variant_id=${message.order_lines[i].variant_id};
                `

            if (!await runQueryCheckExists(sql)) {
                allVariantExists = false;
                i = message.order_lines.length
                console.log("variant does not exist")
            }
        }
        return allVariantExists;


    } catch (err) {
        throw(err);
    }
}


const insertToDb = async (message: any): Promise<Boolean> => {
    const orderNumber: Number = await addOrder(message);
    await addOrderLines(message, orderNumber);
    return true;

}

const addOrder = async (message: any): Promise<Number> => {

    const sql = `
            INSERT INTO orders
            VALUES (DEFAULT, 
                    "${message.type}",
                    ${message.shipping_paid},
                    "${message.shipping_method_code}",
                    ${message.retailer_id},
                    ${message.expired},
                    DEFAULT);
            `
    const orderId = await insertSingleDb(sql);
    console.log("order has been added!")
    return orderId;

}

const addOrderLines = async (message: any, orderNumber: Number): Promise<Boolean> => {
    let allOrderLinesAdded = true;

    for (let i = 0; i < message.order_lines.length; i++) {
        const single_order_line = message.order_lines[i];
        const sql = `
            INSERT INTO order_lines
            VALUES (DEFAULT, 
                    "${JSON.stringify(single_order_line.notes)}", 
                    ${orderNumber},
                    ${single_order_line.quantity},
                    ${single_order_line.billed_amount},
                    ${single_order_line.unit_price},
                    ${single_order_line.tax_billed_amount},
                    ${single_order_line.variant_id},
                    "${single_order_line.retailer_sku}");
            `
        if (!await insertSingleDb(sql)) {
            allOrderLinesAdded = false
            console.log("failed in adding order line")
        }
    }

    console.log("all order lines has been added")
    return allOrderLinesAdded;
}

const runQueryCheckExists = async (sql: any) => {
    const query = new Promise<Boolean>((resolve, reject) => {
        db.query(sql, (err, res) => {

            if (err)
                return reject(err);

            if (!res.length)
                resolve(false);

            resolve(true);
        })
    })
    return await query;
}

const insertSingleDb = async (sql: any) => {

    const query = new Promise<any>((resolve, reject) => {
        db.query(sql, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        })
    })

    return (await query).insertId;
}

export default addToDB;
