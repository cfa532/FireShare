#!/usr/bin/env node
// node version > 18
const child_process = require("child_process");
const fs = require("fs");
const info = console.info;
const loge = console.error;
function runCommand(command) {
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stdout && stdout.trim().length > 0) {
                info("stdout", stdout);
            }
            if (stderr && stderr.trim().length > 0) {
                loge("stderr", command, stderr);
            }
            resolve(stdout.toString().trim());
        });
    });
}
async function mount([suffix, label]) {
    info("mount usb sd: ", suffix, label);
    await runCommand(`mkdir -p "/mnt/${label}"`);
    await runCommand(`sudo mount -o umask=0,iocharset=utf8 /dev/sd${suffix} "/mnt/${label}"`);
}
function rmMntSubDirSyncCatch(label) {
    try {
        fs.rmdirSync(`/mnt/${label}`);
    }
    catch (err) {
        loge(err);
    }
}
async function unMount(label) {
    info("unmount mnt sub dir: ", label);
    await runCommand(`sudo umount "/mnt/${label}"`).catch(loge);
    rmMntSubDirSyncCatch(label);
    info(label, "removed");
}
async function getUsbSdSuffixAndLabel() {
    const usbDevInfo = await runCommand("sudo blkid -d /dev/sd*").catch(e => "");
    return usbDevInfo.split("\n")
        .filter(blkid => blkid !== "" && blkid.match(" UUID="))
        .map(blkid => {
        // blkid => /dev/sdf1: LABEL="DATA" UUID="A2C8-7EE0" TYPE="vfat" PARTUUID="b0e6b548-01"
        const [usbSdPath, optString] = blkid.split(":");
        const usbSdLabelMatched = optString.match(/LABEL="([^"]*)"/);
        const usbSdSuffix = usbSdPath.trim().substring(7); // 去 "/dev/sd" 得 a | b | b1 | c | c1 | c2
        const usbSdLabel = usbSdLabelMatched && usbSdLabelMatched[1] || usbSdSuffix;
        return [usbSdSuffix, usbSdLabel];
    });
}
function getMntSubdirNames() {
    const dirnames = [];
    for (const dirent of fs.readdirSync("/mnt", { withFileTypes: true })) {
        if (dirent.isDirectory()) {
            dirnames.push(dirent.name);
        }
    }
    return dirnames;
}
/**
 * 热插拔
 * 检测dev目录
 * 来新的就 mkdir+mount一下，
 * 走了一个就 umount+rm一下
 *
 * 1. 读取可移动设备
 *    读取dev目录，
 *    过滤 sd[*] -> sda, sdb, sdb1,
 *    去除前两字符 -> a, b, b1, c, c1, c2,
 *    赋值给 devNamesT
 * 2. 过滤
 *    上述结果 devNamesT，
 *    过滤长度小于等于 1的， -> b1, c1, c2
 *    取第一位， -> b, c, c
 *    去重 -> b, c
 * 3. 过滤，过滤后的结果为：
 *    当前需加载的设备（分区）的名称 ，例如 a, b1, c1, c2
 *    1, 2结果取差集，
 *    赋值给 devNames
 *
 *
 * 4.    devNames - curDevNames 即为需加载的设备
 * 5.    curDevNames - devNames 即为需卸载的设备
 */
const mountDevice = debounce(async () => {
    const mntSubdirNames = getMntSubdirNames();
    info("mnt subdir names: ", mntSubdirNames);
    const usbSdSuffixAndLabel = await getUsbSdSuffixAndLabel();
    info("usb sd suffix and label: ", usbSdSuffixAndLabel);
    const notMountedUsbSd = usbSdSuffixAndLabel
        .filter(([suffix], i, arr) => {
        // 过滤：例如 suffix 是 c1, c2 是子分区都需要
        if (suffix.length > 1) {
            return true;
        }
        else {
            // 过滤：例如 suffix 是 a，判断是否存在其他分区，若存在 a 不需要，反之亦然
            const next = arr[i + 1];
            return (!next || suffix !== next[0][0]);
        }
    }).filter(([_, label]) => {
        // 排除已经挂载了的
        return !mntSubdirNames.includes(label);
    });
    await Promise.all(notMountedUsbSd.map(mount));
    info("mounted usb sd:\n", notMountedUsbSd);
    const needUnMountDirNames = mntSubdirNames.filter(dirName => {
        return !usbSdSuffixAndLabel.find(([_, label]) => {
            return label === dirName;
        });
    });
    await Promise.all(needUnMountDirNames.map(unMount));
    info("unmounted mnt sub dir names:\n", needUnMountDirNames);
}, 2000, {
    leading: true,
    trailing: true,
});
runCommand("sudo chmod 777 /mnt")
    .then(() => Promise.all(getMntSubdirNames().map(unMount))) // 1. 卸载所有已有设备
    .then(() => {
    fs.watch("/dev", (eventType, filename) => {
        if (eventType === "change" && filename.startsWith("sd")) {
            mountDevice();
        }
    });
    mountDevice(); // 加载设备
})
    .catch(loge);
function free() {
    fs.unwatchFile("/dev");
}
function debounce(func, wait, options) {
    let lastArgs, lastThis, maxWait, result, timerId, lastCallTime;
    let lastInvokeTime = 0;
    let leading = false;
    let maxing = false;
    let trailing = true;
    const userRAF = (!wait && wait !== 0 && typeof global.requestAnimationFrame === 'function');
    if (typeof func != 'function') {
        throw new TypeError('Expected a function');
    }
    wait = +wait || 0;
    if (isObject(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    function isObject(value) {
        const type = typeof value;
        return value != null && (type === 'object' || type === 'function');
    }
    function invokeFunc(time) {
        const args = lastArgs;
        const thisArg = lastThis;
        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
    }
    function startTimer(pendingFunc, wait) {
        if (userRAF) {
            return global.requestAnimationFrame(pendingFunc);
        }
        return setTimeout(pendingFunc, wait);
    }
    function cancelTimer(id) {
        if (userRAF) {
            return global.cancelAnimationFrame(id);
        }
        clearTimeout(id);
    }
    function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = startTimer(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
    }
    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        timerId = startTimer(timerExpired, remainingWait(time));
    }
    function remainingWait(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = wait - timeSinceLastCall;
        return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }
    function trailingEdge(time) {
        timerId = undefined;
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
    }
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        return (lastCallTime === undefined // 第一次调用
            || (timeSinceLastCall >= wait) // 距离上次被调用已经超过 wait
            || (timeSinceLastCall < 0) //系统时间倒退
            || (maxing && timeSinceLastInvoke >= maxWait) //超过最大等待时间
        );
    }
    function cancel() {
        if (timerId !== undefined) {
            cancelTimer(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
    }
    function flush() {
        return timerId === undefined ? result : trailingEdge(Date.now());
    }
    function pending() {
        return timerId !== undefined;
    }
    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);
        lastArgs = args;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
            if (timerId === undefined) {
                return leadingEdge(lastCallTime);
            }
            if (maxing) {
                timerId = startTimer(timerExpired, wait);
                return invokeFunc(lastCallTime);
            }
        }
        if (timerId === undefined) {
            timerId = startTimer(timerExpired, wait);
        }
        return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    debounced.pending = pending;
    return debounced;
}
