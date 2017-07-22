var formidable = require("formidable");
var db = require("../models/db.js");
var sd = require("silly-datetime");
var md5 = require("../models/md5.js");
var fs = require("fs");
var gm = require("gm");
//显示主页
exports.showIndex=function(req,res){
    //根据session判断用户是否登录
    if (req.session.login == "1") {
        //登陆
        var username = req.session.username;
        var login = true;
    } else {
        //没有登陆
        var username = "";
        var login = false;
    }
    //已登陆，就在数据库里查找登陆人的头像
    db.findAllCount("web1703",function(count){
        page=Math.ceil(count/5);
        //res.render("header",{"page":page})
    });
    db.find("web1703", {username: username}, function (err, result) {
        if (result.length == 0) {
            var avatar = "default.jpg";
        } else {
            var avatar = result[0].avatar;
        }
        res.render("index",{
            "login": login,
            "username": username,
            "avatar": avatar,
            "active": "index"
        });
    });
};
//显示注册页面
exports.regist=function(req,res){
    res.render("regist",{
        "login":req.session.login=="1"?true:false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active":"regist"
    });
};
//填写注册页面
exports.doRegist=function(req,res){
    //得到用户填写的表单
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //表单的姓名 密码
        var username = fields.username;
        var pwd = fields.pwd;
        //console.log(username,pwd);
        //查询数据库中是不是有这个人
        db.find("web1703", {"username": username}, function (err, result) {
            //console.log(result);
            if (err) {
                res.send("-3"); //服务器发生了错误
                return;
            }
            if (result.length != 0) {
                res.send("-1"); //用户名被占用 换个试试
                return;
            }
            //没有相同的人，设置md5加密 并入库
            pwd = md5(pwd);
            db.insertOne("web1703", {
                "username": username,
                "password": pwd,
                "avatar":"default.jpg"
            }, function (err, result) {
                if (err) {
                    res.send("-3"); //服务器错误
                    return;
                }
                req.session.login="1";
                req.session.username=username;
                res.send("1"); //注册成功，写入session
            })
        });
    });
};
//显示登录页面
exports.login=function(req,res){
    res.render("login",{
        "login":req.session.login=="1"?true:false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active":"login"
    });
};
//填写登录页面
exports.doLogin=function(req,res){
    //得到表单
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var username = fields.username;
        var pwd = fields.pwd;
        //console.log(username,pwd);
        //查询数据库中是不是有这个人
        db.find("web1703", {"username": username}, function (err, result) {
            //console.log("result",result);
            if (err) {
                res.send("-3"); //服务器错误
                return;
            }
            if (result.length == 0) {
                res.send("-1"); //用户名不存在
                return;
            }
            //有此人 设置md5加密
            pwd = md5(pwd);
            if(result[0].password==pwd){
                //登录成功 绑定登录的对象和状态
                req.session.login="1";
                req.session.username = username;
                res.send("1");  //登陆成功
                return;
            }else{
                res.send("-2");//密码错误
                return;
            }

        });
    });
};
//设置头像页面
exports.setAvatar=function(req,res){
    if (req.session.login != "1") {
        res.send("非法闯入，这个页面要求登陆！");
        return;
    }
    res.render("setAvatar.ejs",{
        "login": true,
        "username": req.session.username || "wl",
        "active": "setAvatar"
    });
};
//上传头像
exports.doSetAvatar=function(req,res){
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //接受表单提交的图片
    var form = new formidable.IncomingForm();
    // form.uploadDir = path.normalize(__dirname + "/../avatar");//绝对路径
    form.uploadDir="./avatar";
    form.parse(req, function (err, fields, files) {
        // console.log(files);
        var oldpath = files.avatar.path;
        var newpath = "./avatar/" + req.session.username + ".jpg";
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("失败");
                return;
            }
            req.session.avatar = req.session.username + ".jpg";
            //跳转到切的业务
            res.redirect("/cut");
        });
    });
};
//裁剪头像
exports.cut=function(req,res){
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    res.render("cut", {
        avatar: req.session.avatar
    })
};
//开始裁剪头像
exports.doCut=function(req,res){
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    var filename = req.session.avatar;
    var w = req.query.width;
    var h = req.query.height;
    var x = req.query.left;
    var y = req.query.top;
    //console.log(w,h,x,y);
    gm("./avatar/"+filename).crop(w,h,x,y).resize(100,100,"!").write("./avatar/"+filename,function(err){
            if (err) {
                console.log(err);
                res.send("-1");
                return;
            }
            //更改数据库当前用户的avatar这个值
            db.updateMany("web1703", {"username": req.session.username}, {
                $set: {"avatar": req.session.avatar}
            }, function (err, results) {
                res.send("1");
            });
        });
};
//退出功能
exports.quit=function(req,res){
    res.render("index", {
        "login": false,
        "username": "",
        "active": "index",
        "avatar": "./default.jpg"
    });
};
//留言功能
exports.message=function(req,res){
    var time = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
    db.insertOne("web1703",{"username":req.session.username,"message":req.query.message,"time":time},function(err,result){
        //console.log(result);
        if (err){
            console.log("插入失败");
            return;
        }
        console.log(" ");
        res.redirect("/");
    });
};
exports.page=function(req,res){
    //db.findAllCount("web1703",function(count){
    //    page=Math.ceil(count/5);
    //    res.render("header",{"page":page})
    //});
    var nowpage = parseInt(req.query.page);
    console.log(nowpage,req.query);
    db.find("web1703",{},{"pageSize":5,"page":nowpage,"sort":{"time":-1}},function(err,result){
        //res.send(result);
        res.render("index",{"page":page})
    })
};