const utils = require("./index")
utils.monitor.pingIP("1.1.1.1").then((e)=>{
    console.log(e)
})