<script setup lang="ts">
import { CSSProperties, inject, reactive, ref } from "vue";
import Preview from "./Gadget/Preview.vue";
class FVPair { name = ""; lastModified = 0; size = 0; type = ""; macid = "" }
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}
const props = defineProps(['content']);   // ColoumnContent Type
const emit = defineEmits(["uploaded"])
const api: any = inject('lapi');    // global Leither handler
let file = ref<File>();
let textValue = ref("")
const form = ref<HTMLFormElement>();
const divAttach = ref<HTMLDivElement>()
const dropHere = ref<HTMLElement>()
const textArea = ref<HTMLElement>()
const classModal = reactive<CSSProperties>({
  display: "none",
  position: "fixed",
  'z-index': 1,
  overflow: "auto",
  left:0, top:0, width:"100%", height:"100%",
  'background-color': "rgb(0,0,0,0.4)",
});
const classFiles = reactive<CSSProperties>({
  display: 'inline-block',
  'margin-left': "10px",
  'max-width': "600px",
  "font-family": "Arial",
  "font-size": "12px",
  'white-space':'nowrap',
  "overflow": "hidden",
  "text-overflow": "ellipsis",
})
function dragOver(evt: DragEvent) {
  textArea!.value!.hidden = true
  dropHere!.value!.hidden = false
}
function selectFile() {
  document.getElementById("uploadFiles")?.click();
}
const filesUpload = ref<File[]>([])

function onSelect(e: Event) {
  let files = (e as HTMLInputEvent).target.files  || (e as DragEvent).dataTransfer?.files;
  console.log(files)
  if (!files) return
  filesUpload.value = filesUpload.value.concat(Array.from(files!))
  // if (files && files[0]) {
  //   file.value = files[0]
  //   if (file.value.type.includes("image")) {
  //     imageUrl.value = URL.createObjectURL(file.value)
  //   } else {
  //     divAttach!.value!.hidden = true
  //   }
  // }
  divAttach!.value!.hidden = false
  textArea!.value!.hidden = false
  dropHere!.value!.hidden = true
};
function onSubmit() {
  const r = new FileReader();
  const sliceSize = 1024 * 1024 * 10
  r.onerror = e => {
    console.error("Reading failed for ", file.value?.name, e);
  }
  function readFileSlice(fsid: string, file: File, start: number) {
    // reading file slice by slice, start at given position
    var end = Math.min(start + sliceSize, (r.result as ArrayBuffer)!.byteLength);
    api.client.MFSetData(fsid, r.result!.slice(start, end), start, (count: number) => {
      if (end === (r.result as ArrayBuffer)!.byteLength) {
        // last slice done. Convert to Mac file
        api.client.MFTemp2MacFile(fsid, "", (macid: string) => {
          console.log("Temp file to MacID=", macid);
          // create mmid for the column. Each colome (title) is a Mimei database, new item is added to this MM.
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
                  // emit an event with infor of newly uploaded file
                  emit('uploaded', fi)
                  classModal.display = "none"
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
        readFileSlice(fsid, file, start + count)
      }
    }, (err: Error) => {
      console.error("set temp file data error ", err);
    })
  }
  r.onload = e => {
    api.client.MFOpenTempFile(api.sid, (fsid: string) => {
      console.log("temp opened", api.sid, fsid, e);
      readFileSlice(fsid, file.value!, 0);
    }, (err: Error) => {
      console.error("open temp file error ", err);
    });
  }
  // read uploaded file
  if (file.value!.size > 500*1024*1024) {
    alert("Max file size 50MB")
    return
  }
  r.readAsArrayBuffer(file.value!);
}
function showModal(e: MouseEvent) {
  // show modal box
  classModal.display = "block"
}
function removeFile(f: File) {
  var i = filesUpload.value.findIndex( e=> e==f);
  filesUpload.value.splice(i,1)
  console.log(i, filesUpload)
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
  <div class="modal-content" @dragover.prevent="dragOver" @drop.prevent="onSelect">
    <!-- <span class="close" @click="closeModal">&times;</span> -->
    <form @submit.prevent="onSubmit" enctype="multipart/form-data">
    <div style="width:99%; height:110px; margin-bottom: 10px;">
      <textarea ref="textArea" :value="textValue" style="border:0px; width:100%; height:100%; border-radius: 3px;"></textarea>
      <div ref="dropHere" style="border: 1px solid lightgrey; text-align: center; width:100%; height:100%; margin: 0px;" hidden>
        <p style="font-size: 24px">DROP HERE</p>
      </div>
    </div>
    <div ref="divAttach" style="border: 0px solid lightgray; border-radius: 3px; margin-bottom: 6px; padding-top:0px;" hidden>
      <Preview @file-canceled="removeFile(file)" v-for="(file, index) in filesUpload" :key="index" v-bind:src="file" ></Preview>
    </div>
    <div>
        <input id="uploadFiles" @change="onSelect" type="file" hidden multiple>
        <button @click.prevent="selectFile">Choose</button>
        <span :style="classFiles">{{file?.name}}</span>
        <button style="float: right;">Submit</button>
    </div>
    </form>
  </div>
</div>
</template>

<style>
</style>