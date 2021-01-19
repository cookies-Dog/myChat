<template>
	<div>
		<mt-header title="个人资料">
			<mt-button slot="left" icon="back" @click="$router.push('/index')">返回</mt-button>
		</mt-header>
		<div class="content-f1">
			<div class="p-header">
				<img :src="image|imgPath" alt="" v-if="image">
				<div class="message">
					<span class="name">{{user}}</span>
					<span class="sex">{{sex}}</span>
					<span class="age">{{age}}</span>
					<span class="city">{{city}}</span>
				</div>
			</div>
			<div class="p-content">
				<div class="signature">{{signature}}</div>
				<div class="hobby">{{hobby}}</div>
			</div>
		</div>
		<div class="p-foot">
			<button @click="$router.push('/modMessage')">编辑资料</button>
		</div>
	</div>
</template>

<script>
	export default{
		data(){
			return{
				user:'',
				age:'',
				city:'',
				sex:'',
				image:'',
				signature:'',
				hobby:''
			}
		},
		async created(){
			let username=sessionStorage.getItem('username');
			let {data:{data}}=await this.axios.get('api/personalData',{
				params:{username}
			});
			if(data.length>0){
				this.user=data[0].username;
				this.age=data[0].age;
				this.city=data[0].city;
				this.sex=data[0].sex;
				this.signature=data[0].signature;
				this.hobby=data[0].hobby;
			    this.image=data[0].image;
			}
		}
	}
</script>

<style scoped>
	.content-f1{width: 100%;position: absolute;top: 2.5rem;bottom: 3rem;overflow: hidden;}
	.p-header{width: 100%;position: relative;top: 6rem;background: white;}
	.p-header img{width: 5rem;height: 5rem;border-radius: 50%;position: relative;left: 1rem;top: -2.5rem;border: 0.25rem solid white;}
	.p-header .message{width: 100%;height: 6rem;position: absolute;top:-2.25rem;left: 6.25rem;}
	.p-header .message>.name{font-weight: 600;font-size: 20px;position: absolute;top: 0.5rem;left: 0.5rem;color: #234763;}
	.p-header .message .sex{width: 1rem;position: absolute;left: 0.5rem;top:2.5rem;font-size: 0.9rem;}
	.p-header .message .age{position: absolute;left: 2.5rem;top:2.5rem;font-size: 0.9rem;}
	.p-header .message .city{position: absolute;left: 0.5rem;top:4rem;font-size: 0.9rem;}
	.p-content{width: 100%;position: relative;background: white;top: 4rem;}
	.p-content>.signature{width: 90%;height: 3rem;line-height: 3rem;padding-left: 1.5rem;color: #b8bbbf;font-size: 0.9rem;}
	.p-content>.hobby{width: 90%;line-height: 2rem;padding-left: 1.5rem;color: #b8bbbf;font-size: 0.9rem;min-height: 2rem;}
	.p-foot{width: 100%;height: 3rem;position: absolute;bottom: 0;}
	.p-foot>button{width: 100%;height: 2.5rem;border: none;outline: none;border-radius: 1rem;background: #007aff;color: white;}
</style>