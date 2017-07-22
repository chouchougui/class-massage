app.get("/index",function(req,res){
    res.render("index");
})
app.get("/regist",function(req,res){
    res.render("regist");
});
app.get("/doRegist",function(req,res){
    var name = req.query.name;
    var pwd = req.query.pwd;
    pwd = md5(pwd);
    //console.log(name,pwd);
    db.find("web1703",{"username":name},function(err,result) {
        //1.检查用户名是否存在
        if (result.length == 0) {
            db.insertOne("web1703",{"username":name,"password":pwd},function(err,result){
                if (err){
                    res.send("-1")//插入失败
                    return;
                }
                res.redirect("login")
            });
        }else{
            res.send("用户名存在，换个试试")
        }
    });
});
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/doLogin",function(req,res){
    //通过表单拿数据
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        //console.log(fields);
        var username = fields.username;
        var pwd = fields.pwd;
        pwd = md5(pwd);
        //console.log(username,pwd);
        db.find("web1703",{"username":username},function(err,result) {
            //console.log(result);
            //1.检查用户名是否存在
            if (result.length==0){
                res.send("用户名不存在");
                return;
            }
            //2.用户名存在判断密码是否正确
            var oldpwd = result[0].password;
            //console.log(oldpwd);
            if(pwd==oldpwd){
                //记录登录状态1 用户名 name
                req.session.login="1";
                req.session.username=username;
                res.send("1");
            }else{
                res.send("-1");
            }
        });
    });
});
app.get("/",function(req,res){
    res.render("index",{
        "login":req.session.login=="1"?true:false,
        "username":req.session.login=="1"?req.session.username:""
    });
});
app.get("/quit",function(req,res){
    req.session.login=="";
    req.session.username="";
    res.redirect("/");
});
app.get("/ps",function(req,res){
    res.render("ps");
});
app.get("/upps",function(req,res){
    console.log("a");
    var form = new formidable.IncomingForm();
    form.keepExtensions=true;//文件后缀
    form.uploadDir="./upload";
    console.log(form);
    var all = [];
    form.on("file", function (filed,file) {
        all.push([filed,file]);
    });
    //改成接受批量files
    form.parse(req,function(err,fileds,files){
        //res.end();
        //将上传的图片放在对应文件夹下，重命名
        //1.获取整个原始文件名
        for(var i=0;i<all.length;i++){
            var fname = all[i][1].name;
            //获取文件后缀名
            var extname = path.extname(fname);
            //2.得到新的文件名
            var time = sd.format(new Date(),"YYMMDDHHmmss");
            var suiji = parseInt(Math.random()*1000+10000);
            var newname = time+suiji+extname;
            //console.log(newname);
            //3.替换成新的文件名
            var newpath = "./upload/"+fileds.dirName+"/"+newname;
            var oldpath = all[i][1].path;
            fs.rename(oldpath,newpath,function(err){
                if (err){
                    res.end("重命名失败");
                }
            });
        }
        //上传成功回到主页
    });
});