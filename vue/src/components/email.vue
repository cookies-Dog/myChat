<template>
	<div>
		<mt-header fixed title="我的邮箱">
			<mt-button slot="left" icon="back" @click="setEmail()">{{emailState=='mod'?'取消修改':'取消绑定'}}</mt-button>
		</mt-header>
		<mt-tab-container>
			<mt-tab-container-item>
				<mt-field label="个人邮箱" placeholder="请输入个人邮箱" v-model="email" :disabled="emailState=='mod'" style="height: 3rem;"></mt-field>
				<mt-field placeholder="请输入验证码" style="width: 10rem;height: 3rem;margin-top: 1rem;margin-left: 1rem;" v-model="checkCode"></mt-field>
				<mt-button type="primary" style="display: block;margin-top: -3rem;margin-left: 12rem;height: 3rem;" @click="getCode()" :disabled="sendState==true">{{sendState==false?'获取验证码':`已发送(${seconds})`}}</mt-button>
				<mt-button type="primary" size="large" style="margin-top: 3rem;height: 3rem" @click="insertEmail()">{{emailState=='mod'?'确定修改':'确定'}}</mt-button>
			</mt-tab-container-item>
		</mt-tab-container>
	</div>
</template>

<script>
	import {Toast} from 'mint-ui';
	export default{
		data(){
			return{
				email:'',
				checkCode:'',
				sendState:false,
				seconds: 59,
				timer:null,
				emailState:null
			}
		},
		async created(){
			this.emailState=this.$route.params.emailState;
			if(this.emailState=='mod'){
				let username=sessionStorage.getItem('username');
				let {data:{data}}=await this.axios.get('api/getEmail',{params:{username}});
				if(data){
					this.email=data[0].email;
				}
			}
		},
		methods:{
			async getCode(){
				let reg = /^([A-Za-z0-9]{6,11})+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;
				if(this.email=='') return;
				if(reg.test(this.email)==true){
					let {data:{data}}=await this.axios.post('bindEmail',{
						email:this.email
					});
					if(data=='发送成功'){
						this.sendState=true;
						Toast({
							message:'发送成功，请注意接收',
							position: 'middle',
							duration: 1000
						});
						this.downCount(this.seconds)
					}else{
						Toast({
							message:'发送失败，请再次检查邮箱是否正确',
							position: 'middle',
							duration: 1000
						});
					}
				}else{
					Toast({
						message:'邮箱格式有误，请仔细检查',
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
			async insertEmail(){
				if(this.checkCode=='') return;
				let username=sessionStorage.getItem('username');
				let {data:{data}}=await this.axios.post('insertEmail',{
					username,
					email:this.email,
					code:this.checkCode,
					state:this.emailState
				});
				if(data=="验证码正确"){
					Toast({
						message:'绑定成功',
						position: 'middle',
						duration: 1000
					});
					this.$router.push('/index');
				}else if(data=="验证成功"){
					this.sendState=false;
					this.email='';
					this.checkCode='';
					this.emailState='bind2';
					this.$router.push({name:'email',params:{emailState:'bind2'}});
				}else{
					Toast({
						message:'验证码错误，请重新输入',
						position: 'middle',
						duration: 1000
					});
				}
			},
			async setEmail(){
				if(this.emailState=='bind1'){
					let username=sessionStorage.getItem('username');
					let {data:{data}}=await this.axios.post('setEmail',{username});
					if(data.isFulfilled==false){
						this.$router.push('/index');
					}
				}else{
					this.$router.push('/index');
				}
			}
		}
	}
</script>

<style scoped>
	
</style>