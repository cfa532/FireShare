<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import Uploader from "./Uploader.vue";
import NaviBar from "./NaviBar.vue";

console.log("FileList.vue")
// interface ScorePair {score:number, member:string}
declare interface FVPair {name:string, lastModified:number, size:number, type:string, macid:string}
      
let api: any = {}
// let p = localStorage.getItem("currentColumn")
// const query = p ? JSON.parse(p) : {title: "News", titleZh:"最新文档"}

export default defineComponent({
    name: "FileList",
    components: { Uploader, NaviBar},
    inject:["lapi"],    // Leither api handler
    data() {
        return {
            fileList: [] as FVPair[],
            macid: "",
            fileType: "",
            query : computed(()=>{
                let p = localStorage.getItem("currentColumn")
                console.log("current column,", p)
                return p ? JSON.parse(p) : {title: "News", titleZh:"最新文档"}
            })
        }
    },
    provide() {
        return {
            // inject a whole array
            fileList: computed(() => this.fileList)
        }
    },
    mounted() {
        api = (this as any).lapi    // window.lapi
        api.client.MMCreate(api.sid,"fireshare", this.query.title, "file_list", 2, "", (mid:string)=>{
            api.mid=mid;        // shall be the same as MM created by Uploader
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
<!-- <PostBox></PostBox> -->
<div>
    <Uploader :content=query></Uploader>
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li class="fileList" v-for="(file, index) in fileList" :key="index">
        <RouterLink
            :to="{ name:'fileview', params:{macid:file.macid, fileType:file.type}}">{{file.name}}
        </RouterLink>
        <!-- <a href="#" ref="file"  @click.prevent="loadFile(file)">{{file.name}}</a> -->
    </li>
    </ul>
</div>
</template>

