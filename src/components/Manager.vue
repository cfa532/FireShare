<script lang="ts">
import FileList from "./FileList.vue"
import { defineComponent } from "vue";
console.log("manager.js")  

export default defineComponent({
    name: "Manager",
    components: {
        FileList
    },
    data() {
        return {
            isLogined:true,
        }
    },
    methods: {
    },
    created() {
    },
})
</script>
<template>
    <div id="mefiles" class="sub_second_iframe_left">
        <div class="main_header">
            <p class="main_header_title">文件列表</p>
        </div>
        <div class="main_item">
            <FileList></FileList>
        </div>
        <div class="main_item">
        </div>
    </div>
</template>

<style>
body{
	background-color: #FFFFFF;
	margin: 0;
	font-size: 14px; 
	font-family: "Microsoft YaHei",微软雅黑; 
}

.main_div
{
	width: 100%;
	height: 100%;
    position:relative;
}

.sub_second_menu_left
{
	height:100%;
	width:150px;
	background-color: #E6E6E6;
	float: left;
}

.sub_second_iframe_left
{
	height:100%;
	width:750px;
	float: left;
}

.main_header
{
	border-bottom: 1px solid #dcdcdc;
}

.main_header_title
{
	font-size: 16px;
    font-weight: bold;
}

.main_header_hint
{
	color:#898989;
	font-size:12px;
	height:12px;
}
.main_header_hint2
{
    position:relative;
	color:#898989;
	font-size:12px;
}

.sub_second_menu_left_second
{
	width: inherit;
	height: 50px;
	line-height: 50px;
	color: #535353;
	text-align: center;
	font-size: 16px;
	cursor: pointer;
}
.sub_second_menu_left_second_select
{
	color:#39BA93;
	background-color: #FAFAFA;
}

.main_content
{
	margin-top: 30px;
}
.main_item
{
	height:50px;
	line-height:50px;
}

.main_item_name
{
	float:left;
	width:100px;
	text-align: right;
	height: inherit;
	margin-right: 30px;
}

.main_item_content
{
	float:left;
	height: 100%;
	width: 500px;
}

.main_item_content div
{
	float:left;
}
.main_item_content_select
{
	margin-top:10px;
}

.theme_color
{
	color: #39ba93;
}


/*input text样式--begin*/
input {font-family: "Microsoft YaHei";}
.input_text:focus, select:focus
{
    border: 1px solid #39ba93;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset, 0 0 8px rgba(102, 175, 233, 0.6);
    outline: 0 none;
}
input::-ms-clear{display:none;}
input[type="password"]:focus{
  outline: 0 none;
}
input[type="password"]::-ms-reveal{display:none;}
.input_text
{
	border: 1px solid #dbdbdb;
	-moz-border-radius: 4px;
	-webkit-border-radius: 4px;
	border-radius: 4px;
	height: 400px;
	padding:6px 10px;
	width: 100%;
	margin: 10px 0;
	color: #535353;
}
/*.input_password
{
	background-image: url("../image/eye_close.png");
	background-position: right center;
	background-repeat: no-repeat;
}*/

input:disabled, select:disabled{
	background-color: #EBEBEB;
	cursor: not-allowed;
}
input[disabled], select[disabled],
input[readonly], select[readonly]{
	background-color: #EBEBEB;
	cursor: not-allowed;
}

.short_input
{
	width:40px;
	text-align:center;
}
.input_button
{
	border-radius: 4px;
	height: 40px;
	line-height: 40px;
	width: 250px;
	background-color: #39ba93;
	border: none;
	color: #FFFFFF;
	cursor: pointer;
}
</style>
