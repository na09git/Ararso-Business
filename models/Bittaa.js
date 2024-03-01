const mongoose = require('mongoose')

const BittaaSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
    },
    material: {
        type: String,
        default: 'Dinicha',
        enum: ['Dinicha', 'Karot', 'Kurumba', 'Qayasir', 'Shunkurtaa', 'Shukaar', 'Timaatim', 'Luqqaa', 'Joniya', 'Car Material', 'Building Material', 'Other'],
    },
    from_seller: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    dallaala: {
        type: String,
    },
    kilogram: {
        type: String,
    },
    birr: {
        type: String,
        required: true,
    },
    body: {
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Bittaa', BittaaSchema) 