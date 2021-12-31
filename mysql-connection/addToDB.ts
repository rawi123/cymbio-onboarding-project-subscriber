import db from "./mysql";


const addToDBThrowIfErr = async (message: any): Promise<any> => {
    if (await runTests(message)) {
        return true;
    }

    throw new Error("didnt pass tests");

}

const runTests = async (message: any): Promise<boolean> => {

    if (!await checkRetailerExsit(message) ||
        !await checkVariantsForLines(message) ||
        !await insertToDb(message)) {
        return false;
    }

    return true;
}

const checkRetailerExsit = async (message: any): Promise<boolean> => {

    try {
        let sql: string = `SELECT * FROM retailers
                   WHERE retailer_id=${message.retailer_id}`;

        const retailerExist: boolean = await runQueryCheckExists(sql);
        if (!retailerExist) {
            console.log("failed test retailer does not exist")
        }
        return retailerExist;

    } catch (err) {
        throw(err);
    }
}

const checkVariantsForLines = async (message: any): Promise<boolean> => {
    try {
        if (!message.order_lines || !message.order_lines.length)
            return false;

        let allVariantExists: boolean = true;

        for (let i = 0; i < message.order_lines.length; i++) {

            const sql: string = `SELECT * FROM variants
                         WHERE variant_id=${message.order_lines[i].variant_id};`

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

const insertToDb = async (message: any): Promise<boolean> => {
    const orderNumber: number = await addOrder(message);
    await addOrderLines(message, orderNumber);
    return true;
}

const addOrder = async (message: any): Promise<number> => {

    const sql:string = `
            INSERT INTO orders
            VALUES (DEFAULT, 
                    "${message.type}",
                    ${message.shipping_paid},
                    "${message.shipping_method_code}",
                    ${message.retailer_id},
                    ${message.expired},
                    DEFAULT);`

    const orderId:number = await insertSingleDb(sql);
    console.log("order has been added!")
    return orderId;

}

const addOrderLines = async (message: any, orderNumber: number): Promise<boolean> => {
    let allOrderLinesAdded:boolean = true;

    for (let i = 0; i < message.order_lines.length; i++) {
        const single_order_line = message.order_lines[i];
        const sql:string = `
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

const runQueryCheckExists = async (sql: string): Promise<boolean> => {
    const query = new Promise<boolean>((resolve, reject) => {
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

const insertSingleDb = async (sql: any):Promise<number> => {

    const query = new Promise<any>((resolve, reject) => {
        db.query(sql, (err, res) => {
            if (err)
                reject(err);
            else
                resolve(res);
        })
    })

    return (await query).insertId;
}

export default addToDBThrowIfErr;
