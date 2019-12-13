var express = require("express")
var Mongodb = require("../config/connect")
var mongo = require("mongodb")
var mongoClient = mongo.MongoClient;
var formidable = require("formidable")
var multiparty = require("multiparty")
var bodyParser = require("body-parser")
var path = require("path")
var fs = require("fs")
var time = require("time-stamp")
let router = express.Router()
var urlencodedParser = bodyParser.urlencoded({ extended: false})
var url = "mongodb://localhost:27017"

// 未登录情况下禁止进入:首页 修改页
router.use((req, res, next) => {
    if (req.session.username) {
        res.locals.session = req.session.username;
        next();
    } else {
        if (req.url == "/" || req.url == "/edit" || req.url == "/add" || req.url == "/classify" || req.url == "/editclassify" || req.url == "/addclassify") {
            res.render("wait", { wait: 1, content: "请登录！", href: "/login" })
        } else {
            res.locals.session = req.session.username
            return next()
        }
    }
})

// router.get("/",(req,res)=>{
//     Mongodb.connect(url,(flag,db,client)=>{
//         var result = db.collection("books").find().sort({ updateTime:-1 })
//         result.toArray((err,result)=>{
//            let admin = req.session.username
//            res.render("index",{result,admin})
//         })
//     })
// })
router.get("/",(req,res)=>{
    Mongodb.connect(url,(flag,db,client)=>{
        var resu = db.collection("books").find().sort({ updateTime:-1 })
        resu.count((err,count)=>{
            var show = 5;
            var page = 1;
            if(req.query.page){
                page = parseInt(req.query.page)
            }
            var total = Math.ceil(count/show)
            isUp = true;
            isNext = true;
            if(page==1){
                isUp = false;
            }
            if(page==total){
                isNext = false;
            }
            var ress = db.collection("books").find().sort({ updateTime:-1 })
            var resul = ress.limit(show).skip(show*(page-1))
            resul.toArray((err,result)=>{
                let admin = req.session.username
                res.render("index",{
                    result,total,page,isUp,isNext,admin
                })
            })
        })
    })
})

router.get("/login",(req,res)=>{
    res.render("login")
})

// post方式登录表单页面
router.post("/login" ,urlencodedParser,(req, res) => {
    let username = req.body.username
    let password = req.body.password
    Mongodb.connect(url,(flag,db,client)=>{
        var result = db.collection("administrator").find({username:username})
        result.toArray((err, result) => {
            if (result.length == 0) {
                res.render("wait", { wait: 1, content: "用户名不存在", href: "/login" })
                console.log("账号不存在")
            } else {
                if (password != result[0].password) {
                    res.render("wait", { wait: 1, content: "密码错误", href: "/login" })
                    console.log("密码错误")
                }
                req.session.username = username
                res.locals.session = req.session.username
                // res.render("wait", { wait: 1, content: "登录成功", href: "/" })
                console.log("登录成功")
                res.redirect("/")
            }
        })  
    })
})

//注销
router.get("/loginout", (req, res) => {
    req.session.username = undefined
    res.render("wait", { wait: 1, content: "注销成功", href: "/login" })
})

//修改
router.get('/edit',(req,res)=>{
    mongoClient.connect(url,(err,client)=>{
        var db = client.db("DD")
        if (err) {
            console.log("数据库连接失败");
            return
        }
        var result = db.collection("books").find({_id:require("mongodb").ObjectID(req.query.id)})
        result.toArray((err, result) => {
            console.log(result)
            let admin = req.session.username
            res.render("edit", {result,admin})
        })
    })
})
//更新
router.post('/update',(req,res)=>{
    var formMultiparty = new multiparty.Form();
    formMultiparty.uploadDir = "upload"
    formMultiparty.parse(req,function (err,fields,files,next) {
        var oldPath = files.image[0].path
        // var ImagePath = (files.image[0].path.split("\\"))[1]
        var updateTime = time("YYYYMMDDHHmmss");
        var originalFilename = files.image[0].originalFilename
        if(originalFilename=='') {//无图片
            var objFields = {
                name:fields.name[0],
                price:fields.price[0],
                old_price:fields.old_price[0],
                desc:fields.desc[0],
                updateTime:updateTime
            }
        }else {//有图片
            var objFields = {
                name:fields.name[0],
                image:oldPath,
                price:fields.price[0],
                old_price:fields.old_price[0],
                desc:fields.desc[0],
                updateTime:updateTime
            }
        }
        mongoClient.connect(url, function(err, client){
            var db = client.db("DD")
            if (err) {
                console.log("数据库连接失败");
                return
            }  
            // var id = (req.headers.referer.split("="))[1]
            var id = fields.id[0]
            console.log(id)
            db.collection("books").update({_id:require("mongodb").ObjectID(id)},{$set:objFields},(err,result)=>{
                if(err){
                    return
                }
                res.redirect("/")
            })
        })  
    })
})

//删除
router.get("/del",(req,res)=>{
    Mongodb.connect(url,(flag,db,client)=>{
        db.collection("books").deleteOne({_id:require("mongodb").ObjectID(req.query.id)},(err)=>{
            if(err){
                var obj = {state:0,msg:"删除失败"}
                res.send(obj)
                return;
            }
            var obj = {state:1,msg:"删除成功"}
            res.send(obj)
            client.close()
        })
    })
})

//搜索
router.post("/search",urlencodedParser,(req,res)=>{
    // let name = req.body.name
        // let condition=`{name:/${name}/}`
        // console.log(name)
    Mongodb.connect(url,(flag,db,client)=>{
        var name = req.body.name
        let condition={name:{$exists:true}}
        console.log(condition)
        var result = db.collection("books").find(condition)
        // console.log(result)
        result.toArray((err, ress) => {
            let admin = req.session.username
            // res.render("index", {result,admin})
            console.log(ress)
        })
    })
    
})

// 添加
router.get("/add", (req, res) => {
    let admin = req.session.username
    res.render("add",{admin})
})
router.post('/adds',(req,res)=>{
    var formMultiparty = new multiparty.Form();
    formMultiparty.uploadDir = "upload"
    formMultiparty.parse(req,function (err,fields,files,next) {
        var updateTime = time("YYYYMMDDHHmmss");
        var oldPath = files.image[0].path
        // var ImagePath = (oldPath.split("/"))
        // var ImagePath = (files.image[0].path.split("\\"))[1]
        // console.log(ImagePath,2323232)
        let objFields = {
            name:fields.name[0],
            image:oldPath,
            price:fields.price[0],
            old_price:fields.old_price[0],
            desc:fields.desc[0],
            updateTime:updateTime
        }
        console.log(objFields,252525)
        mongoClient.connect(url, (err, client) => {
            var db = client.db("DD")
            if (err) {
                console.log("数据库连接失败");
                return
            }  
            db.collection("books").insertOne(objFields, (err, result) => {
                if (err) {
                    console.log("插入失败");
                    return;
                }
                console.log("插入成功");
                res.redirect("/")
           })
        })  
    })
})

router.get("/classify",(req,res)=>{
    Mongodb.connect(url,(flag,db,client)=>{
        var result = db.collection("classify").find().sort({ updateTime:-1 })
        result.toArray((err,result)=>{
           let admin = req.session.username
           res.render("classify",{result,admin})
        })
    })
})

//修改分类
router.get('/editclassify',(req,res)=>{
    mongoClient.connect(url,(err,client)=>{
        var db = client.db("DD")
        if (err) {
            console.log("数据库连接失败");
            return
        }
        var result = db.collection("classify").find({_id:require("mongodb").ObjectID(req.query.id)})
        result.toArray((err, result) => {
            console.log(result)
            let admin = req.session.username
            res.render("editclassify", {result,admin})
        })
    })
})
//更新分类
router.post('/updateclassify',(req,res)=>{
    // console.log(req.body)
    var formMultiparty = new multiparty.Form();
    formMultiparty.uploadDir = "upload"
    formMultiparty.parse(req,function (err,fields,files,next) {
        var oldPath = files.image[0].path
        // var ImagePath = (files.image[0].path.split("\\"))[1]
        // console.log(ImagePath,555555)
        var updateTime = time("YYYYMMDDHHmmss");
        var originalFilename = files.image[0].originalFilename
        if(originalFilename=='') {//无图片
            var objFields = {
                name:fields.name[0],
                updateTime:updateTime
            }
        }else {//有图片
            var objFields = {
                name:fields.name[0],
                image:oldPath,
                updateTime:updateTime
            }
        }
        mongoClient.connect(url, function(err, client){
            var db = client.db("DD")
            if (err) {
                console.log("数据库连接失败");
                return
            }  
            // var id = (req.headers.referer.split("="))[1]
            var id = fields.id[0]
            db.collection("classify").update({_id:require("mongodb").ObjectID(id)},{$set:objFields},(err,result)=>{
                if(err){
                    return
                }
                res.redirect("/classify")
            })
        })  
    })
})

// 分类添加
router.get("/addclassify", (req, res) => {
    let admin = req.session.username
    res.render("addclassify",{admin})
})
router.post('/addclassifys',(req,res)=>{
    var formMultiparty = new multiparty.Form();
    formMultiparty.uploadDir = "upload"
    formMultiparty.parse(req,function (err,fields,files,next) {
        var updateTime = time("YYYYMMDDHHmmss");
        var oldPath = files.image[0].path
        // var ImagePath = (files.image[0].path.split("\\"))[1]
        let objFields = {
            name:fields.name[0],
            image:oldPath,
            updateTime:updateTime
        }
        mongoClient.connect(url, (err, client) => {
            var db = client.db("DD")
            if (err) {
                console.log("数据库连接失败");
                return
            }  
            db.collection("classify").insertOne(objFields, (err, result) => {
                if (err) {
                    console.log("插入失败");
                    return;
                }
                console.log("插入成功");
                res.redirect("/classify")
           })
        })  
    })
})

//分类删除
router.get("/delclassify",(req,res)=>{
    Mongodb.connect(url,(flag,db,client)=>{
        db.collection("classify").deleteOne({_id:require("mongodb").ObjectID(req.query.id)},(err)=>{
            if(err){
                var obj = {state:0,msg:"删除失败"}
                res.send(obj)
                return;
            }
            var obj = {state:1,msg:"删除成功"}
            res.send(obj)
            client.close()
        })
    })
})
module.exports = router