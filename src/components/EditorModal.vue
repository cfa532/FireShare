<script setup lang="ts">
import { CSSProperties, onMounted, ref, watch, computed } from "vue";
import Preview from "./Gadget/Preview.vue";
import { useLeither, useMimei } from '../stores/lapi'
const api = useLeither();
const mmInfo = useMimei();
class FileInfo{
  name; lastModified; size; type; macid; caption;
  constructor(name: string, lastModified: number, size: number, type: string, caption:string="") {
    this.name = name;
    this.lastModified = lastModified;
    this.size = size;
    this.type = type;
    this.macid = "";
    this.caption = caption;   // Displayed in File List view
  }
}
class ScorePair {
  score: number;
  member: any;
  constructor(score: number, member: any) {
    this.score = score;
    this.member = member;
  }
};
interface HTMLInputEvent extends Event { target: HTMLInputElement & EventTarget }
const emit = defineEmits(["uploaded", "hide"])
const form = ref();
const inpCaption = ref()
const textValue = ref("")
const caption = ref<HTMLFormElement>();
const divAttach = ref()
const dropHere = ref()
const textArea = ref()
const myModal = ref()
const sliceSize = 1024 * 1024 * 10    // 10MB per slice of file
const filesUpload = ref<File[]>([]);
const props = defineProps({
    // text : {type: String, required: false},       // text input from editor
    // attachments: {type: [File], required: false},
    display: {type: String, required: false, default:"none"},
    column: {type: String, required: true}
})
const classModal = computed(():CSSProperties=>{
  return {
    display: props.display,
    position: "fixed",
    'z-index': 1,
    overflow: "auto",
    left: 0, top: 0, width: "100%", height: "100%",
    'background-color': "rgb(0,0,0,0.4)",
  }
})
onMounted(async () => {
  await mmInfo.init(api)
  // textValue.value = props.text? props.text : "";
  // filesUpload.value = props.attachments? props.attachments.slice(0) : [];
  console.log("Editor mount", props)
})
function onSelect(e: Event) {
  let files = (e as HTMLInputEvent).target.files || (e as DragEvent).dataTransfer?.files;
  if (!files) return
  Array.from(files).forEach(f => {
    if (filesUpload.value.findIndex((e:File) => { return e.name === f.name && e.size === f.size && e.lastModified === f.lastModified }) === -1) {
      // filter duplication
      console.log(f)
      filesUpload.value.push(f);
    }
  })
  divAttach.value!.hidden = false
  textArea.value!.hidden = false
  dropHere.value!.hidden = true
};
function dragOver(evt: DragEvent) {
  textArea!.value!.hidden = true
  dropHere!.value!.hidden = false
}
function selectFile() {
  document.getElementById("selectFiles")?.click();
}
function uploadFile(files: File[]) {
  return Promise.allSettled(files.map(file => {
    return new Promise<string>(async (resolve, reject) => {
      if (file.size > sliceSize * 5) {
        alert("Max file size 50MB");
        reject("Max file size exceeded");
      };
      api.client.MFOpenTempFile(api.sid, async (fsid: string) => {
        // resolve(readFileSlice(fsid, await file.arrayBuffer(), 0));
        try {
         let macid = await readFileSlice(fsid, await file.arrayBuffer(), 0);
          resolve(macid)
        } catch(err) {
          reject("ReadFileSlice err="+err)
        }
      })
    })
  }))
}
async function onSubmit() {
  if (!inpCaption.value || inpCaption.value!.trim()==="") {
    // remind user to input caption, autofocus
    caption.value?.focus()
    return;
  }
  let mmsidCur:string, macids: string[], fvPairs: FVPair[] = []
  // if one file uploaded, without content in textArea, upload single file
  // otherwise, upload a html file for iFrame
  if (filesUpload.value.length===0 && textValue.value.trim() === "") return
  
  // reopen the DB mimei as cur version, for writing
  try {
    mmsidCur = await mmInfo.mmsidCur;
    macids = (await uploadFile(filesUpload.value))
      .filter((v, i)=>{
        if (v.status==='fulfilled') {         // remove failed promises
          const file = filesUpload.value[i];
          // return array of successfully resolved MacIDs and FileInfos
          fvPairs.push({
            field:v.value,    // macid
            value:new FileInfo(file.name, file.lastModified, file.size, file.type, inpCaption.value!.trim())})
        };
        return v.status==='fulfilled';
      })
      .map((v:any)=>{return v.value});
    console.log(macids, fvPairs);

    // now save macid : fileInfo pair array in a hashtable and bakcup mm DB
    // so FileInfo can be found by its MacId.
    await api.client.Hmset(mmsidCur, props.column, ...fvPairs);
  
    if (macids.length === 1 && textValue.value.trim() === "") {
      // single file uploaded without text input
      // create MM database for the column, new item is added to this MM.
      // add new itme to index table of ScorePair
      let ret = await api.client.Zadd(mmsidCur, props.column, new ScorePair( Date.now(), macids[0]))
      console.log("Zadd ScorePair for the file, ret=", ret, props.column)
      // back mm data for publish
      mmInfo.backup()

      // emit an event with infor of newly uploaded file
      fvPairs[0].value["macid"] = macids[0]
      emit('uploaded', fvPairs[0].value)
      // clear up
      localStorage.setItem("tempTextValueUploader", "")
      filesUpload.value = [];   // clear file list of upload
      textValue.value = ""
      inpCaption.value = ""
    } else {
      // upload a full webpage with attachments or content text
      let fsid = await api.client.MFOpenTempFile(api.sid)
      // create a file type PAGE. use Name field to save a string defined as:
      // 1st item is input of textarea, followed by mac ids of uploaded file
      let s = JSON.stringify([textValue.value].concat(macids))
      let fi = new FileInfo(s, Date.now(), s.length, "page", inpCaption.value!.trim());   // save it in name field
      // console.log("FileInfo=", fi)
      // fi = {} as any;
      // fi["name"] = s;
      // fi["caption"] = inpCaption.value!.trim();
      // fi["lastModified"] = Date.now();
      // fi["size"] = s.length;
      // fi["type"] = "page";
      // console.log("FileInfo=", fi)
      await api.client.MFSetObject(fsid, fi)
      let macid = await api.client.MFTemp2MacFile(fsid, mmInfo.mid)
      let ret = await api.client.Hset(mmsidCur, props.column, macid, fi)
      ret = await api.client.Zadd(mmsidCur, props.column, new ScorePair(Date.now(), macid))
      fi.macid = macid
      console.log("Zadd ret=", ret, fi, props)
      
      // back mm data for publish
      mmInfo.backup()
      emit('uploaded', fi)
      localStorage.setItem("tempTextValueUploader", "")
      filesUpload.value = [];   // clear file list of upload
      textValue.value = "";
      inpCaption.value = ""
    }
  } catch(err) {
    console.error("Onsubmit err=", err);
    return
  }
}
function readFileSlice(fsid: string, arr: ArrayBuffer, start: number): Promise<string> {
  // reading file slice by slice, start at given position
  var end = Math.min(start + sliceSize, arr.byteLength);
  return new Promise((resolve, reject) => {
    api.client.MFSetData(fsid, arr.slice(start, end), start, (count: number) => {
      if (end === arr.byteLength) {
        // last slice done. Convert temp to Mac file
        api.client.MFTemp2MacFile(fsid, mmInfo.mid, (macid: string) => {
          console.log("Temp file to MacID=", macid, ", len=", arr.byteLength);
          // now temp file is converted to Mac file, save file info
          resolve(macid)
        }, (err: Error) => {
          reject("Failed to create Mac file")
        })
      } else {
        resolve(readFileSlice(fsid, arr, start + count))
      }
    }, (err: Error) => {
      reject("Set temp file data error ");
    })
  })
}
function removeFile(f: File) {
  // removed file from preview list
  var i = filesUpload.value.findIndex((e:File) => e==f);
  filesUpload.value.splice(i, 1)
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (e: MouseEvent) {
  // var modal = document.getElementById("myModal");
  if (e.target == myModal.value) {
    emit("hide")
  }
}
watch(() => textValue.value, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    localStorage.setItem("tempTextValueUploader", newVal)
  }
})
</script>

<template> 
  <div ref="myModal" :style="classModal">
    <div class="modal-content" @dragover.prevent="dragOver" @drop.prevent="onSelect">
      <!-- <span class="close" @click="closeModal">&times;</span> -->
      <form @submit.prevent="onSubmit" enctype="multipart/form-data">
        <div style="width:99%; margin-bottom: 10px;">
          <input autofocus type="text" placeholder="Caption...  required" v-model="inpCaption" ref="caption" style="border:0px; width:100%; height:22px; margin-bottom: 8px;">
          <textarea ref="textArea" v-model="textValue" placeholder="Input......"
            style="border:0px; width:100%; height: 110px; border-radius: 3px;"></textarea>
          <div ref="dropHere" hidden
            style="border: 1px solid lightgrey; text-align: center; width:100%; height:100%; margin: 0px;">
            <p style="font-size: 24px">DROP HERE</p>
          </div>
        </div>
        <div ref="divAttach" hidden
          style="border: 0px solid lightgray; border-radius: 3px; margin-bottom: 6px; padding-top:0px;" >
          <Preview @file-canceled="removeFile(file)" v-for="(file, index) in filesUpload" :key="index"
            v-bind:src="file"></Preview>
        </div>
        <div>
          <input id="selectFiles" @change="onSelect" type="file" hidden multiple>
          <button @click.prevent="selectFile">Choose</button>
          <button style="float: right;">Submit</button>
        </div>
      </form>
    </div>
  </div>
</template>
