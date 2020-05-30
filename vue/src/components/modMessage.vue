<template>
	<div class="modMessage">
		<mt-header fixed title="修改资料">
			<mt-button icon="back" slot="left" @click="$router.back()">返回</mt-button>
		</mt-header>
		<div class="m-content">
			<ul>
				<li>
					<p>修改头像</p>
					<input class="file" type="file" accept="image/*" name="f1" ref="image"/>
					<span class="modHeader"></span>
				</li>
				<li>
					<p>修改性别</p>
					<input class="text" type="text" v-model="sex" placeholder="请输入性别">
					<span class="modHeader"></span>
				</li>
				<li>
					<p>修改年龄</p>
					<input class="text" type="number" max="90" v-model="age" placeholder="请输入年龄">
					<span class="modHeader"></span>
				</li>
				<li>
					<p>修改住址</p>
					<input class="text" type="text" v-model="city" placeholder="请输入现住址">
					<span class="modHeader"></span>
				</li>
				<li>
					<p>修改签名</p>
					<input class="text" type="text" v-model="signature" placeholder="请输入新签名">
					<span class="modHeader"></span>
				</li>
				<li>
					<p>修改爱好</p>
					<input class="text" type="text" v-model="hobby" placeholder="请输入爱好">
					<span class="modHeader"></span>
				</li>
			</ul>
		</div>
		<div class="m-foot">
			<button @click="modMessage()">确定修改</button>
		</div>
	</div>
</template>

<script>
	import {Toast} from 'mint-ui'
	export default{
		data(){
			return{
				sex:'',
				age:'',
				city:'',
				signature:'',
				hobby:'',
				username:'',
				userImg:''
			}
		},
		async created(){
			this.username=sessionStorage.getItem('username');
			this.userImg=sessionStorage.getItem('userImg');
			let {data:{data}}=await this.axios.get('api/personalData',{
				params:{username:this.username}
			});
			if(data.length>0){
				this.sex=data[0].sex;
				this.age=data[0].age;
				this.city=data[0].city;
				this.signature=data[0].signature;
				this.hobby=data[0].hobby;
			}
		},
		methods:{
			async modMessage(){
				let formData=new FormData();
				formData.append('file',this.$refs.image.files[0]);
				formData.append('username',this.username);
				formData.append('userImg',this.userImg);
				formData.append('sex',this.sex);
				formData.append('age',this.age);
				formData.append('city',this.city);
				formData.append('signature',this.signature);
				formData.append('hobby',this.hobby);
				let config = {
            'Content-Type': 'multipart/form-data',
        };
				let {data:{data}}=await this.axios.post('upload',formData,config);
				if(data.length>0){
					if(data=='文件过大'){
						alert(`${data}`)
					}else{
						Toast({
							message:'修改成功',
							position: 'middle',
							duration: 1000
						});
						this.$router.push('/personalData');
					}
				}
			}
		}
	}
</script>

<style scoped>
   .modMessage{overflow: hidden;}
	.m-content{width: 100%;position: absolute;top: 2.5rem;bottom: 3rem;overflow: hidden;}
	.m-content ul{width: 100%;position: relative;top: 2rem;}
	.m-content ul li{width: 100%;min-height: 2.5rem;line-height: 2.5rem;padding-left: 1rem;background: white;position: relative;margin-bottom: 0.625rem;}
	.m-content ul li .modHeader{width:2rem;height: 1.5rem;position: absolute;top:0.5rem;right: 1rem;overflow: hidden;}
	.m-content ul li .modHeader:after{width: 1rem;height: 1.5rem;position: absolute;top: 6px;left: 0.625rem;content: '';background:url('../assets/imgs/sprite-img.png') -1966px -76px no-repeat;zoom: 1.2;}
	.m-content ul li .file{width:73%;opacity: 0;position: absolute;top: 0.5rem;left: 4rem;z-index: 999;}
	.m-content ul li .text{width:50%;height: 2.4rem;position: absolute;top: 0;left: 5rem;}
	.m-foot{width: 100%;position: fixed;bottom: 0;height: 3rem;}
	.m-foot>button{width: 100%;height: 2.5rem;border: none;outline: none;border-radius: 1rem;background: #007aff;color: white;}
	.mint-cell{min-height: 2rem;}
</style>