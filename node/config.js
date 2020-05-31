const path=require('path');

module.exports={
	//服务器端口
	port:8080,
	MD5_SUFFIX: 'xxxxxxx',
        my_token:'xxxxxxxxxx',

	//数据库
	db_host:'your host',
	db_user:'your mysql user',
	db_port:3306,
	db_pass:'your mysql password',
	db_name:'database name',

	//redis
	redis_host:'your host',
	redis_port:6379,
	redis_pass:null,

	//upload
	upload_dir:path.resolve(__dirname,'./upload'),

	//static
	static_path:path.resolve(__dirname,'./static'),

	//ejs
	ejs_path:path.resolve(__dirname,'./template'),
};
