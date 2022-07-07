<script lang="ts">
import { defineComponent } from "vue"

console.log("Uploader.vue")
interface ScorePair {score:number, member:string}
class FVPair {name=""; lastModified=0; size=0; type=""; macid=""}
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

export default defineComponent({
  name: "Uploader",
  inject: ["lapi", "fileList"],
  data() {
    return {
      file: {} as File,
      message: "",
    }
  },
  methods: {
    onSelect(e: Event) {
      let files = (e as HTMLInputEvent).target.files // || (e as DragEvent).dataTransfer.files;
      if (!files?.length) return;
      this.file = files[0]
      console.log(this.file)
    },
    async onSubmit() {
      const api = (this as any).lapi    // window.lapi
      const fileList = (this as any).fileList
      // console.log("onsubmit", fileList)
      const r = new FileReader();
      const sliceSize = 1024*1024*1
      r.onerror = e=> {
        console.error("Reading failed for ", this.file.name, e);
      }
      function readFileSlice(fsid:string, start:number) {
        // first slice
        var end = Math.min(start+sliceSize, (r.result as ArrayBuffer)!.byteLength);
        api.client.MFSetData(fsid, r.result!.slice(start, end), start, (count:number)=>{
          if (end===(r.result as ArrayBuffer)!.byteLength) {
            // last slice done. Convert to Mac file
            api.client.MFTemp2MacFile(fsid, "", (macid:string)=>{
              console.log("Temp file to MacID=", macid);
              // create mmid for this app
              api.client.MMCreate(api.sid,"","","file_list", 2, "", (mid:string)=> {
                console.log("Create MM id=", mid)
                document.getElementsByTagName("input")[0].value= "" // clear input value
                api.client.MMOpen(api.sid, mid, "cur", (mmsid:string)=>{
                  console.log("Open MM mmsid=", mmsid);
                  var sp:ScorePair = {
                    score: Date.now(),
                    member: macid
                  }
                  api.client.Zadd(mmsid, "file_list", sp, (ret:number)=>{
                    console.log("Zadd ret=", ret)
                    let fi = new FVPair()
                    fi.name = _this.file.name,
                    fi.lastModified = _this.file.lastModified,
                    fi.size = _this.file.size,
                    fi.type = _this.file.type
                    api.client.Hset(mmsid, "file_list", macid, fi, (ret:number)=>{
                      fi.macid = macid
                      console.log("Hset ret=", ret, fi);
                      fileList.find((e:FVPair)=>{return e.macid===macid}) ? null:fileList.unshift(fi);
                    }, (err:Error)=>{
                      console.error("Hset error=", err)
                    })
                  }, (err:Error)=>{
                    console.error("Zadd error=", err)
                  })
                }, (err:Error)=>{
                  console.error("Open MM error=", err)
                })
              }, (err:Error)=>{
                console.error("Create MMid error=", err)
              })
            }, (err:Error)=>{
              console.error("Temp to Mac error ", err);
            });
          } else {
            readFileSlice(fsid, start+count)
          }
        }, (err:Error)=>{
          console.error("set temp file data error ", err);
        })
      }

      r.onload = e=> {
        api.client.MFOpenTempFile(api.sid, (fsid:string) => {
          console.log("temp opened", api.sid, fsid);
          readFileSlice(fsid, 0);
        }, (err:Error)=> {
          console.error("open temp file error ", err);
        });
      }

      // read uploaded file
      let _this = this
      r.readAsArrayBuffer(_this.file);
    } 
  }
})
</script>

<template>
<div class="file">
  <form @submit.prevent="onSubmit" enctype="multipart/form-data">
    <div class="fields">
      <input
        type="file"
        ref="file"
        @change="onSelect"
      />
    </div>
    <div class="fields">
      <button>Submit</button>
    </div>
    <div class="message">
      <h5>{{message}}</h5>
    </div>
  </form>
</div>
</template>
