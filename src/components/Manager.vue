<script setup lang="ts">
// import Uploader from "./Uploader.vue"
// import FileList from "./FileList.vue"

console.log("manager.js")  
var global
var c = localStorage.getItem("selected")
if (c == null){
    c = "system"
}

export default {
    name: "Manager",
    // el: '#leitherbody',
    components: {
        headnodestate, Uploader, FileList
        },
    data() {
        return {
            ips:"",
            isLogined:true,
            selected: c,
            sid:"",
            mynodedata:{
                nodeid:" ",
                hostpk:" ",
                ips:" ",
                gateway:"  ",
                peerid:" ",
                swarmlocal:""
            },
            swarmdata:{
                dhts:[],
                //peers:[],
                addrs:[],
                gateway:"  "
            },
            appsdata:{
                apps:[]
            },
            systemdata:{
                localnodeid:"",
                oldVars:"",
                systemvars:"",
                bChanged: false        
            }
        }
    },
    methods: {
        select: name=> {
            global.vue.selected = name
            localStorage.setItem("selected", name)
        },
    },
    created() {
        global = window     // which is used inside auth.js as global
        global.vue = this.$data
        import("/src/auth.js").then((module) => {
            console.log("module", module);
        })
        // var tag = document.createElement("script");
        // tag.setAttribute("src", "/src/auth.js");
        // tag.setAttribute("type", 'text/javascript');
        // document.head.appendChild(tag); 
    },
}
</script>
<template>
</template>