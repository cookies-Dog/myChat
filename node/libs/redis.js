const redis=require('redis');          //nosql,缓存库
const bluebird=require('bluebird');    
const config=require('../config');

let client=redis.createClient({
	host: config.redis_host,
	port: config.redis_port
});
bluebird.promisifyAll(redis.RedisClient.prototype);  //让redis的操作方式变为异步

//redis错误处理方法
client.on('error',err=>{
	console.log('error:',err.code);
});
client.on('reconnecting',ev=>{
	console.log('reconnect:',ev.attempt);
})

module.exports=client;