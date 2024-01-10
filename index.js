let rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

let token = function(length = 2) {
    let out = ""
    for (let index = 0; index < length; index++) {
        out += rand()
    }
    return out
};

module.exports = {
    token,
    rand,
    models: require("./models"),
    monitor: require("./monitor_utils")
}