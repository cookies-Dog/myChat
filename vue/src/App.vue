<template>
  <div>
  	<router-view />
  </div>
</template>

<script>
	import {Toast} from 'mint-ui';

	export default{
		sockets:{
			getUser(data){
				if(this.$route.path!=='/login'){
					let username=sessionStorage.getItem('username');
					if(data.username==username){
						this.$router.push('/login');
						Toast({
							message:'您的账号在另一台设备登陆',
							position: 'middle',
							duration: 1000
						});
					}
				}
			}
		}
	}
</script>

<style type="text/css">
	*{padding: 0;margin: 0;}
	html{font-size: 16px;} 
	 @media only screen and (min-width: 341px){
	    html{font-size: 17px !important;}
	}
	@media only screen and (min-width: 361px){
	    html{font-size: 18px !important;}
	}
	@media only screen and (min-width: 381px){
	    html{font-size: 19px !important;}
	}
	@media only screen and (min-width: 401px){
	    html{font-size: 20px !important;}
	}
	@media only screen and (min-width: 421px){
	    html{font-size: 21px !important;}
	} 
</style>

