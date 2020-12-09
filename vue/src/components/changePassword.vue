<template>
	<div>
		<mt-header fixed title="修改密码">
			<mt-button slot="left" icon="back" @click="$router.back()">返回</mt-button>
		</mt-header>
		<mt-field label="用户名" :placeholder="username" style='margin-top: 4rem' disabled></mt-field>
		<mt-field label="新密码" type="password" placeholder="请输入新密码" v-model="password1"></mt-field>
		<mt-field label="新密码" type="password" placeholder="请确认新密码" v-model="password2"></mt-field>
		<mt-button type="primary" size="large" style="margin-top: 1rem" @click="changePWD()">确认修改</mt-button>
	</div>
</template>

<script>
	import {Toast} from 'mint-ui';
	export default{
		data(){
			return{
				username:'',
				password1:'',
				password2:''
			}
		},
		async created(){
			let user=sessionStorage.getItem('userName');
			if(user){
				this.username=user;
			}else{
				this.$router.push('forget');
			}
		},
		methods:{
			async changePWD(){
				if(this.password1.length<6){
					Toast({
						message:'请输入6-10位数字的新密码',
						position:'middle',
						duration:1000
					});
				}else if(this.password1!==this.password2){
					Toast({
						message:'请确认密码是否一致',
						position:'middle',
						duration:1000
					});
				}else{
					let {data:{data,err,msg}}=await this.axios.post('changePassword',{
						username:this.username,
						password:this.password2
					});
					Toast({
						message:'成功修改密码',
						position:'middle',
						duration:1000
					});
					this.$router.push('login');
				}
			}
		}
	}
	
</script>

<style scoped>
	div{overflow: hidden;}
</style>