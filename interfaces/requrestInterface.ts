interface orderLine {
    notes: string[]|string,
    quantity: number,
    billed_amount: number,
    unit_price: number,
    tax_billed_amount: number,
    variant_id: number,
}

export default interface reqBody {
    type: string,
    retailer_order_id: number,
    order_lines:orderLine[],
    shipping_paid: number,
    shipping_method_code: string,
    retailer_id: number,
    expired: boolean,
    retryCount?: number,
}
