const { default: mongoose } = require("mongoose");





const userHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true
    },
    playAt: {
        type: Date,
        default: Date.now()
    },
    playCount:{
        type:Number,
        default:0
    }
},{timestamps:true})


const HistorySchema = mongoose.model('history',userHistorySchema);

module.exports = HistorySchema