/*DAO层的封装，封装了跟数据库相关的常用操作*/
var MongoClient = require("mongodb").MongoClient;
//1.建立数据库连接
function _connectDB(callback){
    var url="mongodb://localhost:27017/web1703";
    MongoClient.connect(url,function(err,db){
        if (err){
            console.log("连接出错");
            callback(err,null);
        }
        callback(null,db);
    })
}
//2.定义插入函数
exports.insertOne=function(collectionName,json,callback){
    //2.1建立连接
    _connectDB(function(err,db){
        db.collection(collectionName).insertOne(json,function(err,result){
            callback(err,result);
        })
        db.close();
    })
};
//3.修改方法
//update({"name":"bai"},{$set:{"name":"hei"})
exports.updateMany=function(collectionName,json1,json2,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).updateMany(json1,json2,function(err,result){
            callback(err,result);
            db.close();
        })
    })
};
//4.删除方法
exports.deleteMany=function(collectionName,json,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).deleteMany(json,function(err,result){
            callback(err,result);
            db.close();
        })
    })
};
//5.查询方法
//db.student.find({"age":20})
//db.student.find({"age":20}).skip(pageSize*(page-1)).limit(pageSize).sort({"time":-1});
//假设有17条数据 每页显示3条 现在只希望查询第三页的数据
exports.find=function(collectionName,json,C,D){
    //先判断用户调用时传入了几个参数
    //如果是三个参数 分别代表: 集合名称 查询参数 回调函数
    if(arguments.length==3){
        var callback=C;
        var skipnum=0;
        var limitnum=0;
        var sort = {};
    }else if(arguments.length==4){
        //如果是四个参数 分别代表(集合名称 查询参数 分页配置=》{每页显示条数 当前第几页} 回调函数)
        var callback=D;
        var args = C;//{"pageSize":3,"page":3,"sort":{"age":-1}}
        //计算需要跳过多少条数据
        var skipnum = args.pageSize*(args.page-1)||0;
        //查询几条数据
        var limitnum = args.pageSize||0;
        //排序
        var sort = args.sort||{};
    }
    _connectDB(function(err,db){
        var all = db.collection(collectionName).find(json).skip(skipnum).limit(limitnum).sort(sort);
        //将all对象转成数组
        all.toArray(function(err,docs){
            if (err){
                callback(err,null);
                db.close();
                return;
            }
            all=docs;
            callback(null,all);
            db.close();
        })
    })
};
//定义查询总记录数方法 -拿出总记录数
exports.findAllCount=function(collectionName,callback){
  _connectDB(function(err,db){
      db.collection(collectionName).count({}).then(function(count){
          callback(count);
          db.close();
      })
  })
};
