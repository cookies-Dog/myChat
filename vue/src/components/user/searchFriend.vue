<template>
	<div style="overflow: hidden">
		<mt-header fixed :title="title">
			<mt-button icon="back" slot="left" @click="$router.back()">返回</mt-button>
		</mt-header>
		<div class="searchInput">
			<input type="text" placeholder="输入用户名" v-model="search" @input="searchUser()">
		</div>
		<div class="members">
			<p v-if="title!=='查找好友'">群主、群员({{searchResult.length}})</p>
		</div>
		<div class="searchContent">
			<ul v-if="searchResult.length>0">
				<li v-for="item,index in searchResult" @click="isJump(index)">
					<i>
						<img :src="item.image|imgPath">
					</i>
					<span class="identity" :class="{active:item.username==groupManager}" v-if="title!=='查找好友'">
						{{item.username==groupManager?'群主':'群员'}}
					</span>
					<span class="friendName">{{item.username}}</span>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
	export default{
		data(){
			return{
				title:this.$route.params.friendName,
				searchResult:[],
				groupManager:null,
				user:undefined,
				search:undefined
			}
		},
		async created(){
			this.user=sessionStorage.username;
			if(this.title!=='查找好友'){
				let {data:{data}}=await this.axios.get('api/getGroupMsg',
					{
						params:{
							title:this.title
					}
				});
				if(data){
					this.searchResult=data;
					this.groupManager=data[0].username;

					let membersDate=[];
					data.forEach(item=>{
						membersDate.push({username:item.username,image:item.image});
					});
					this.$store.dispatch('getMembersDate',membersDate);
				}
			}

		},
		methods:{
			isJump(i){
				if(this.searchResult[i].username==this.user){
					this.$router.push('/personalData');
				}else{
					if(this.title!=='查找好友'){
						let group=this.groupManager+':'+this.title;
						let userInfo=this.searchResult[i].username+'?'+'delMember';
						sessionStorage.setItem('group',group);
						this.$router.push({name:'information',params:{userInfo}});
					}else{
						let userInfo=this.searchResult[i].username+'?'+'add';
						this.$router.push({name:'information',params:{userInfo}});
					}
				}
			},
			async searchUser(){
				if(this.search){
					if(this.title=='查找好友'){
						let {data:{data,err,msg}}=await this.axios.post('/searchFriend',{
							friendname:this.search
						});
						if(err){
							console.log(msg)
						}else{
							if(data!=='你查找的用户不存在'){
								this.searchResult=data;
							}else{
								this.searchResult=[];
							}
						}
					}else{
						this.searchResult=[];
						this.$store.state.members.forEach(item=>{
							if(item.username.indexOf(this.search)>-1){
								this.searchResult.push(item)
							}
						});
					}
				}else{
					this.searchResult=[];
				}
			}
		},
		computed:{
			
		}
	}
</script>

<style scoped>
	.searchInput{
		width: 100%;
		height: 4rem;
		margin-top: 40px;
		background: white;
	}
	.searchInput input{
		margin-top: 1rem;
		background: #c7c2c2;
	}
	.members{
		height: 1.5rem;
		color: #653c3c;
		font-size: 1rem;
		padding: 1rem 0 0 1rem;
	}
	.searchContent{
		width: 100%;
		background: white;
	}
	.searchContent ul li{
		width: 100%;
		height: 3rem;
		max-height: 20rem;
		padding-top: 0.5rem;
		overflow: scroll;
	}
	.searchContent ul li i{
		width: 3rem;
		height: 3rem;
		position: absolute;
		left:0.5rem;
		border-radius: 50%;
		overflow: hidden;
	}
	.searchContent ul li i img{
		width: 3rem;
		height: 3rem;
	}
	.searchContent ul li .identity{
		position: relative;
		top:0.875rem;
		left:3.5rem;
		background: #3ada2f;
		border-radius: 5px;
		padding: 2px;
		color: white;
		font-size: 0.8rem;
	}
	.searchContent ul li .friendName{
		position: relative;
		top: 0.875rem;
		left: 4.125rem;
	}
	.searchContent ul li .active{
		background: #d62d2d;
	}
</style>