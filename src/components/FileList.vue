<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useLeither, useMimei } from '../stores/lapi';
import Uploader from "./Uploader.vue";
import NaviBar from "./NaviBar.vue";
import MyDir from './Gadget/Dir.vue';
import Pager from "./Gadget/Pager.vue";
import { storeToRefs } from 'pinia';
interface FVPair {name:string, lastModified:number, size:number, type:string, macid:string}
let api: any = null;
let fullList = ref();

export default defineComponent({
    name: "FileList",
    components: { Uploader, NaviBar, MyDir, Pager},
    // inject:["lapi"],    // Leither api handler
    data() {
        return {
            fileList: [] as FVPair[],
            localFiles: [] as any[],
            localRoot: '/',     // root directory to local files in webdav
            currentPage: ref(1),
            pageSize: ref(20),
            itemNumber: ref(1),
            // api: ref({}),
        }
    },
    computed: {
        mmInfo: ()=> useMimei(),
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
            this.itemNumber += 1;
            // location.reload()
        },
        fileDownload(e: MouseEvent, file: any){
            api.client.MFOpenMacFile(api.sid, this.mmInfo.mid, file.macid, (fsid: string) => {
                api.client.MFGetData(fsid, 0, -1, (fileData:Uint8Array)=>{
                    useMimei().downLoadByFileData(fileData, file.name, "")
                }, (err: Error) => {
                    console.error("Getdata error=", err)
                })
            }, (err: Error) => {
                console.error("Open file error=", err)
            })
        },
        pageChanged(n: number) {
            this.currentPage = n
            console.log("current page=", n)
            getFileList(fullList.value, this)
        },
        fileName(file: FVPair) {
            if (file.type.includes("page")) {
                // show first 30 chars if the list item is a page
                const title = JSON.parse(file.name)[0]
                if (title.trim()==="") {
                    return "Page without text"
                }
                return JSON.parse(file.name)[0].substring(0, 30)
            }
            return file.name
        }
    },
    mounted() {
        const {...c} = storeToRefs(this.mmInfo)
        console.log("FileList mounted", c.column.value)
        api = useLeither();
        if (this.mmInfo.column.title === "Webdav") {
            // load files in webdav folder
            api.client.MFOpenByPath(api.sid, "mmroot", '/', 0, (mmfsid: string) => {
                api.client.MFReaddir(mmfsid, (files: any[]) => {
                    // console.log("Read /root", files)
                    this.localFiles = files
                })
            }, (err: Error) => {
                console.error("Open path err=", err)
            })
            return
        };
        api.client.MMCreate(api.sid, "fireshare", this.mmInfo.column.title, "file_list", 2, "", (mid: string) => {
            // each colume is one MM
            api.client.MMOpen(api.sid, mid, "cur", (mmsid: string) => {
                this.mmInfo.setMMInfo(mid, mmsid);
                api.client.Zrange(mmsid, "file_list", 0, -1, (sps: []) => {
                    fullList.value = sps.reverse()
                    this.itemNumber = sps.length
                    getFileList(sps, this)
                }, (err: Error) => {
                    console.error("Zrange error=", err)
                })
            }, (err: Error) => {
                console.error("MMOpen error=", err)
            })
        }, (err: Error) => {
            console.error("MM Create error=", err)
        })
    },
})
function getFileList(sps:[], that: any) {
    var st = (that.currentPage-1)*that.pageSize
    that.fileList.length = 0
    sps.slice(st, st+that.pageSize).forEach((element:ScorePair) => {
        api.client.Hget(that.mmInfo.mmsid, "file_list", element.member, (fi:FVPair)=>{
            if (!fi) {
                console.log("mac file without info", element)
                return
            }
            fi.macid = element.member
            // temporarily use timestamp when the file is added to the SocrePairs, for sorting
            fi.lastModified = element.score;
            that.fileList.push(fi)
            that.fileList.sort((a:FVPair,b:FVPair) => a.lastModified > b.lastModified ? -1 : 1)
        }, (err:Error)=>{
            console.error("Hget error=", err, element, that.mmInfo)
        })
    });
}

</script>

<template>
<NaviBar :column=mmInfo.column.titleZh></NaviBar>
    <hr/>
<div v-if="mmInfo.column.title!=='Webdav'">
    <Uploader @uploaded="uploaded"></Uploader>
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li class="fileList" v-for="(file, index) in fileList" :key="index">
        <RouterLink v-if="file.type.includes('image') || file.type.includes('video') 
            || file.type.includes('page') || file.type.includes('pdf')"
            :to="{ name:'fileview', params:{macid:file.macid, fileType:file.type}}">{{fileName(file)}}
        </RouterLink>
        <a v-else
            href="" @click.prevent="(e)=>fileDownload(e, file)" download>{{file.name}} &dArr;
        </a>
    </li>
    </ul>
    <Pager v-if="itemNumber/pageSize>1" @page-changed="pageChanged"
        :current-page="currentPage" :page-size="pageSize" :item-number="itemNumber"></Pager>
</div>
<div v-else>
    <MyDir :filePath="localRoot"></MyDir>
</div>
</template>

