const md5=require('./md5');
const {MD5_SUFFIX}=require('../config');

module.exports=str=>{
	return md5(str+MD5_SUFFIX); //password函数md5加密
}