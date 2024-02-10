const mongoose = require('mongoose')

const SellSchema = new mongoose.Schema({
    Seller: {
        type: String,
        required: true,
    },
    BuyerName: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
    },
    kilogram: {
        type: String,
    },
    Amount: {
        type: String,
        required: true,
    },
    Note: {
        type: String,
    },
    imageBase64: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Paid',
        enum: ['Paid', 'Not-Paid'],
    },
    imageBase64: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    Car_Id: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Sell', SellSchema)
