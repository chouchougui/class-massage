var express = require("express");
var app = express();
app.listen(4000);
//静态页面
app.use(express.static("./public"));
app.use("/avatar",express.static("./avatar"));
//模板引擎
app.set("view engine","ejs");
var router = require("./controller/router.js");
var session = require("express-session");
app.set('trust proxy',1); // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
    //设置cookie是安全的，必须通过https连接才能访问到
    //cookie: { secure: true }
}));
//首页
app.get("/",router.showIndex);
app.get("/regist",router.regist);
app.post("/doRegist",router.doRegist);
app.get("/login",router.login);
app.post("/doLogin",router.doLogin);
app.get("/setAvatar",router.setAvatar);
app.post("/doSetAvatar",router.doSetAvatar);
app.get("/cut",router.cut);
app.get("/doCut",router.doCut);
//退出
app.get("/quit",router.quit);
app.get("/message",router.message);
app.get("/page",router.page);





