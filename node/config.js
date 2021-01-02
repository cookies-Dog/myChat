const path=require('path');

module.exports={
	//服务器端口
	port:8080,
	MD5_SUFFIX: 'wefnskdjbfskdbfkNwfk156164acs%$',
	my_token:'1ad1a1f31a3d1a3sd1sad5sad1a31d3a$^$^$',

	//数据库
	db_host:'localhost',
	db_user:'root',
	db_port:3306,
	db_pass:'125800',
	db_name:'mobile',

	//redis
	redis_host:'localhost',
	redis_port:6379,
	redis_pass:null,

	//upload
	upload_dir:path.resolve(__dirname,'./upload'),

	//static
	//static_path:path.resolve(__dirname,'./static/build'),
	static_path:path.resolve(__dirname,'./static'),

	//ejs
	ejs_path:path.resolve(__dirname,'./template'),

	//服务器运行地址下的上传路径
	server_address:'http://192.168.43.45:8080/upload/'
};