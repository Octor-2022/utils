const mongoose = require('mongoose');

const statusPageHosts = mongoose.model('statusPageHosts', new mongoose.Schema({
    statusID: { type: String, },
    statusName: { type: String },
    hostUID: { type: String },
    host: { type: String },
    displayName: { type: String },
    group: { type: String },
    userID: { type: String }
}, {collation: { locale: 'en_US', strength: 1 }, collection: "hosts"}));


const statusPageHostInfo = mongoose.model('statusPageHostInfo', new mongoose.Schema({
    statusID: { type: String, },
    hostUID: { type: String },
    date: { type: String },
    data: { type: Array }
}, {collation: { locale: 'en_US', strength: 1 }, collection: "data"}));

const statusUser = mongoose.model('statusUser', new mongoose.Schema({
    username: { type: String, },
    password: { type: String },
    token: { type: String },
    id: { type: String },
    statusIDs: { type: Array }
}, {collation: { locale: 'en_US', strength: 1 }, collection: "users"}));

const statusIncidents = mongoose.model('statusIncidents', new mongoose.Schema({
    statusID: { type: String, },
    hostUID: { type: String },
    incidentID: { type: String },
    date: { type: String },
    title: { type: String, },
    description: { type: String },
    ETA: { type: String },
    reportedBy: { type: String }
}, {collation: { locale: 'en_US', strength: 1 }, collection: "incidents"}));

async function login(uri) {
    return new Promise((resolve, reject) => {
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            return resolve()
        }).catch((r)=>{
            return reject(r)
        })
    })
}

module.exports = {
    mongoose,
    statusPageHosts,
    statusPageHostInfo,
    statusUser,
    statusIncidents,
    login
}