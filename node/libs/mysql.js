const mysql=require('promise-mysql');
const config=require('../config');


module.exports=mysql.createPool(
	{
		host: config.db_host,
		user: config.db_user,
		password: config.db_pass,
		database: config.db_name
	}
);

