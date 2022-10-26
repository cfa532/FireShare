<script setup lang="ts">
import { CSSProperties, onMounted, ref, shallowRef, watch, computed, reactive } from "vue";
import Preview from "./Gadget/Preview.vue";
import { useLeither, useMimei } from '../stores/lapi'
import Login from "./Login.vue";
const api = useLeither();
const mmInfo = useMimei();
class FVPair {
  name; lastModified; size; type; macid;
  constructor(name: string, lastModified: number, size: number, type: string) {
    this.name = name;
    this.lastModified = lastModified;
    this.size = size;
    this.type = type;
    this.macid = ""
  }
}
interface HTMLInputEvent extends Event { target: HTMLInputElement & EventTarget }
const emit = defineEmits(["uploaded", "hide"])
const textValue = ref("")
const form = ref();
const divAttach = ref()
const dropHere = ref()
const textArea = ref()
const myModal = ref()
const sliceSize = 1024 * 1024 * 10    // 10MB per slice of file
const filesUpload = ref();
const props = defineProps({
    text : {type: String, required: false},       // text input from editor
    attachments: {type: [File], required: false},
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
  // await mmInfo.init(api)
  textValue.value = props.text? props.text : "";
  filesUpload.value = props.attachments? props.attachments.slice(0) : [];
  console.log("Editor mount", props)
})
function onSelect(e: Event) {
  let files = (e as HTMLInputEvent).target.files || (e as DragEvent).dataTransfer?.files;
  if (!files) return
  Array.from(files).forEach(f => {
    if (filesUpload.value.findIndex((e:File) => { return e.name === f.name && e.size === f.size && e.lastModified === f.lastModified }) === -1) {
      // filter duplication
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
function uploadFile(files: File[], mmsid:string): Promise<string[]> {
  return Promise.all(files.map(file => {
    return new Promise<string>((resolve, reject) => {
      // read uploaded file
      if (file.size > sliceSize * 5) {
        alert("Max file size 50MB");
        reject("Max file size exceeded");
      }
      file.arrayBuffer().then(arrBuf => {
        // arr: arrayBuffer of the file data
        api.client.MFOpenTempFile(api.sid, (fsid: string) => {
          // resolve to macid string
          readFileSlice(fsid, arrBuf, 0).then(async macid => {
            const fileInfo = new FVPair(file.name, file.lastModified, file.size, file.type)
            console.log(fileInfo, macid, "cur mmsid="+mmsid)
            api.client.Hset(mmsid, props.column, macid, fileInfo, (ret: number) => {
              // set field 'macid's value to a 'fileInfo' in hashtable 'file_list'
              console.log("Hset ret=", ret)
              resolve(macid);
            }, (err: Error) => {
              console.log("Hset error " + err)
            })
          })
        }, (err: Error) => {
          console.error("open temp file error ", err);
        });
      });
    })
  }))
}
async function onSubmit() {
  // if one file uploaded, without content in textArea, upload single file
  // otherwise, upload a html file for iFrame
  if (filesUpload.value.length===0 && textValue.value.trim() === "") return
  
  // reopen the DB mimei as cur version
  let mmsidCur = await mmInfo.mmsidCur;

  uploadFile(filesUpload.value, mmsidCur).then(macids => {
    if (macids.length === 1 && textValue.value.trim() === "") {
      // single file uploaded without text input
      const file = filesUpload.value[0];
      // create MM database for the column, new item is added to this MM.
      var sp: ScorePair = {
        score: Date.now(),  // index
        member: macids[0]       // Mac id for the uploaded file, which is converted to Mac file
      }
      api.client.Zadd(mmsidCur, props.column, sp, (ret: number)=>{
        console.log("Zadd ScorePair for the file, ret=", ret, mmInfo.mmsid)
        // back mm data for publish
        mmInfo.backup()
        let fi = new FVPair(file.name, file.lastModified, file.size, file.type)
        // emit an event with infor of newly uploaded file
        fi["macid"] = macids[0]
        emit('uploaded', fi)
        // clear up
        localStorage.setItem("tempTextValueUploader", "")
        filesUpload.value = [];   // clear file list of upload
        textValue.value = ""
      }, (err: Error) => {
        console.error("Zadd error=", err)
      })
    } else {
      // upload a full webpage
      api.client.MFOpenTempFile(api.sid, (fsid: string) => {
        // 1st item is input of textarea, followed by mac ids of uploaded file
        let s = JSON.stringify([textValue.value].concat(macids))
        let fi = new FVPair(s, Date.now(), s.length, "page");   // save it in name field
        api.client.MFSetObject(fsid, fi, ()=>{
          api.client.MFTemp2MacFile(fsid, mmInfo.mid, (macid: string) => {
            api.client.Hset(mmsidCur, props.column, macid, fi, (ret: number) => {
              var sp: ScorePair = {
                score: Date.now(),  // index
                member: macid       // Mac id for the uploaded file, which is converted to Mac file
              }
              api.client.Zadd(mmsidCur, props.column, sp, (ret: number) => {
                fi.macid = macid
                console.log("Zadd ret=", ret, fi, mmsidCur)
                // back mm data for publish
                mmInfo.backup()

                emit('uploaded', fi)
                localStorage.setItem("tempTextValueUploader", "")
                filesUpload.value = [];   // clear file list of upload
                textValue.value = "";
              }, (err: Error) => {
                console.error("Zadd error=", err)
              })
            }, (err: Error) => {
              console.error("Hset error=", err)
            })
          }, (err: Error) => {
            console.error("MFTemp2MacFile error=", err)
          })
        }, (err: Error) => {
          console.error("MFSetData error=", err)
        })
      }, (err: Error) => {
        console.error("MFOpenTempFile error=", err)
      })
    }
  })
}
function readFileSlice(fsid: string, arr: ArrayBuffer, start: number): Promise<string> {
  // reading file slice by slice, start at given position
  var end = Math.min(start + sliceSize, arr.byteLength);
  return new Promise((resolve, reject) => {
    api.client.MFSetData(fsid, arr.slice(start, end), start, (count: number) => {
      if (end === arr.byteLength) {
        // last slice done. Convert temp to Mac file
        api.client.MFTemp2MacFile(fsid, mmInfo.mid, (macid: string) => {
          console.log("Temp file to MacID=", macid);
          // now temp file is converted to Mac file, save file info
          resolve(macid)
        }, (err: Error) => {
          reject("Failed to create Mac file")
        })
      } else {
        readFileSlice(fsid, arr, start + count)
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
        <div style="width:99%; height:110px; margin-bottom: 10px;">
          <textarea autofocus ref="textArea" v-model="textValue" placeholder="Input......"
            style="border:0px; width:100%; height:100%; border-radius: 3px;"></textarea>
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
