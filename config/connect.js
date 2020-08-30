exports.connect = (url,callback)=>{
    var MongoClient = require("mongodb").MongoClient

    MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true },(err,client)=>{
        if(err){
            return;
        }
        var db = client.db("YF")
        callback(1,db,client)
    })
}

