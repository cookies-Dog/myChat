<template>
	<div class="agreement">
		<mt-header fixed title="服务协议">
			<mt-button slot="left" icon="back" @click="$router.back()">返回</mt-button>
		</mt-header>
		<div class="agreeContent">
			<h5>还没想好，欢迎先进行使用，嘿嘿！</h5>
			<h5>详情请点击<a href="https://github.com/cookies-Dog/myChat">Github地址</a></h5>
		</div>
	</div>
</template>

<script>

	export default {
		data(){
			return{
				
			}
		}
	}
</script>

<style scoped>
	.agreeContent{width: 100%;position: absolute;top: 10rem;overflow: hidden;text-align: center;}
</style>