<template>
	<div>
		<mt-header fixed title="忘了密码">
			<mt-button slot="left" icon="back" @click="$router.back()">返回</mt-button>
		</mt-header>
		<mt-tab-container>
			<mt-tab-container-item>
				<div class="Navbar">
					<div v-for="nav,index in navbar" :key="index" :class="{cur:index==cur}" @touchstart="cur=index">{{nav}}</div>
				</div>
			</mt-tab-container-item>
		</mt-tab-container>
		<mt-tab-container>
			<mt-tab-container-item v-if="cur==0">
				<mt-field label="用户名" placeholder="请输入账号" v-model="form.username" style="height: 3rem;"></mt-field>
				<mt-field placeholder="请输入验证码" style="width: 10rem;height: 3rem;margin-top: 1rem;margin-left: 0.5rem;" v-model="form.checkCode"></mt-field>
				<mt-button type="primary" style="height:3rem;display: block;margin-top: -3rem;margin-left: 12rem;" @click="getCode()" :disabled="sendState==true">{{sendState==false?'获取验证码':`已发送(${seconds})`}}</mt-button>
				<mt-button type="primary" size="large" class="big-button" @click="checkCode()">确定</mt-button>
			</mt-tab-container-item>
			<mt-tab-container-item v-if="cur==1">
				<mt-field placeholder="请输入账号" v-model="form.username" style="height: 3rem;"></mt-field>
				<mt-field type="password" placeholder="请输入密码" v-model="form.password" style="height: 3rem;"></mt-field>
				<mt-button type="primary" class="big-button" size="large" @click="checkPassword()">确定</mt-button>
			</mt-tab-container-item>
		</mt-tab-container>
	</div>
</template>

<script>
	import {Toast} from 'mint-ui';
	export default{
		data(){
			return{
				cur:0,
				form:{
					username:'',
					password:'',
					checkCode:''
				},
				navbar:['邮箱改密','密码改密'],
				sendState:false,
				seconds:60,
				timer:''
			}
		},
		methods:{
			async checkPassword(){
				if(this.form.username==''||this.form.password==''){
					Toast({
						message:'未输入账号密码',
						position: 'middle',
						duration:1000
					});
				}else{
					let {data:{data,err,msg}}=await this.axios.post('checkPassword',{
						username:this.form.username,
						password:this.form.password
					});
					if(data.length>0){
						sessionStorage.setItem('userName',this.form.username)
						this.$router.push('changePassword');
					}else{
						Toast({
							message:'请确认账号密码是否正确',
							position: 'middle',
							duration:1000
						});
					}
				}
			},
			async getCode(){
				if(this.form.username.length<=0) return;
				let {data:{data,err,msg}}=await this.axios.post('checkEmail',{
					username:this.form.username
				});
				if(data=='发送成功'){
					this.sendState=true;
					Toast({
						message: '发送成功，请注意接收',
						position: 'middle',
						duration: 1000
					});
					this.downCount(this.seconds);
				}else{
					Toast({
						message: '发送失败，请再次发送',
						position: 'middle',
						duration: 1000
					});
				}
			},
			downCount(i){
				this.timer=setInterval(()=>{ //注意箭头函数里的this指向
					if(this.seconds>0){
						this.seconds=i--;
					}else{
						this.sendState=false;
						clearInterval(this.timer,1000);
					}
				},1000);
			},
			async checkCode(){
				if(this.form.checkCode!=''){
					let {data:{data}}=await this.axios.post('checkCode',{
						username:this.form.username,
						code:this.form.checkCode
					});
					if(data=="验证码正确"){
						sessionStorage.setItem('userName',this.form.username);
						this.$router.push('changePassword');
					}else{
						Toast({
							message: '验证码错误，请重新输入',
							position: 'middle',
							duration: 1000
						});
					}
				}else{
					Toast({
						message: '请输入验证码',
						position: 'middle',
						duration: 1000
					});
				}
			}
		}
	}
</script>

<style scoped>
	.mint-tab-container-item{
		margin-top:100px;
	}
	.Navbar{
		width: 100%;
		height: 4rem;
		background: white;
	}
	.Navbar div{
		width: 50%;
		height: 3.95rem;
		display: inline-block;
		line-height: 4rem;
		font-size: 1rem;
	}
	.cur{
		width: 100%;
		color: #007aff;
		border-bottom: 0.05rem solid #007aff;
	}
	.big-button{
		height: 3rem;
		margin-top: 3rem;
	}
	.mt-field{

	}
</style>