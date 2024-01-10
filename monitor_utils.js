const http = require("http")
const https = require("https")
const ping = require("pingman")
const urlMod = require("url")

/**
 * @typedef {Object} ipAndPortReturn
 * @property {Response} [ipAndPortReturn.response]
 * @property {Object} [ipandPort.responseData]
 */

/**
 * 
 * @param {String} url
 * @returns {Promise<ipAndPortReturn>}
 */
async function ipandPort(url) {
    return new Promise((resolve, reject) => {

        let toUse = http
        if (url.startsWith("https")) toUse = https

        let urlOpt = urlMod.parse(url)
        // console.log("URLData", urlOpt)
        let opt = {
            hostname: urlOpt.hostname,
            port: urlOpt.port,
            timeout: 5000,
            headers: {
                "user-agent": "OctorCloud/1.0.0 Uptime Monitor Service"
            }
        }

        let req = toUse.get(opt, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ responseData: data, response: res })
            })

            res.on("error", (error) => {
                reject(error)
            })
        })

        req.on('error', (error) => {
            reject(error)
        });

        req.end();
    })
}

async function pingIP(ip) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await ping(ip);
            resolve(response.alive) // TODO: Return the time
        } catch (e) {
        }
    })
}

function createID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }

    return code;
}

async function getURLInfo(host, noSSL) {
    let urlRaw = host.split(":")
    let ssl = urlRaw.shift()
    let url = null
    if (ssl.toLocaleLowerCase().includes("http")) {
        let urlHelp = urlRaw.shift().split("")
        while (urlHelp[0] == "/") urlHelp.shift() // remove //
        url = urlHelp.join("")
    } else {
        url = ssl
        ssl = "http"
    }
    let port = urlRaw.join(":") // Maybe they got some goofy URL, we are gonna respect that.

    let wholeURL = null
    if (noSSL) {
        wholeURL = url;
        ssl = ""
    } else wholeURL = `${ssl}://${url}`;

    let withOutPort = wholeURL
    if (port) wholeURL += `:${port}`

    return {
        ssl,
        port,
        url,
        wholeURL,
        wholeURLWithOutPort: withOutPort
    }
}

function calculateAverage(array) {
    let total = 0;
    let count = 0;

    array.forEach(function(item, index) {
        total += item;
        count++;
    });

    return total / count;
}

module.exports = {
    ipandPort,
    createID,
    pingIP,
    getURLInfo,
    calculateAverage
}