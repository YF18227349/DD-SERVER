const express = require("express");
const app = express();
var path = require("path")
const MongodbClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const dbUrl = "mongodb://localhost:27017/";
app.use('/upload',express.static(path.resolve(__dirname,"upload")))

app.get("/books",function(req,res){
    MongodbClient.connect(dbUrl,{ useUnifiedTopology: true },function(err,client){
        const collection=client.db("DD").collection("books");
        collection.find({}).toArray(function(err,result){
            result.forEach((item)=>{
                item.image = 'http://localhost:3010/'+item.image.replace(/\\/g,'/')
            })
            res.writeHead(200,{'Content-Type':'application/json'});
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})
app.get("/classify",function(req,res){
    MongodbClient.connect(dbUrl,{ useUnifiedTopology: true },function(err,client){
        const collection=client.db("DD").collection("classify");
        collection.find({}).toArray(function(err,result){
            result.forEach((item)=>{
                item.image = 'http://localhost:3010/'+item.image.replace(/\\/g,'/')
            })
            res.writeHead(200,{'Content-Type':'application/json'});
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})

app.listen(3010,()=>{
    console.log("接口已启动 @127.0.0.1:3010");
})