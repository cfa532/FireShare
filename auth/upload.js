(async () => {
    try {
        // request, lapi are global variables
        console.log("request=", request);
        
        let sid = request["sid"];
        console.log("sid=", sid);
        let besid = lapi.CreateSession();
        console.log("besid", besid);

        let buf = new ArrayBuffer(request["buffer"]); // file arrayBuffer as parameter
        console.log("buf=", buf.byteLength);
        return 
        const fsid = await lapi.MFOpenTempFile(sid);
        console.log("fsid=", fsid);
        let mid = await readFileSlice(fsid, buf, 0);
        console.log("temp mid=", mid);
        return mid;
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();

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
            return await lapi.MFTemp2Ipfs(fsid);
        } else {
            return await readFileSlice(fsid, arr, start + count);
        }
    } catch (error) {
        console.error("An error occurred in readFileSlice:", error);
        throw error;
    }
}
  