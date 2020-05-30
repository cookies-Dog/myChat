const body=require('koa-better-body'); //解析post数据，类似Body-prase
const convert=require('koa-convert');  //让老版本中间件可以用
const config=require('../config');

module.exports={
	//普通POST
	post(){
		return convert(body({
			multipart: true,
			buffer: false
		}));
	},
	//文件上传+普通POST
	upload(options){
		options=options||{};
		options.uploadDir=options.uploadDir||config.upload_dir;
		options.maxFileSize=options.maxFileSize||20*1024*1024;

		return [
			async (ctx,next)=>{
				try{
					await next();
				}catch(e){
					if(e.message.startsWith('maxFileSize exceeded')){
						if(options.sizeExceed){
							await options.sizeExceed(ctx);   //外部函数调用，自定义出错内容
						}else{
							ctx.body="文件过大";
						}
					}else{
						if(options.error){
							await options.error(ctx,e);
						}else{
							throw e;
						}
					}
				}
			},
			convert(body({
				uploadDir: options.uploadDir,
				maxFileSize: options.maxFileSize
			})),
		]
	}
}