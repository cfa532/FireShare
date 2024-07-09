(async () => {
    try {
        // request, lapi are global variables
        console.log("request=", request);
        
        let sid = request["sid"];
        console.log("sid=", sid);
        let besid = lapi.CreateSession();
        console.log("besid", besid);

        let str = request["buffer"]; // file arrayBuffer as parameter
        console.log("buf=", str.length, typeof str);

        const fsid = await lapi.MFOpenTempFile(sid);
        console.log("fsid=", fsid);
        
        let count = await lapi.MFSetData(fsid, stringToByteArray(str), 0);
        console.log("count=", count)
        const cid = await lapi.MFTemp2Ipfs(fsid, "")
        console.log("temp mid=", cid);
        return cid;
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();

function stringToByteArray(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code <= 0x7F) {
            byteArray.push(code);
        } else if (code <= 0x7FF) {
            byteArray.push(0xC0 | (code >> 6));
            byteArray.push(0x80 | (code & 0x3F));
        } else if (code <= 0xFFFF) {
            byteArray.push(0xE0 | (code >> 12));
            byteArray.push(0x80 | ((code >> 6) & 0x3F));
            byteArray.push(0x80 | (code & 0x3F));
        } else if (code <= 0x10FFFF) {
            byteArray.push(0xF0 | (code >> 18));
            byteArray.push(0x80 | ((code >> 12) & 0x3F));
            byteArray.push(0x80 | ((code >> 6) & 0x3F));
            byteArray.push(0x80 | (code & 0x3F));
        }
    }
    return byteArray;
}

function stringToArrayBuffer(str) {
    // Calculate the length of the ArrayBuffer
    var bufferLength = 0;
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code <= 0x7F) {
            bufferLength += 1;
        } else if (code <= 0x7FF) {
            bufferLength += 2;
        } else if (code <= 0xFFFF) {
            bufferLength += 3;
        } else if (code <= 0x10FFFF) {
            bufferLength += 4;
        }
    }

    // Create a Uint8Array with the calculated length
    var buffer = new Uint8Array(bufferLength);

    // Convert each character to its byte value
    var offset = 0;
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code <= 0x7F) {
            buffer[offset++] = code;
        } else if (code <= 0x7FF) {
            buffer[offset++] = 0xC0 | (code >> 6);
            buffer[offset++] = 0x80 | (code & 0x3F);
        } else if (code <= 0xFFFF) {
            buffer[offset++] = 0xE0 | (code >> 12);
            buffer[offset++] = 0x80 | ((code >> 6) & 0x3F);
            buffer[offset++] = 0x80 | (code & 0x3F);
        } else if (code <= 0x10FFFF) {
            buffer[offset++] = 0xF0 | (code >> 18);
            buffer[offset++] = 0x80 | ((code >> 12) & 0x3F);
            buffer[offset++] = 0x80 | ((code >> 6) & 0x3F);
            buffer[offset++] = 0x80 | (code & 0x3F);
        }
    }

    // Return the underlying ArrayBuffer
    return buffer.buffer;
}

async function readFileSlice(fsid, arr, start) {
    try {
        // reading file slice by slice, start at given position
        const sliceSize = 1024 * 1024 * 10; // 10MB per slice of file
        let end = Math.min(start + sliceSize, arr.length);
        console.log("end=", end)
        let count = await lapi.MFSetData(fsid, arr.slice(start, end), start);
        console.log("count=", count)
        // Calculate progress
        console.log('Uploading...', Math.floor(((start + count) / arr.length) * 100) + '%', end, arr.length);

        if (end === arr.length) {
            // last slice read. Convert temp to IPFS file
            return await lapi.MFTemp2Ipfs(fsid, "");
        } else {
            return await readFileSlice(fsid, arr, start + count);
        }
    } catch (error) {
        console.error("An error occurred in readFileSlice:", error);
        throw error;
    }
}
  