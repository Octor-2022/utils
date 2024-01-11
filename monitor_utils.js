const http = require("http")
const https = require("https")
const urlMod = require("url")

const { exec } = require('child_process');
const os = require('os');

const { statusPageHosts, statusGroupInfo, statusPageHostData } = require("./models").schemas

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
            const response = await pingHost(ip);
            console.log(response)
            resolve(response) // TODO: Return the time
        } catch (e) {
            console.log(e)
            resolve(false)
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

    array.forEach(function (item, index) {
        total += item;
        count++;
    });

    return total / count;
}

function pingHost(ipAddress) {
    return new Promise((resolve, reject) => {
        let pingCommand = '';

        // Determine the appropriate ping command based on the operating system
        if (os.platform() === 'win32') {
            pingCommand = `ping -n 3 ${ipAddress}`; // Ping 3 times on Windows
        } else {
            pingCommand = `ping -c 3 ${ipAddress}`; // Ping 3 times on Linux
        }

        exec(pingCommand, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error: ${error.message}`));
                return;
            }

            if (stderr) {
                reject(new Error(`stderr: ${stderr}`));
                return;
            }

            const isAlive = os.platform() === 'win32'
                ? stdout.includes('Received = 3') // Check for Windows
                : stdout.includes('3 packets transmitted, 3 received'); // Check for Linux

            resolve(isAlive);
        });
    });
}

async function calculateUptime(reports) {
    if (!reports) return null;
    let out = []
    for (let reportData of reports) {
        if (reportData?.ok) out.push(100); else out.push(0);
    }
    if (!out || out.length == 0) {
        return null;
    } else {
        return out.reduce((a, v) => a + v) / out.length;
    }
}

function generateUptimeGraph(statusData) {
    console.log("statusData", statusData)
    const totalSquares = 10;
    const filledSquare = "🟩";
    const emptySquare = "🟥";
    const noDataSquare = "⬛";
    const errorSquare = "🟨"

    // Reverse the array without modifying the original
    const reversedStatusData = [...statusData].reverse();

    // Take the last 'totalSquares' entries or all if there are fewer
    const lastEntries = reversedStatusData.slice(0, totalSquares);

    let toSend = "";

    for (let index = 0; index < totalSquares; index++) {
        const entry = lastEntries[index];

        if (entry) {
            // If there is data for this index
            if (entry.ok === true) toSend = filledSquare + toSend;
            else if (!entry.ok) toSend = emptySquare + toSend;
            else if (entry.ok == "?") toSend = errorSquare + toSend;
            else toSend = noDataSquare + toSend
            // toSend = (entry.ok ? filledSquare : emptySquare) + toSend;
        } else {
            // If there is no data for this index
            toSend = noDataSquare + toSend;
        }
    }

    return toSend;
}

async function currentTimeData() {
    let today = new Date()
    let dateString = today.toLocaleDateString("en-US")
    let e = today.getMinutes().toString().padStart(2, "0")
    let time = `${today.getHours()}:${e}`
    return { dateString, time }
}

async function getLastDown(statusData) {
    let lastDown = "Error"
    let statusCopy = [...statusData]
    while (true) {
        let data = statusCopy.pop()
        if (data == null) { // We have gotten to the end of the status
            lastDown = "Never"
            break
        }

        if (!data?.ok && data?.time) { // Check if the status ISN'T ok and that we have a time
            let splited = data.time.split(":")
            if (splited.length == 2) { // Checks that we have the require time info (hour, minute)
                let downDate = new Date()
                downDate.setHours(splited[0], splited[1])
                lastDown = `<t:${(downDate.valueOf() / 1000).toFixed(0)}:f>`
                break // Leave as this was the first occurrence of a downtime
            } else {
                lastDown = "Error2"
            }
        }
    }
    return lastDown
}

function findMinMaxTime(inputData) {
    // Extract all times from inputData
    const allTimes = Object.values(inputData).flatMap(obj => obj.data.map(item => item.time));

    // Find the biggest and lowest time in allTimes
    return {
        biggestTime: allTimes.reduce((max, time) => (time > max ? time : max), "00:00"),
        lowestTime: allTimes.reduce((min, time) => (time < min ? time : min), "23:59")
    }

}

/**
* 
* @param {Object<string, statusPageHostData>} statusDatas 
*/
async function padData(statusDatas, _endTime = null) {
    let { biggestTime, lowestTime } = await findMinMaxTime(statusDatas)

    // console.log(biggestTime, lowestTime)

    let lowest = lowestTime.split(":")
    let [startHour, startMinute] = lowest

    let biggest = _endTime?.split(":") ?? biggestTime.split(":")
    let [endHour, endMinute] = biggest

    Object.values(statusDatas).forEach((v) => {
        /**
         * @type {Array}
         */
        let added = v?.data
        if (!added) return

        let toAdd = []

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = startMinute; minute <= endMinute; minute++) {
                let time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (!added.some((v) => v.time === time)) {
                    toAdd.push({ ok: "?", time, latency: "?" });
                }
            }
        }

        added.push(...toAdd)
        added.sort((a, b) => a.time.localeCompare(b.time))

        console.log(added)
    })
    return statusDatas
}

/**
 * 
 * @param {Client} client 
 * @param {*} guildID 
 * @param {*} channelID 
 * @param {*} messageID 
 */
async function findMessage(client, guildID, channelID, messageID) {

    let toSend = { guild: null, channel: null, message: null }

    try {
        if (guildID) toSend.guild = client.guilds.cache.get(guildID) || await client.guilds.fetch(guildID)
        if (!toSend.guild) return toSend

        if (channelID) toSend.channel = toSend.guild.channels.cache.get(channelID) || await toSend.guild.channels.fetch(channelID);
        if (!toSend.channel) return toSend

        if (messageID) toSend.message = toSend.channel.messages.cache.get(messageID) || await toSend.channel.messages.fetch(messageID)

        return toSend
    } catch (e) {
        return toSend
    }
}

module.exports = {
    ipandPort,
    createID,
    pingIP,
    getURLInfo,
    calculateAverage,
    pingHost,
    calculateUptime,
    generateUptimeGraph,
    currentTimeData,
    getLastDown,
    findMinMaxTime,
    padData,
    findMessage
}