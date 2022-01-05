
import mysql from "mysql";
//Array<{rows: IUser}
const runQueryReturnRes = async (sql: string,dataBase:mysql.Connection): Promise<any> => {
    const query = new Promise<boolean>((resolve, reject) => {
        dataBase.query(sql, (err, res) => {

            if (err)
                return reject(err);

            resolve(res);
        })
    })
    return await query;
}

export const runQueryThrowIfError = async (sql: string,dataBase:mysql.Connection): Promise<void> => {
    const query = new Promise<void>((resolve, reject) => {
        dataBase.query(sql, (err, res) => {
            if (err)
                reject(err);
            resolve();
        })
    })
    await query;
}

export default runQueryReturnRes;