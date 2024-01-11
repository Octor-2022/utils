const mongoose = require('mongoose');

const commonSchemaOptions = { collation: { locale: 'en_US', strength: 1 } };

const statusPageHostsSchema = new mongoose.Schema({
    displayName: { type: String },
    host: { type: String },
    showIP: { type: Boolean },
    statusID: { type: String },
    groupID: { type: String },
    type: { type: Number }
}, { ...commonSchemaOptions, collection: "hosts" });

const statusPageHosts = mongoose.model('statusPageHosts', statusPageHosts);

const statusPageHostDataSchema = new mongoose.Schema({
    statusID: { type: String },
    date: { type: String },
    data: { type: Array }
}, { ...commonSchemaOptions, collection: "data" });

const statusPageHostData = mongoose.model('statusPageHostData', statusPageHostDataSchema);

// TODO: We might remove this
const statusUserSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String },
    token: { type: String },
    id: { type: String },
    statusIDs: { type: Array },
    groupIDs: { type: Array }
}, { ...commonSchemaOptions, collection: "users" });

const statusUser = mongoose.model('statusUser', statusUserSchema);

const statusIncidentsSchema = new mongoose.Schema({
    statusID: { type: String },
    incidentID: { type: String },
    date: { type: String },
    title: { type: String },
    description: { type: String },
    ETA: { type: String },
    reportedBy: { type: String }
}, { ...commonSchemaOptions, collection: "incidents" });

const statusIncidents = mongoose.model('statusIncidents', statusIncidentsSchema);

const statusGroupInfoSchema = new mongoose.Schema({
    groupID: { type: String },
    groupName: { type: String },
    channelID: { type: String },
    guildID: { type: String },
    messageID: { type: String },
    roleID: { type: String }
}, { ...commonSchemaOptions, collection: "gc-data" });

const statusGroupInfo = mongoose.model('statusGroupInfo', statusGroupInfoSchema);

async function login(uri) {
    return new Promise((resolve, reject) => {
        mongoose.connect(uri).then(() => {
            return resolve();
        }).catch((r) => {
            return reject(r);
        });
    });
}

const schemas = {
    statusPageHosts: statusPageHostsSchema,
    statusPageHostData: statusPageHostDataSchema,
    statusUser: statusUserSchema,
    statusIncidents: statusIncidentsSchema,
    statusGroupInfo: statusGroupInfoSchema,
};

module.exports = {
    mongoose,
    statusPageHosts,
    statusPageHostData,
    statusUser,
    statusIncidents,
    statusGroupInfo,
    login,
    schemas,
};
