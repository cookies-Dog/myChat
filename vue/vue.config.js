module.exports={
	publicPath:'/', 
	outputDir:'build/',
	lintOnSave:false,
	transpileDependencies: ['vue-socket.io'],//兼容ie
	pages:{
		index:{
			entry:'./src/main.js',
			template:'./public/index.html',
			filename:'index.html'
		}
	},
	devServer:{
		port:8000,
		proxy: 'http://localhost:8080/',
		headers: {
			'Access-Control-Allow-Origin':'*',
		},
		hotOnly: false,
		disableHostCheck:true
	}
}