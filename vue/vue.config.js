module.exports={
	publicPath:'/',
	outputDir:'build/',
	lintOnSave:false,
	pages:{
		index:{
			entry:'./src/main.js',
			template:'./public/index.html',
			filename:'index.html'
		}
	},
	devServer:{
		port:8000,
		proxy: 'http://192.168.43.198:8080/',
		headers: {
			'Access-Control-Allow-Origin':'*',
		},
		hotOnly: false,
		disableHostCheck:true
	}
}