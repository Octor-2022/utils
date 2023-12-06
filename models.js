const mongoose = require('mongoose');

const statusPageHosts = mongoose.model('statusPageHosts', new mongoose.Schema({
    statusID: { type: String, },
    statusName: { type: String },
    groupID: { type: String },
    host: { type: String },
    displayName: { type: String },
    userID: { type: String },
    // showIP: { type: Boolean },
}, {collation: { locale: 'en_US', strength: 1 }, collection: "hosts"}));

const statusPageHostData = mongoose.model('statusPageHostData', new mongoose.Schema({
    statusID: { type: String, },
    groupID: { type: String },
    date: { type: String },
    data: { type: Array }
}, {collation: { locale: 'en_US', strength: 1 }, collection: "data"}));

// TODO: We might remove this
const statusUser = mongoose.model('statusUser', new mongoose.Schema({
    username: { type: String, },
    password: { type: String },
    token: { type: String },
    id: { type: String },
    statusIDs: { type: Array },
    groupIDs: { type: Array }
}, {collation: { locale: 'en_US', strength: 1 }, collection: "users"}));

const statusIncidents = mongoose.model('statusIncidents', new mongoose.Schema({
    statusID: { type: String, },
    groupID: { type: String },
    incidentID: { type: String },
    date: { type: String },
    title: { type: String, },
    description: { type: String },
    ETA: { type: String },
    reportedBy: { type: String }
}, {collation: { locale: 'en_US', strength: 1 }, collection: "incidents"}));

const statusGroupInfo = mongoose.model('statusGroupInfo', new mongoose.Schema({
    statusIDs: { type: Array, },
    groupID: { type: String },
    groupName: { type: String },
    channelID: { type: String },
    guildID: { type: String },
    messageID: { type: String }
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
    statusPageHostData,
    statusUser,
    statusIncidents,
    statusGroupInfo,
    login
}