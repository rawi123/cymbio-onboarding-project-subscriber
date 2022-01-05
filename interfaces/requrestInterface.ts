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
    order_lines: orderLine[],
    shipping_paid: number,
    shipping_method_code: string,
    retailer_id: number,
    expired: boolean,
    retryCount?: number,
}

