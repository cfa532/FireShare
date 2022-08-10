<script setup lang="ts">
import { inject, onMounted, reactive, ref } from "vue"

console.log("Uploader.vue")
// interface ScorePair { score: number, member: string }
class FVPair { name = ""; lastModified = 0; size = 0; type = ""; macid = "" }
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}
// export default defineComponent({
// name: "Uploader",
const props = defineProps(['content']);   // ColoumnContent Type
const emit = defineEmits(["uploaded"])
const api: any = inject('lapi');    // global Leither handler
let file : File | undefined;
let imageUrl = ref("")
let textValue = ref("")
let fileName = ref("")
const form = ref<HTMLFormElement>();
const divAttach = ref<HTMLDivElement>()
const classModal = reactive({
  display: "none",
  position: "fixed",
  'z-index': 1,
  overflow: "auto",
  left:0, top:0, width:"100%", height:"100%",
  'background-color': "rgb(0,0,0,0.4)",
});
const classFiles = reactive({
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
  console.log("DRAG over over")
  evt.preventDefault()
}
function selectFile() {
  document.getElementById("uploadFiles")?.click();
}
function previewSelected(files: FileList) {
  if (files && files[0]) {
    file = files[0]
    fileName.value = file.name
    if (file.type.includes("image")) {
      imageUrl.value = URL.createObjectURL(file)
      divAttach!.value!.hidden = false
    } else {
      divAttach!.value!.hidden = true
    }
  }
}
function onSelect(e: Event) {
  let files = (e as HTMLInputEvent).target.files // || (e as DragEvent).dataTransfer.files;
  previewSelected(files!)
};
function onDrop(evt: DragEvent) {
  previewSelected(evt.dataTransfer?.files!)
}
function onSubmit() {
  const r = new FileReader();
  const sliceSize = 1024 * 1024 * 1
  r.onerror = e => {
    console.error("Reading failed for ", file?.name, e);
  }
  function readFileSlice(fsid: string, start: number) {
    // reading file slice by slice, start at given position
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
                fi.name = file!.name,
                  fi.lastModified = file!.lastModified,
                  fi.size = file!.size,
                  fi.type = file!.type
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
  if (file!.size > 50*1024*1024) {
    alert("Max file size 50MB")
    return
  }  r.readAsArrayBuffer(file!);
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
onMounted(()=>{
  divAttach!.value!.hidden = true
})
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
    <div style="width:99%; height:110px; margin-bottom: 15px;">
      <textarea @drop.prevent="onDrop" @drageover.prevent="dragOver" :value="textValue" style="width:100%; height:100%"></textarea>
    </div>
    <div ref="divAttach" style="border: 1px solid lightgray; border-radius: 3px; margin-bottom: 4px; padding: 5px 0px;">
      <img style="margin-left: 5px; 100px; height:100px; opacity:0.6" :src="imageUrl" />
    </div>
    <div>
        <input id="uploadFiles" @change="onSelect" type="file" ref="file" hidden>
        <button @click.prevent="selectFile">Choose</button>
        <span :style="classFiles">{{fileName}}</span>
        <button style="float: right;">Submit</button>
    </div>
    </form>
  </div>
</div>
</template>

<style>
</style>