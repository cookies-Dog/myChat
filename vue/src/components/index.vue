<template>
	<div class="swiper-container">
		<div class="swiper-wrapper">
			<div class="swiper-slide" @touchstart="prev=false" @touchend.once="mySwiper(0)">
				<div class="personal-header">
					<img src="../assets/imgs/home.png" alt="">
					<p>个人中心</p>
				</div>
				<div class="personalContent">
					<div class="personal-message" @touchstart="$router.push('/personalData')">
					<img :src="image|imgPath" alt="头像">
					<div class="box">
						<p class="username">{{personal.username}}</p>
						<p class="sign">{{personal.signature}}</p>
					</div>
					</div>
					<div class="personal-service" @touchmove="isJump=false">
					<div class="item" v-for="item,index in personal.service" :key="index"
					@touchend="emailBind(index)">
						<img :src="item.img" />
						<p class="title">{{item.title}}
							<span class="tip" v-if="index==4 && emailState==false">(未绑定邮箱)</span>
						</p>
					</div>
					</div>
				</div>
				<div class="personal-foot">
					<ul class="row">
						<li @click="exitLogin()">
							<img src="../assets/imgs/set.png">
							<p>退出登录</p>
						</li>
						<li>
							<img src="../assets/imgs/night.png">
							<p>夜间模式</p>
						</li>
					</ul>
				</div>
			</div>
			<div class="swiper-slide" @touchstart="next=false" @touchend.once="mySwiper(1)">
				<div class="header">
					<img :src="image|imgPath" @click="mySwiper(0)" alt="头像">
					<p class="title">消息</p>
					<img class="add" src="../assets/imgs/加号.png" @touchstart="$router.push({name:'addGroup',params:{groupName:''}})">
				</div>
				<div class="content">
					<router-view />
				</div>
				<div class="foot">
					<span class="item" v-for="nav,index in footNav" :key="index" :class="{active:index==footIndex}" @touchstart="footIndex=index,$router.push(footUrl[index])">{{nav}}</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script type="text/javascript">
	import Swiper from '../assets/js/swiper.min.js';
	import '../assets/css/swiper.css';
	import '../assets/css/index.css';
	import {Toast} from 'mint-ui';
	import { MessageBox } from 'mint-ui';
	import a from '../assets/imgs/collection.png';
	import b from '../assets/imgs/photos.png';
	import d from '../assets/imgs/decoration.png';
	import e from '../assets/imgs/money.png';
	import f from '../assets/imgs/email.png';

	export default{
		data(){
			return {
				image:'Elise.png',
				prev:true,
				next:true,
				value:'',
				emailState:true,
				personal:{
					username:'',
					signature:'',
					service:[
						{img:a,title:'我的收藏'},
						{img:b,title:'我的相册'},
						{img:d,title:'我的装扮'},
						{img:e,title:'我的钱包'},
						{img:f,title:'我的邮箱'}
					]
				},
				footNav:['消息','联系人','动态','游戏'],
				footIndex:0,
				footUrl:['index','friend','#','#',],
				isJump:true
			}
		},
		async created(){
			let username=sessionStorage.getItem('username');
			let {data:{err,data,msg}}=await this.axios.get('api/index',{
				params:{username}
			});
			if(err){
				console.log(msg)
			}else{
				if(data.length>0){
					if(data[0].email==null){
						this.$router.push({name:'email',params:{emailState:'bind1'}});
					}else if(data[0].email==''){
						this.emailState=false;
					}
					this.personal.username=data[0].username;
					this.personal.signature=data[0].signature;
					if(data[0].image){
						this.image=data[0].image;
					}
				}
			}
			sessionStorage.setItem('userImg',this.image);
		},
		mounted(){
			this.mySwiper(1);
			if(this.$route.path=='/friend'){
				this.footIndex=1;
			}
		},
		methods:{
			mySwiper(index){
				let mySwiper=new Swiper('.swiper-container', {
					initialSlide: index,
					slidesPerView: 'auto',
					allowSlidePrev: this.prev,
					allowSlideNext: this.next, 
					//watchSlidesProgress : true,
				});
			},
			async emailBind(i){
				if(i==4 && this.isJump==true){
					if(this.emailState==true){
						this.$router.push({name:'email',params:{emailState:'mod'}});
					}else{
						this.$router.push({name:'email',params:{emailState:'bind2'}});
					}
				}else{
					this.isJump=true;
				}
			},
			exitLogin(){
				MessageBox.confirm('你确定要退出登陆吗？').then(action=>{
					if(action=='confirm'){
						this.$router.push('login')
					}else{
						return false
					}
				}).catch(()=>{});
			}
		}
	}
</script>

<style scoped>
	.swiper-slide{
		-webkit-box-sizing:border-box;
    	-moz-box-sizing:border-box;
    	box-sizing:border-box;
    	padding:3.75rem 0 3.0625rem 0;
    	overflow:hidden;
    	height: 100vh; 
    }
  	.tip{
  		font-size: 0.8rem;
  		margin-left: 1rem;
  		color: #9e9e9e;
  	}
</style>