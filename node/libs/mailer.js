const nodemailer=require('nodemailer');

let transporter=nodemailer.createTransport({
	service: 'qq',  //邮箱类型
	port: 465,  //端口
	secure: true,
	auth:{
		user: '1091500906@qq.com',  //发送者邮箱
		pass: 'noixnihchudvhefc',  //发送者邮箱的stmp授权码
	}
});

function sendMail(emails,code,call){
	let mailOptions={
		from: '"chat-demo" <1091500906@qq.com>', // 发送方
		to: emails,  //接收者邮箱
		subject: '改密验证码',  //邮件标题
		text:'xxxx', //文本内容
		html: '<p>这里是二狗官网,验证码为：'+code+',详情请点击:</p><a href="https:106.52.230.56">点击跳转</a>', //页面内容
        // attachments: [{//发送文件
        //      filename: 'index.html', //文件名字
        //      path: './index.html' //文件路径
        //  },
        //  {
        //      filename: 'sendEmail.js', //文件名字
        //      content: 'sendEmail.js' //文件路径
        //  }
        // ]
	};

	//发送函数
	transporter.sendMail(mailOptions, (error,info)=>{
		if(error){
			call(false)
		}else{
			call(true)
		}
	});
}

module.exports={
	sendMail
}