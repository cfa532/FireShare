<script lang="ts">
import { defineComponent, computed, reactive } from "vue";
import Uploader from "./Uploader.vue";
import NaviBar from "./NaviBar.vue";
import MyDir from './Gadget/Dir.vue';
console.log("FileList.vue")
// interface ScorePair {score:number, member:string}
interface FVPair {name:string, lastModified:number, size:number, type:string, macid:string}
let api: any = {}

export default defineComponent({
    name: "FileList",
    components: { Uploader, NaviBar, MyDir},
    inject:["lapi"],    // Leither api handler
    data() {
        return {
            fileList: [] as FVPair[],
            localFiles: [] as any[],
            macid: "",
            fileType: "",
            query : computed(()=>{
                let p = localStorage.getItem("currentColumn")
                console.log("current column,", p)
                return p ? JSON.parse(p) : {title: "News", titleZh:"最新文档"}
            }),
            localRoot: '/',     // root directory to local files in webdav
        }
    },
    provide() {
        return {
            // inject a whole array
            fileList: computed(() => this.fileList)
        }
    },
    methods: {
        uploaded(fi: FVPair) {
            // add newly uploaded file to display list
            this.fileList.unshift(fi)
        },
        fileDownload(e: MouseEvent, file: any){
            api.client.MFOpenMacFile(api.sid, api.mid, file.macid, (fsid: string) => {
                // show Mac file in MM database
                var a = document.createElement("a");
                    a.href = api.baseUrl + "mf?mmsid="+ fsid
                    a.download = file.fName;
                    a.type =  file.type;
                    console.log(a)
                    a.click();
            }, (err: Error) => {
                console.error("Open file error=", err)
            })
        }
    },
    mounted() {
        api = (this as any).lapi    // window.lapi
        if (this.query.title === "Webdav") {
            // load files in webdav folder
            api.client.MFOpenByPath(api.sid, "mmroot", '/', 0, (mmfsid:string)=>{
                api.client.MFReaddir(mmfsid, (files:any[])=>{
                    console.log("Read /root", files)
                    this.localFiles = files
                })
            }, (err:Error)=>{
                console.error("Open path err=", err)
            })
            return
        }
        api.client.MMCreate(api.sid,"fireshare", this.query.title, "file_list", 2, "", (mid:string)=>{
            // each colume is one MM
            api.mid=mid;        // shall be the same as MM created by Uploader
            console.log("Load MM id=", mid);
            api.client.MMOpen(api.sid, mid, "cur", (mmsid:string)=>{
                api.mmsid = mmsid
                console.log("Open MM mmsid=", api.mmsid);
                // var sc = Data.now()
                api.client.Zrange(mmsid, "file_list", 0, 100, (sps:[])=>{
                    console.log("Score pair lists", sps)
                    sps.forEach((element:ScorePair) => {
                        api.client.Hget(mmsid, "file_list", element.member, (fi:FVPair)=>{
                            fi.macid = element.member
                            console.log("file: ", fi)
                            this.fileList.push(fi)
                            this.fileList.sort((a,b) => a.macid < b.macid ? -1 : 1)
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
<NaviBar :column=query.titleZh></NaviBar>
    <hr/>
<div v-if="query.title!=='Webdav'">
    <Uploader @uploaded="uploaded" :content=query></Uploader>
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li class="fileList" v-for="(file, index) in fileList" :key="index">
        <a v-if="['pdf', 'doc'].includes(file.name.substring(file.name.length-3).toLowerCase())"
            href="" @click.prevent="(e)=>fileDownload(e, file)" download>{{file.name}} &dArr;
        </a>
        <RouterLink v-else
            :to="{ name:'fileview', params:{macid:file.macid, fileType:file.type}}">{{file.name}}
        </RouterLink>
    </li>
    </ul>
</div>
<div v-else>
    <MyDir :filePath="localRoot"></MyDir>
</div>
</template>

