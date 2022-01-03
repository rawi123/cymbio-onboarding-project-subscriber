export interface orderLine {
    notes: string[] | string,
    quantity: number,
    billed_amount: number,
    unit_price: number,
    tax_billed_amount: number,
    variant_id: number,
}

export interface reqBody {
    type: string,
    retailer_order_id: number,
    order_lines: orderLine[],
    shipping_paid: number,
    shipping_method_code: string,
    retailer_id: number,
    expired: boolean,
    retryCount?: number,
}

const instanceofReqBody = (message: any): boolean => {
    if ("type" in message &&
        "retailer_order_id" in message &&
        "order_lines" in message &&
        "shipping_paid" in message &&
        "shipping_method_code" in message &&
        "retailer_id" in message &&
        "expired" in message &&
        message.order_lines.length)
        return true;
    return false
}

const instanceOfOrderLine = (orderLine: any): boolean => {

    if ("notes" in orderLine &&
        "quantity" in orderLine &&
        "billed_amount" in orderLine &&
        "unit_price" in orderLine &&
        "tax_billed_amount" in orderLine &&
        "variant_id" in orderLine)
        return true;
    return false;
}

export const validOrderBody = (message: any): boolean => {
    if (instanceofReqBody(message)) {
        return message.order_lines.every((val: any): boolean => instanceOfOrderLine(val));
    }
    return false;
}