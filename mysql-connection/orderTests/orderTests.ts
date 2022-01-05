import {reqBody} from "../../interfaces/requrestInterface";
import {runQueryCheckExists} from "../addToDB";

export const checkRetailerExsit = async (message: reqBody): Promise<boolean> => {

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

export const checkVariantsForLines = async (message: reqBody): Promise<boolean> => {
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