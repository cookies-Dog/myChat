<template>
  <div class="f-login">
    <mt-header fixed title="登陆"></mt-header>
      <div class="headImg">
        <div class="f1">
          <img :src="form.img|imgPath">
        </div>
        <mt-field label="用户名" placeholder="请输入用户名" v-model="form.user" @input="hideUserError()" @change="userInfo()"></mt-field>
        <div class="showError" v-if="showUserError==true">用户名不能为空</div>
        <mt-field label="密码" placeholder="请输入密码" type="password" v-model="form.password" @input="hidePassError()"></mt-field>
        <div class="showError" v-if="showPassError==true">密码不能为空</div>
        <mt-button type="primary" class="big-button" size="large" @click="login()">登陆</mt-button>
      </div>
      <mt-tab-container>
        <mt-tab-container-item>
          <router-link class="forget" :to="{name:'forget'}">忘记密码</router-link> |
          <router-link class="forget" :to="{name:'register'}">用户注册</router-link><br>
          登陆即代表阅读并同意<router-link class="forget" :to="{name:'agreement'}">服务协议</router-link>
        </mt-tab-container-item>
      </mt-tab-container>
  </div>
</template>

<script>

  import {Toast} from 'mint-ui';

  export default {
    data(){
      return {
        form:{
          img:'Elise.png',
          id:'',
          user:'',
          password:''
        },
        showUserError:false,
        showPassError:false
      }
    },
    methods:{
      async userInfo(){
        let {data:{err,data,msg}}=await this.$http.post('userInfo',{
          params:{
            username:this.form.user
          }
        });
        if(err){
          console.log(msg)
        }
        if(data.length==0){
          Toast({
            message: `用户[${this.form.user}]不存在`,
            position: 'middle',
            duration: 1500
          })
        }else{
          this.form.id=data[0].id;
          sessionStorage.setItem('token',data[0].token);
          if(data[0].image){
            this.form.img=data[0].image;
          }
        }
      },
      async login(){
        if(this.form.user==''){
          this.showUserError=true;
        }else if(this.form.password==''){
          this.showPassError=true;
        }else{
          //this.$store.dispatch('getUserID',this.form);
          let token=sessionStorage.getItem('token');
          let {data:{data,err,msg}}=await this.axios.post('login',{
            password:this.form.password,
            token
          });
          if(err){
            console.log(msg)
          }else{
            if(data=='false'){
              Toast({
                message: '密码错误',
                position:'middle',
                duration:1000
              });
            }else{
              Toast({
                message: '登陆成功',
                position:'middle',
                duration:1000
              });
              this.$socket.emit('clearUser',{username:this.form.user});
              sessionStorage.setItem('username',this.form.user);
              this.$router.push('/index');
            }
          }
        }
      },
      hideUserError(){
        if(this.form.user!==''){
          this.showUserError=false;
        }
      },
      hidePassError(){
        if(this.form.password!==''){
          this.showPassError=false;
        }
      }
    },
    async created(){
      this.$store.state.username='';
      sessionStorage.clear();
    }
  }
</script>

<style type="text/css">
  body{
    background: #f0f0f0;
  }
  .f-login{overflow: hidden;}
  .mint-tab-container-item{
    margin-top:120px;font-size: 13px;text-align: center;
  }
  .mint-cell{
    width: 95%;height: 3rem;margin:0 auto;
  }
  .big-button{
    margin-top: 3rem;height: 3rem !important;
  }
  .headImg{
    width: 100%;
    text-align: center;margin-top:100px;
  }
  .headImg .f1{
    width: 100px;height: 100px;
    margin:0 auto;border-radius: 50%;margin-bottom: 15px;
  }
  .headImg .f1 img{width: 100px;height: 100px;border-radius: 50%;text-align: center;}
  .forget{
    text-decoration: none;color: black;font-weight: 600;
  }
  .showError{
    font-size:12px;color:red;margin-bottom: 5px;
  }
</style>