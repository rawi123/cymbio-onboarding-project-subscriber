interface orderLine {
    id: number,
    notes: string[],
    order_id: number,
    quantity: number,
    retailer_sku: string,
    billed_amount: number,
    original_quantity: number,
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
    created_at: Date,
}
