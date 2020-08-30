var express = require("express")
var bodyParser = require("body-parser")
var path = require("path")
var session = require("express-session")
var Router = require("./controller/Router")
var app = express()

app.use(bodyParser.urlencoded({ extended: false }))
//模板引擎的相关设置 html
app.engine("html",require("ejs").__express)
app.set("view engine","html")

//views设置模板的目录
app.set("views",path.join(__dirname,"views"))

app.use(express.static(path.join(__dirname,"static")))
app.use('/upload',express.static(path.resolve(__dirname,"upload")))
// app.use('/upload', express.static(path.resolve(__dirname, './upload')));

//express-session
app.use(session({
    secret: "yufeng",//session秘钥
    resave: true,//重新保存session
    saveUninitialized: true,
    cookie: {
        maxAge: 6000 * 60
    }
}))

app.use(Router)

app.listen(3000,()=>{
    console.log("服务器已启动 @127.0.0.1:3000");
})