import db from "../mysql";
import runQueryReturnRes from "../runSql/runSqlQuery";

export const getOrdersAndLines = async ():Promise<void> => {//interface
    const getAllDataSQL:string=`SELECT *
                FROM orders o
                JOIN retailers r
                USING (retailer_id)
                JOIN order_lines ol
                USING (order_id)
                JOIN variants v
                USING (variant_id); `

    return await runQueryReturnRes(getAllDataSQL,db);
}

