import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios,axios);
Vue.use(Vuex);

import {Toast} from 'mint-ui';

export default new Vuex.Store({
	state:{
		username:''
	},
	mutations:{
		async setUserID(state,username){
			state.username=username;
		}
	},
	actions:{
		async getUserID({commit},form){
			let token=sessionStorage.getItem('token');
			let {data:{err,data,msg}}=await axios.post('login',{
				password:form.password,
				token
			});
			if(err){
				console.log(msg)
			}else{
				if(data=='此用户已登陆'){
					Toast({
					message: '此用户已登陆',
					position:'middle',
					duration:1000
					});
				}else if(data=='false'){
					Toast({
						message: '密码错误',
						position:'middle',
						duration:1000
					})
				}else{
					commit('setUserID',form.user);
					console.log(socket)
					sessionStorage.setItem("username",form.user);
				}
			}
		}
	}

});