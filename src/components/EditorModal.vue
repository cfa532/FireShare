<script setup lang="ts">
import { CSSProperties, onMounted, onBeforeUnmount, ref, reactive, watch, computed } from "vue";
import Preview from "./Gadget/Preview.vue";
import { useLeither, useMimei, useSpinner } from '../stores/lapi'
const api = useLeither();
const mmInfo = useMimei();
class FileInfo{
  name; lastModified; size; type; caption; mid;
  constructor(name: string, lastModified: number, size: number, type: string, caption:string="") {
    this.name = name;
    this.lastModified = lastModified;
    this.size = size;
    this.type = type;
    this.caption = caption;   // Displayed in File List view
    this.mid = "";
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
const uploadProgress = reactive<number[]>([]); // New ref to store upload progress of each file

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
  console.log("Editor mount", props)
  window.addEventListener("click", onClickOutside);
})
function onSelect(e: Event) {
  let files = (e as HTMLInputEvent).target.files || (e as DragEvent).dataTransfer?.files;
  if (!files) return
  Array.from(files).forEach(f => {
    if (filesUpload.value.findIndex((e:File) => { return e.name === f.name && e.size === f.size && e.lastModified === f.lastModified }) === -1) {
      // filter duplication
      console.log(f)
      if (inpCaption.value === "" || !inpCaption.value) {
        inpCaption.value = f.name
      }
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
// Function to upload files and store them as IPFS or Mimei type
async function uploadFile(files: File[]): Promise<PromiseSettledResult<FileInfo>[]> {
  // Helper function to handle individual file uploads
  async function uploadSingleFile(file: File, index: number): Promise<FileInfo> {
    // Check if the file size exceeds the limit (200MB in this example)
    if (file.size > sliceSize * 30) {
      throw new Error("Max file size exceeded");
    }
    // Assign initial progress value
    uploadProgress[index] = 0;
    // Create a temporary file
    const fsid = await api.client.MFOpenTempFile(api.sid);
    // Create a FileInfo object with file name, last modified time,
    const fi = new FileInfo(file.name, file.lastModified, file.size, file.type);
    fi.mid = await readFileSlice(fsid, await file.arrayBuffer(), 0, index);   // actually an IPFS id
    
    // Save non-media files as Mimei type, for easy download and open
    if (fi.type.search(/(image|video|audio)/i) === -1) {
      const mid = await api.client.MMCreate(api.sid, "", "", "{{auto}}", 1, 0x07276705);
      await api.client.MFSetCid(api.sid, mid, fi.mid);
      fi.mid = mid;
      // await api.client.MMBackup(api.sid, fi.mid, "")   // not a real mm, backup will throw error
    }
    // Add MM reference to the database mimei, which will be published together.
    console.log(fi)
    await api.client.MMAddRef(api.sid, mmInfo.mid, fi.mid);
    return fi;
  }

  // Use Promise.allSettled to wait for all file upload operations to complete
  const uploadPromises = files.map((file,i) => uploadSingleFile(file, i).catch(e => e));
  return Promise.allSettled(uploadPromises);
}
async function onSubmit() {
  if (!inpCaption.value || inpCaption.value!.trim()==="" || (filesUpload.value.length===0 && textValue.value.trim() === "")) {
    // remind user to input caption, autofocus
    caption.value?.focus()
    return;
  }
  useSpinner().setLoadingState(true)
  
  // if one file uploaded, without content in textArea, upload single file
  // otherwise, upload a html file for iFrame
  try {
    // reopen the DB mimei as cur version, for writing
    let mmsidCur = await mmInfo.mmsidCur;
    let fvPairs = (await uploadFile(filesUpload.value))
      .filter( v=> {return v.status==='fulfilled';})
      .map((v:any)=>{return {field: v.value.mid, value: v.value}});
    console.log("uploaded files", fvPairs);
  
    if (fvPairs.length === 1 && textValue.value.trim() === "") {
      // single file uploaded without text input
      // now save {mid, fileInfo} as FV pair and bakcup mm DB
      // so FileInfo can be found by its mid.
      fvPairs[0].value["caption"] = inpCaption.value!.trim();
      await api.client.Hmset(mmsidCur, props.column, ...fvPairs);

      // create MM database for the column, new item is added to this MM.
      // add new itme to index table of ScorePair
      let ret = await api.client.Zadd(mmsidCur, props.column, new ScorePair( Date.now(), fvPairs[0].value["mid"]))
      console.log("Zadd ScorePair for the file, ret=", ret, props.column)
      // back mm data for publish
      await mmInfo.backup()

      // emit an event with infor of newly uploaded file
      emit('uploaded', fvPairs[0].value)
      // clear up
      localStorage.setItem("tempTextValueUploader", "")
      filesUpload.value = [];   // clear file list of upload
      textValue.value = ""
      inpCaption.value = ""
    } else {
      // upload a full webpage with attachments and/or content text
      await api.client.Hmset(mmsidCur, props.column, ...fvPairs);

      // create a file type PAGE. use Name field to save a string defined as:
      // 1st item is input of textarea, followed by mids of uploaded file
      let s = JSON.stringify([textValue.value].concat(fvPairs.map(e=>e.field)))
      let fi = new FileInfo(s, Date.now(), s.length, "page", inpCaption.value!.trim());   // save it in name field
      fi.mid = await api.client.MMCreate(api.sid, '', '', '{{auto}}', 1, 0x07276705);
      let fsid = await api.client.MMOpen(api.sid, fi.mid, "cur")
      await api.client.MFSetObject(fsid, fi)
      // api.client.timeout = 30000;
      await api.client.MMBackup(api.sid, fi.mid, "")
      await api.client.MMAddRef(api.sid, mmInfo.mid, fi.mid)

      // add new page file to index table
      let ret = await api.client.Hset(mmsidCur, props.column, fi.mid, fi)
      ret = await api.client.Zadd(mmsidCur, props.column, new ScorePair(Date.now(), fi.mid))
      console.log("Zadd ver=", fi, ret)
      
      // back mm data for publish
      await mmInfo.backup()

      emit('uploaded', fi)
      localStorage.setItem("tempTextValueUploader", "")
      filesUpload.value = [];   // clear file list of upload
      textValue.value = "";
      inpCaption.value = ""
    }
  } catch(err) {
    console.error("Onsubmit err=", err);
  } finally {
    useSpinner().setLoadingState(false)
  }
}
async function readFileSlice(fsid: string, arr: ArrayBuffer, start: number, index: number):Promise<string> {
  // reading file slice by slice, start at given position
  var end = Math.min(start + sliceSize, arr.byteLength);
  let count = await api.client.MFSetData(fsid, arr.slice(start, end), start);
  // Calculate progress
  uploadProgress[index] = Math.floor((start + count) / arr.byteLength * 100);
  console.log("Uploading...", uploadProgress[index]+"%")

  if (end === arr.byteLength) {
    // last slice done. Convert temp to IPFS file
    // return temp2Ipfs(fsid);   // return a Promise, no await here
    return await api.client.MFTemp2Ipfs(fsid, mmInfo.mid)
  } else {
    return readFileSlice(fsid, arr, start + count, index)
  }
}

function removeFile(f: File) {
  // removed file from preview list
  var i = filesUpload.value.findIndex((e:File) => e==f);
  filesUpload.value.splice(i, 1)
}
// When the user clicks anywhere outside of the modal, close it
const onClickOutside = (e: MouseEvent) => {
  if (e.target == myModal.value) {
    emit("hide")
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("click", onClickOutside);
});
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
            style="border:1px; width:100%; height: 110px; border-radius: 3px;"></textarea>
          <div ref="dropHere" hidden
            style="border: 1px solid lightgrey; width:100%; height:110px; margin: 0px; text-align: center; vertical-align: middle;">
            <p style="font-size: 24px;">DROP HERE</p>
          </div>
        </div>
        <div ref="divAttach" hidden
          style="border: 0px solid lightgray; border-radius: 3px; margin-bottom: 6px; padding-top:0px;" >
          <Preview @file-canceled="removeFile(file)" v-for="(file, index) in filesUpload" :key="index"
            v-bind:src="file" v-bind:progress="uploadProgress[index]"></Preview>
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
