<script setup lang="ts">
import { defineComponent, inject } from "vue"

console.log("Uploader.vue")
interface ScorePair { score: number, member: string }
class FVPair { name = ""; lastModified = 0; size = 0; type = ""; macid = "" }
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}
// export default defineComponent({
// name: "Uploader",
// inject: ["lapi", "fileList"],
const props = defineProps(['content']);
const api: any = inject('lapi');
const fileList: Array<FVPair> = inject('fileList')!;  // it is a Ref!
let file: File;
const message = ""

function onSelect(e: Event) {
  let files = (e as HTMLInputEvent).target.files // || (e as DragEvent).dataTransfer.files;
  if (!files?.length) return;
  file = files[0]
  console.log(file)
};
async function onSubmit() {
  const r = new FileReader();
  const sliceSize = 1024 * 1024 * 1
  r.onerror = e => {
    console.error("Reading failed for ", file.name, e);
  }
  function readFileSlice(fsid: string, start: number) {
    // first slice
    var end = Math.min(start + sliceSize, (r.result as ArrayBuffer)!.byteLength);
    api.client.MFSetData(fsid, r.result!.slice(start, end), start, (count: number) => {
      if (end === (r.result as ArrayBuffer)!.byteLength) {
        // last slice done. Convert to Mac file
        api.client.MFTemp2MacFile(fsid, "", (macid: string) => {
          console.log("Temp file to MacID=", macid);
          // create mmid for this app
          api.client.MMCreate(api.sid, "fireshare", props.content.title, "file_list", 2, "", (mid: string) => {
            console.log("Create MM id=", mid, props.content)
            document.getElementsByTagName("input")[0].value = "" // clear input value
            api.client.MMOpen(api.sid, mid, "cur", (mmsid: string) => {
              console.log("Open MM mmsid=", mmsid);
              var sp: ScorePair = {
                score: Date.now(),
                member: macid
              }
              api.client.Zadd(mmsid, "file_list", sp, (ret: number) => {
                console.log("Zadd ret=", ret)
                let fi = new FVPair()
                fi.name = file.name,
                  fi.lastModified = file.lastModified,
                  fi.size = file.size,
                  fi.type = file.type
                api.client.Hset(mmsid, "file_list", macid, fi, (ret: number) => {
                  fi.macid = macid
                  console.log("Hset ret=", ret, fi);
                  // fileList.find((e: FVPair) => { return e.macid === macid }) ? null : fileList.value.unshift(fi);
                  fileList.value.unshift(fi);
                }, (err: Error) => {
                  console.error("Hset error=", err)
                })
              }, (err: Error) => {
                console.error("Zadd error=", err)
              })
            }, (err: Error) => {
              console.error("Open MM error=", err)
            })
          }, (err: Error) => {
            console.error("Create MMid error=", err)
          })
        }, (err: Error) => {
          console.error("Temp to Mac error ", err);
        });
      } else {
        readFileSlice(fsid, start + count)
      }
    }, (err: Error) => {
      console.error("set temp file data error ", err);
    })
  }

  r.onload = e => {
    api.client.MFOpenTempFile(api.sid, (fsid: string) => {
      console.log("temp opened", api.sid, fsid);
      readFileSlice(fsid, 0);
    }, (err: Error) => {
      console.error("open temp file error ", err);
    });
  }

  // read uploaded file
  r.readAsArrayBuffer(file);
}
// })
</script>

<template>
  <div>
    <form @submit.prevent="onSubmit" enctype="multipart/form-data">
      <div>
        <input type="file" ref="file" @change="onSelect" />
      </div>
      <div>
        <button>Submit</button>
      </div>
      <div>
        <h5>{{ message }}</h5>
      </div>
    </form>
  </div>
</template>
