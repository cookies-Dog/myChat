<template>
	<div>
		<mt-header fixed title="用户注册">
			<mt-button slot="left" icon="back" @click="$router.back()">返回</mt-button>
		</mt-header>
		<mt-tab-container>
			<mt-tab-container-item style="margin-top: 5rem">
				<mt-field label="用户名" placeholder="请输入用户名" v-model="form.username" @input="checkUsername()"></mt-field>
				<div class="showError" v-if="showUserError==true">请输入4-8位(不包含中文和符号)的用户名</div>
      			<mt-field label="密码" placeholder="请输入密码" type="password" autocomplete="off" v-model="form.password1" @input="checkPassword()"></mt-field>
      			<div class="showError" v-if="showPassError==true">请输入6-12位(不包含中文和符号)的密码		
      			</div>
      			<mt-field label="密码" placeholder="请再次输入密码" type="password" v-model="form.password2"></mt-field>
      			<mt-radio v-model="form.sex" :options="sex"></mt-radio>
      			<mt-range v-model="form.age" :min="1" :max="90" :step="1" :bar-height="1">
      			<div slot="start">年龄:{{form.age}}</div>
					<div slot="end">90</div>
        		</mt-range>
        		<div class="address">
        			<select @change="getCity()" v-model="form.province">
        				<option disabled selected>请选择省份</option>
        				<option v-for="province in options_1" :key="province.id">{{province.province}}</option>
        			</select>
        		<span class="column-f2">-</span>
        			<select v-model="form.city">
        				<option disabled selected>请选择城市</option>
        				<option v-for="city in options_2" :key="city.id">{{city.city}}</option>
        			</select>
        		</div>
      		</mt-tab-container-item>
		</mt-tab-container>
		<mt-button type="primary" class="big-button" size="large" @click="register()" :disabled="showUserError||showPassError">注册</mt-button>
	</div>
</template>

<script>
	import { Toast } from 'mint-ui';
	export default {
		data(){
			return {
				form:{
					username:'',
					password1:'',
					password2:'',
					sex:'',
					age:18,
					province:'请选择省份',
					city:'请选择城市'
				},
				showUserError:false,
				showPassError:false,
				sex:['男','女'],
				options_1:[],
				options_2:[],
			}
		},
		async created(){
			let {data:{data,err,msg}}=await this.axios.get('api/provinces');
			if(err){
				console.log(msg)
			}else{
				this.options_1=data;
			}
		},
		methods:{
			checkUsername(){
				if(this.form.username.length<4||this.form.username.length>8){
					this.showUserError=true;
				}else if(this.form.username.match(/[^a-zA-Z0-9]/)){
					this.showUserError=true;
				}else{
					this.showUserError=false;
				}
			},
			checkPassword(){
				if(this.form.password1.length<6||this.form.password1.length>12){
					this.showPassError=true;
				}else if(this.form.password1.match(/[^a-zA-Z0-9]/)){
					this.showPassError=true;
				}else{
					this.showPassError=false;
				}
			},
			async register(){
				if(this.form.username==''||this.form.password1=='' || this.form.sex=='' || this.form.province=='请选择省份' || this.form.city=='请选择城市'){
					Toast({
						message: '请填写完注册信息',
						position: 'middle',
						duration: 1000
					})
				}else if(this.form.password1!==this.form.password2){
					Toast({
						message: '密码不一致',
						position: 'middle',
						duration: 1000
					})
				}else{
					let {data:{err,data,msg}}=await this.axios.post('register',{
						username: this.form.username,
						password: this.form.password1,
						sex:this.form.sex,
						age:this.form.age,
						province:this.form.province,
						city:this.form.city
					});
					if(err){
						console.log(msg)
					}else{
						if(data=='ok'){
							Toast({
 								message: '注册成功',
 								position: 'middle',
 								duration: 1000,
 								//iconClass: 'icon icon-success'
								});
							this.$router.push('login');
						}else{
							Toast({
 								message: `${data}`,
 								position: 'middle',
 								duration: 1000,
							});
						}
					}

				}
			},
    	async getCity() {
      	let {data:{data,err,msg}}=await this.axios.post('/getCity',{
      		province:this.form.province
      	});
      	if(data.length>0){
      		this.options_2=data;
      	}
    	}
  	}
	}
</script>

<style scoped>
  .showError{font-size:12px;color:red;margin-bottom: 5px;}
  .mint-radiolist{text-align: left;}
  .mt-range{background: white;width: 95%;margin-left: 2.5%;margin-top: 0.5rem;}
  .picker{background: white;margin-top: 0.5rem;width: 95%;margin-left: 2.5%;}
  .address{width: 95%;margin-top: 0.5rem;margin-left: 2.5%;background: white;padding-bottom: 0.5rem;}
  .address>select{width: 40%;height: 2rem;outline: none;margin-top: 0.5rem;appearance: none;-moz-appearance: none;-webkit-appearance: none;border: 1px solid #ccc;border-radius: 0.5rem;text-align-last: center;background: white;}
	.address .column-f2{width: 5%;height: 2rem;margin: 0.5rem 5% 0.5rem 5%;}
	.address>select option{text-align: center;outline: none;}
	.big-button{position: absolute;bottom:1rem;height: 3rem;}
</style>