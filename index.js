var http = require("http");
var url = require("url");
var fs = require("fs");
var req = require("request");


http.createServer(function(request, response) {

    //我必须知道要请求什么东西
    //我必须要获取请求的url
    var pathname = url.parse(request.url).pathname;
    console.log(pathname);

    var is = isStaticFile(pathname);

    if (is) {//如果是静态文件，执行这个部分
        try {//能找到页面，返回页面的数据
            var data = fs.readFileSync("./page" + pathname);

            response.writeHead(200);
            response.write(data);
            response.end();

        } catch (e) {//找不到页面，返回404
            response.writeHead(404);
            response.write("<html><body><h1>404 NotFound</h1></body></html>");
            response.end();
        }
    } else {//如果不是静态文件，执行这个部分
        console.log("请求的pathname：" + pathname)
        if (pathname == "/api/chat") {
            console.log("向图灵机器人发送数据");
            var params = url.parse(request.url, true).query;
            var data = {
                "reqType":0,
                "perception": {
                    "inputText": {
                        "text": params.text
                    }
                },
                "userInfo": {
                    "apiKey": "6c7161f85ecc4925ac54564bea5eb8a9",
                    "userId": "123456"
                }
            }
            var contents = JSON.stringify(data);
            req({
                url: "http://openapi.tuling123.com/openapi/api/v2",
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: contents
            }, function (error, resp, body) {
                if (!error && resp.statusCode == 200) {
                    //把结果返回给我的前端页面

                    var head = {
                        "Access-Control-Allow-Origin":"*",
                        "Access-Control-Allow-Methods":"GET",
                        "Access-Control-Allow-Headers": "x-request-with , content-type"
                    };
                    response.writeHead(200, head);

                    var obj = JSON.parse(body);
                    if (obj && obj.results && obj.results.length > 0 && obj.results[0].values) {
                        response.write(JSON.stringify(obj.results[0].values));
                        response.end();
                    } else {
                        response.write("{\"text\":\"偶布吉岛你说的是什么~\"}");
                        response.end();
                    }
                } else {
                    //返回给自己前端页面一个400错误
                    response.writeHead(400);
                    response.write("数据异常");
                    response.end();
                }
            });
        } else {//接口访问错了
            console.log("错了");
        }
    }

}).listen(12306);

function isStaticFile(pathname) {
    var staticFile = [".html", ".css", ".js", ".jpg", ".jpeg", ".png", ".gif"];
    for (var i = 0 ; i < staticFile.length ; i ++) {
        if (pathname.indexOf(staticFile[i]) == pathname.length - staticFile[i].length) {
            return true;
        }
    }
    return false;
}
