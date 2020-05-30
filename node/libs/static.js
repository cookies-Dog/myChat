const config=require('../config');
const static=require('koa-static');

module.exports=router=>{
	router.all(/\.(jpg|png|gif|ico)$/i,static(config.static_path, {
		maxage: 20*86400*1000
	}));
	router.all(/\.jsx?$/i,static(config.static_path, {
		maxage: 3*86400*1000
	}));
	router.all(/\.css$/i,static(config.static_path, {
		maxage: 7*86400*1000
	}));
	router.all(/\.html$/i,static(config.static_path, {
		maxage: 1*86400*1000
	}));
	router.all('*',static(config.static_path, {
		maxage: 20*86400*1000
	}));

}