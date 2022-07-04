<template>
<div class="file">
    <div v-for="(file, index) in fileList" :key="index">
        <a href="#" ref="file"  @click.prevent="loadFile(file)">{{file.name}}</a>
    </div>
</div>
</template>

<script lang="ts">
console.log("FileList.vue")
interface ScorePair {score:number, member:string}
interface FVPair {name:string, lastModified:number, size:number, type:string, macid:string}
      
let api: any = {}
        const fileList: FVPair[] = []

export default {
    name: "FileList",
    data() {
        return {
            fileList,
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
        }
    },
    created() {
        api = window.lapi._value
    },
    mounted() {
        let self = this
        api.client.MMCreate(api.sid,"","","file_list", 2, "", (mid:string)=>{
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
                            self.fileList.push(fi)
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
    }
}
</script>