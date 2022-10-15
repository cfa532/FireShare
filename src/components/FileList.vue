<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useLeither, useMimei } from '../stores/lapi';
import { useRoute, useRouter } from "vue-router";
import Uploader from "./Uploader.vue";
import NaviBar from "./NaviBar.vue";
import MyDir from './Gadget/Dir.vue';
import Pager from "./Gadget/Pager.vue";
import { storeToRefs } from 'pinia';
// interface FVPair {name:string, lastModified:number, size:number, type:string, macid:string}
let api: any = null;

export default defineComponent({
    name: "FileList",
    components: { Uploader, NaviBar, MyDir, Pager},
    // props: ["page"],    // current page number for paging throgh file list
    data() {
        return {
            fileList: [] as FVPair[],
            localFiles: [] as any[],
            localRoot: '/',             // root directory to local files in webdav
            pageSize: ref(20),
            itemNumber: ref(1),
            route: useRoute(),
            router: useRouter(),
            mmInfo: useMimei(),     // Important: define the Mimei that handles all data in this App
        }
    },
    computed: {
        currentPage() {     // do not use ()=>{}
            return this.route.params.page? parseInt(this.route.params.page as string) : 1
        },
        currentColumn() {
            let c = this.mmInfo.getColumn(this.route.params.title as string)
            if (!c) c=this.mmInfo.naviColumnTree[0]
            return c
        }
    },
    provide() {
        return {
            // inject a whole array
            fileList: computed(()=> this.fileList)
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
            this.router.push({name: "filelist", params:{page:n}})
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
        },
        getFileList() {
            // get mm file list on current page
            let start = (this.currentPage - 1) * this.pageSize
            api.client.Zrevrange(this.mmInfo.mmsid, this.mmInfo.fileName, start, start + this.pageSize, (sps:[])=>{
                console.log("sps=", sps, this.mmInfo.$state)
                this.fileList.length = 0
                sps.forEach((element: ScorePair) => {
                    api.client.Hget(this.mmInfo.mmsid, this.mmInfo.fileName, element.member, (fi: FVPair) => {
                        if (!fi) {
                            console.warn("mac file without info", element)
                            return
                        }
                        fi.macid = element.member
                        // temporarily use timestamp when the file is added to the SocrePairs, for sorting
                        fi.lastModified = element.score;
                        this.fileList.push(fi)
                        this.fileList.sort((a: FVPair, b: FVPair) => a.lastModified > b.lastModified ? -1 : 1)
                    }, (err: Error) => {
                        console.error("Hget error=", err, element, this.mmInfo)
                    })
                });
            }, (err: Error) => {
                console.error("Zrevrange error=", err)
            })
        }
    },
    async mounted() {
        console.log("FileList mounted:", this.currentColumn)
        api = useLeither();
        if (this.currentColumn!.title === "Webdav") {
            // load files in webdav folder
            api.client.MFOpenByPath(api.sid, "mmroot", '/', 0, (mmfsid: string) => {
                api.client.MFReaddir(mmfsid, (files: any[]) => {
                    this.localFiles = files
                })
            }, (err: Error) => {
                console.error("Open path err=", err)
            })
            return
        } else {
            await this.mmInfo.init(api);        // init mimei id, mimei sid, etc...
            api.client.Zcount(this.mmInfo.mmsid, this.mmInfo.fileName, 0, Date.now(), (count: number)=>{     // -1 does not work for stop
                this.itemNumber = count;    // total num of items in the list as a Mimei
                this.getFileList();
            }, (err: Error) => {
                console.error("Zcount error=", err)
            })
        }
    },
    watch: {
        'currentPage'(newVal) {
            this.getFileList();
        }
    },
})


</script>

<template>
<NaviBar :column=currentColumn></NaviBar>
    <hr/>
<div v-if="currentColumn!.title !== 'Webdav'">
    <Uploader @uploaded="uploaded"></Uploader>
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li class="fileList" v-for="(file, index) in fileList" :key="index">
        <RouterLink v-if="file.type.includes('image') || file.type.includes('video') 
                    || file.type.includes('page') || file.type.includes('pdf')"
            :to="{ name:'fileview', params:{title:currentColumn.title, macid:file.macid, fileType:file.type}}">{{fileName(file)}}
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

