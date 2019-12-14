const express = require("express");
const app = express();
var path = require("path")
const MongodbClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const dbUrl = "mongodb://localhost:27017/";
app.use('/upload',express.static(path.resolve(__dirname,"upload")))

//商品列表获取-全部
app.get("/books",function(req,res){
    MongodbClient.connect(dbUrl,{ useUnifiedTopology: true },function(err,client){
        const collection=client.db("DD").collection("books");
        collection.find({}).sort({ updateTime:-1 }).toArray(function(err,result){
            result.forEach((item)=>{
                item.image = 'http://localhost:3010/'+((item.image).replace(/\\/g,'/'))
                console.log(item.image)
            })
            res.writeHead(200,{'Content-Type':'application/json'});
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})

//商品分类获取-全部
app.get("/classify",function(req,res){
    MongodbClient.connect(dbUrl,{ useUnifiedTopology: true },function(err,client){
        const collection=client.db("DD").collection("classify");
        collection.find({}).sort({ updateTime:-1 }).toArray(function(err,result){
            result.forEach((item)=>{
                item.image = 'http://localhost:3010/'+((item.image).replace(/\\/g,'/'))
                console.log(item.image)
            })
            res.writeHead(200,{'Content-Type':'application/json'});
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})

//商品详情获取-一条
app.get("/particulars",function(req,res){
    let _id = req.query.id;
    MongodbClient.connect(dbUrl,{ useUnifiedTopology: true },function(err,client){
        const collection=client.db("DD").collection("books");
        collection.find(ObjectId(_id)).toArray(function(err,result){
            console.log(result)
            result.forEach((item)=>{
                item.image = 'http://localhost:3010/'+((item.image).replace(/\\/g,'/'))
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