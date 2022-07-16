<script lang="ts">
import { defineComponent, computed } from "vue";
import Uploader from "./Uploader.vue"
console.log("FileList.vue")
interface ScorePair {score:number, member:string}
declare interface FVPair {name:string, lastModified:number, size:number, type:string, macid:string}
      
let api: any = {}

export default defineComponent({
    name: "FileList",
    components: { Uploader },
    inject:["lapi"],    // Leither api handler
    data() {
        return {
            fileList: [] as FVPair[],
            query: JSON.parse(this.$route.params.content as string),
        }
    },
    provide() {
        return {
            // inject a whole array
            fileList: computed(() => this.fileList)
        }
    },
    methods: {
        loadFile: function(file: FVPair) {
            console.log("load file content", file.macid, file.size)
            api.client.MFOpenMacFile(api.sid, api.mid, file.macid, (fsid:string)=>{
                console.log("Open file fsid=", fsid)
                api.client.MFGetData(fsid, 0, -1, (buf:ArrayBuffer)=>{
                    // arraybuffer
                    const blob = new Blob([buf], { type: file.type });
                    // const blob = new Blob([buf], { type: 'application/octet-stream' });
                    console.log(buf.byteLength, blob)
                    window.open(URL.createObjectURL(blob))
                }, (err:Error)=>{
                    console.error("Get File data error=", err)
                })
            }, (err:Error)=>{
                console.error("Open file error=", err)
            })
        },
    },
    mounted() {
        api = (this as any).lapi    // window.lapi
        api.client.MMCreate(api.sid,"fireshare", this.query.title, "file_list", 2, "", (mid:string)=>{
            api.mid=mid
            console.log("Load MM id=", mid);
            api.client.MMOpen(api.sid, mid, "cur", (mmsid:string)=>{
                console.log("Open MM mmsid=", mmsid);
                // var sc = Data.now()
                api.client.Zrange(mmsid, "file_list", 0, 100, (sps:[])=>{
                    console.log("Score pair lists", sps)
                    sps.forEach((element:ScorePair) => {
                        api.client.Hget(mmsid, "file_list", element.member, (fi:FVPair)=>{
                            fi.macid = element.member
                            console.log("file: ", fi)
                            this.fileList.push(fi)
                        }, (err:Error)=>{
                            console.error("Hget error=", err)
                        })
                    });
                }, (err:Error)=>{
                    console.error("Zrange error=", err)
                })
            }, (err:Error)=>{
                console.error("MMOpen error=", err)
            })
        }, (err:Error)=>{
            console.error("MM Create error=", err)
        })
    },
})
</script>

<template>
<table cellspacing="0" cellpadding="8" width="100%">
    <tbody>
        <tr>
            <td bgcolor="#FFFFFF">
                <b><RouterLink :to="{name: 'main'}">人人为我 我为人人</RouterLink> -&gt; 
                <RouterLink :to="{name: 'filelist', query:query}">{{query.titleZh}}</RouterLink></b>
            </td>
            <td bgcolor="#FFFFFF" align="right"><b><a href="#">登录</a> -&gt; <a href="#">注册</a></b>
            </td>
        </tr>
    </tbody>
</table>
<div>
    <Uploader :content=query></Uploader>
        <hr/>
    <div v-for="(file, index) in fileList" :key="index">
        <a href="#" ref="file"  @click.prevent="loadFile(file)">{{file.name}}</a>
    </div>
</div>
</template>