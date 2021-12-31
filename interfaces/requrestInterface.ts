interface orderLine {
    id: Number,
    notes: String[],
    order_id: Number,
    quantity: Number,
    retailer_sku: String,
    billed_amount: Number,
    original_quantity: Number,
    unit_price: Number,
    tax_billed_amount: Number,
    variant_id: Number,
}

export default interface reqBody {
    type: String,
    retailer_order_id: Number,
    order_lines:orderLine[],
    shipping_paid: Number,
    shipping_method_code: String,
    retailer_id: Number,
    expired: Boolean,
    created_at: Date,
}
