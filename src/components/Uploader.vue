<script setup lang="ts">
import { inject, reactive } from "vue"

console.log("Uploader.vue")
// interface ScorePair { score: number, member: string }
class FVPair { name = ""; lastModified = 0; size = 0; type = ""; macid = "" }
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}
// export default defineComponent({
// name: "Uploader",
// inject: ["lapi", "fileList"],
const props = defineProps(['content']);   // ColoumnContent Type
const api: any = inject('lapi');
const fileList: FVPair[] = inject('fileList')!;  // it is a Ref!
const message = "";
let file: File;
const classModal = reactive({
      display: "none",
      position: "fixed",
      'z-index': 1,
      overflow: "auto",
      left:0, top:0, width:"100%", height:"100%",
      'background-color': "rgb(0,0,0,0.4)",
      // 'background-color': "rgb(0,0,0,0.4)",
});

function onSelect(e: Event) {
  let files = (e as HTMLInputEvent).target.files // || (e as DragEvent).dataTransfer.files;
  if (!files?.length) return;
  file = files[0]
  console.log(file)
};
function onSubmit() {
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
function showModal(e: MouseEvent) {
  // show modal box
  classModal.display = "block"
}
// When the user clicks on <span> (x), close the modal
function closeModal(e: MouseEvent) {
  classModal.display = "none"
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(e: MouseEvent) {
  var modal = document.getElementById("myModal");
  if (e.target == modal) {
    classModal.display = "none";
  }
}
// })
</script>

<template>
<div class="postbox">
  <p @click="showModal" class="postbox">Tell us what is happening....</p>
</div>
<div id="myModal" :style="classModal">
  <div class="modal-content">
    <!-- <span class="close" @click="closeModal">&times;</span> -->
    <form @submit.prevent="onSubmit" enctype="multipart/form-data">
    <div style="width:99%; height:110px; margin: 0 0 15px 0;">
      <textarea style="width:100%; height:100%"></textarea>
    </div>
    <div style="">
        <input type="file" ref="file" @change="onSelect" />
        <button style="float: right;">Submit</button>
    </div>
    </form>
  </div>
</div>
</template>

<style>
/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 26px;
  font-weight: bold;
}
.close:hover, .close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
.modal-content {
  border-radius: 5px;
  background-color: #fefefe;
  margin: 5% 15% 5% 2%;
  padding: 10px;
  border: 1px solid #888;
  width: 70%;
  height: 150px;
  max-width: 800px;
}
p.postbox {
  font-style: italic;
  opacity: 0.3;
  margin: 10px 0px 0px 20px;
}
p.postbox:hover {
  opacity: 0.6;
}
div.postbox {
  display: flex;
  background-color:#f9f9f9;
  width: 100%;
  max-width: 600px;
  height: 40px;
  margin: 0px 0px 10px 0px;
  box-shadow: 0px 2px 2px 0px rgba(0,0,0,0.2);
  cursor: text;
}
</style>