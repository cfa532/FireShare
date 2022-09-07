<script setup lang="ts">
    import { onMounted, inject, shallowRef, ref, Component } from 'vue';
    // import MyImg from './Image.vue'
    const currentProperty = ref<{filePath:string, mmfsid:string, fileType:string}[]>()    // props
    const userComponent = ref<Component[]>()
    // display html page
    const api: any = inject("lapi");    // Leither api handler
    const props = defineProps({
        macid : {type: String, required: false},
        fileType: {type: String, required: false},
        filePath: {type: String, required: false},
        mmfsid: {type: String, required: false},
    });
    const macids = ref([])
    const textContent = ref("")
    onMounted(() => {
        // console.log("Show page:", props)
        // api.client.MFOpenMacFile(api.sid, api.mid, props.macid, (fsid: string) => {
        //     api.client.MFGetObject(fsid, (obj:FVPair)=>{
        //         console.log(obj)
        //         const str = JSON.parse(obj.name)    // get a string[], [0] is the text content
        //         textContent.value = str[0];
        //         macids.value = str.slice(1)
        //         macids.value.forEach(e=>{
        //             // api.client.MFOpenMacFile/
        //         })
        //     })
        // }, (err: Error) => {
        //     console.error("Open file error=", err)
        // })
    })

    function getLink(macid: string) {
        return 
    }
    
    </script>
    
    <template>
        <div id="objViewer" style="width: 100%;">
            <p>{{textContent}}</p>
            <br>
            <div v-for="(macid, index) in macids" :key="index">
                <!-- <component :is="userComponent![index]" v-bind="currentProperty![index]"></component> -->
                <!-- <MyImg :macid="macid"></MyImg> -->
                <span>{{macid}}</span>
            </div>
        </div>
    </template>