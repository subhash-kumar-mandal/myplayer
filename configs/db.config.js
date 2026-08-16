const mongoose = require('mongoose');
require('dotenv/config');



async function DBJoin(url) {
    try {

        const res = await mongoose.connect(process.env.DB_URL);
        console.log('conneted db')
    } catch (err) {
        console.log(err)
    }
}


module.exports = DBJoin;