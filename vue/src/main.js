import Vue from 'vue'
import App from './App.vue'
import Mint from 'mint-ui'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSocketIo from 'vue-socket.io'
import store from './store'
import router from './router'

import 'mint-ui/lib/style.css'

const baseUrl=process.env.NODE_ENV=='development'? 'http://192.168.43.45:8000':'http://106.52.81.149/mobile';
const socketUrl=process.env.NODE_ENV=='development'? 'http://192.168.43.45:8080':'http://106.52.81.149';

Vue.filter('imgPath',val=>{  //过滤器
	return baseUrl+'/upload/'+val;
});

Vue.config.productionTip = false

Vue.use(Mint);  //使用mint-ui组件

axios.defaults.baseURL = baseUrl; //默认请求路径
Vue.use(VueAxios,axios);

Vue.use(new VueSocketIo({
	debug: false,
	connection:socketUrl,  //与服务器端口一致
}));

new Vue({
	store,router,
  render: h => h(App),
}).$mount('#app')
