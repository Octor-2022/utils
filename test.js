const utils = require("./index")
utils.monitor.pingIP("192.168.4.100").then((e)=>{
    console.log(e)
})