//给第一个li添加class active
$(".pagination li:first").addClass("active");
var currPage = 1;
getDataByPage(currPage);
//定义根据页码追加数据方法
function getDataByPage(page){
    $.ajax({
        url:"/page",
        data:{"page":page},
        success:function(data){//data就是查询的当前页的数据
            //找到模板节点
            var complied = _.template($("#muban").html());
            //清空原先内容
            $("#allMessage").html("");
            //遍历所有data 往全部模板节点填充内容
            for(var i=0;i<data.length;i++){
                var da = data[i];//{}
                var str = complied({"name":da.name,"message":da.message,"time":da.time,"_id":da._id})
                $("#allMessage").append($(str));
            }
        }
    });
}
//给页码节点添加事件
$(".pagination li").on("click",function(){
    //点击时 获取当前页码 根据当前页码查询数据
    //获取页码
    currPage = parseInt($(this).attr("data-page"));
    //根据页码获取数据
    getDataByPage(currPage);
    $(this).addClass("active").siblings().removeClass("active");
});
