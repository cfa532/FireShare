// setup udev to handle external disks plug&play automatically
// Watch journalctl -f to identify the following parameters and add them to udev.rules.


// /etc/udev/rules.d/99-mount-usb.rules 
// ID_PART_ENTRY_TYPE is identical to all EFI partitions, "c12a7328-f81f-11d2-ba4b-00a0c93ec93b" and Microsoft reserved partition
KERNEL=="sd[a-z][0-9]", SUBSYSTEM=="block", ENV{ID_PART_ENTRY_TYPE}!="c12a7328-f81f-11d2-ba4b-00a0c93ec93b", ENV{ID_PART_ENTRY_TYPE}!="e3c9e316-0b5c-4db8-817d-f92df00215ae", ACTION=="add", RUN+="/bin/systemctl start usb-mount@%k.service"
#KERNEL=="sd[a-z][0-9]", SUBSYSTEM=="block", ENV{ID_PART_ENTRY_NAME}!="EFI\x20System\x20Partition", ENV{ID_BUS}=="usb", ENV{ID_TYPE}=="disk", ACTION=="add", RUN+="/bin/systemctl start usb-mount@%k.service"
KERNEL=="sd[a-z][0-9]", SUBSYSTEM=="block", ACTION=="remove", RUN+="/bin/systemctl stop usb-mount@%k.service"

// /etc/systemd/system/usb-mount@.service 
[Unit]
Description=Mount USB Drive on %i
RequiresMountsFor=/run
After=systemd-udevd.service

[Service]
Type=oneshot
RemainAfterExit=true
ExecStart=/usr/local/bin/mount-usb-systemd.sh add %i
ExecStop=/usr/local/bin/mount-usb-systemd.sh remove %i

[Install]
WantedBy=multi-user.target

// /usr/local/bin/mount-usb-systemd.sh 
#!/bin/bash

ACTION=$1
DEVICE=$2

if [ "$ACTION" = "add" ]; then
  LABEL=$(lsblk -o LABEL /dev/${DEVICE} | tail -n 1)
  if [ -z "$LABEL" ]; then
    LABEL=$(lsblk -o PARTLABEL /dev/${DEVICE} | tail -n 1)
  fi
  if [ -z "$LABEL" ]; then
    LABEL=$DEVICE
  fi
  MOUNTPOINT="/mnt/${LABEL}"
  echo "$(date) - Starting script with DEVICE=${DEVICE}, LABEL=${LABEL}, MOUNTPOINT=${MOUNTPOINT}" >> /var/log/mount-usb-systemd.log
  eval $(/sbin/blkid -o udev /dev/${DEVICE})                # Get info for this drive: $ID_FS_LABEL, $ID_FS_UUID, and $ID_FS_TYPE
  #OPTS="umask=0,iocharset=utf8"	# utf8 not recommended for vfat
  if [[ ${ID_FS_TYPE} = "vfat" ]]; then
    OPTS="rw,relatime,users,gid=100,umask=000,shortname=mixed,utf8=1,flush"
  else
    OPTS="umask=0,iocharset=utf8"
  fi
  mkdir -p "${MOUNTPOINT}"
  echo "${MOUNTPOINT}" > "/run/usb-mount-${DEVICE}.mnt"		# remember the MOUNTPOINT in a tmp file, to remove it later
  echo "$(date) - Mounting /dev/${DEVICE} - ${ID_FS_TYPE} to ${MOUNTPOINT} -o ${OPTS}" >> /var/log/mount-usb-systemd.log
  mount -o ${OPTS} /dev/${DEVICE} "${MOUNTPOINT}"
elif [ "$ACTION" = "remove" ]; then
  MOUNTPOINT=$(cat "/run/usb-mount-${DEVICE}.mnt")
  echo "$(date) - Unmounting /dev/${DEVICE} ${MOUNTPOINT}" >> /var/log/mount-usb-systemd.log
  umount "${MOUNTPOINT}"
  #sleep 2
  rmdir "${MOUNTPOINT}"
  rm "/run/usb-mount-${DEVICE}.mnt"
fi

echo "$(date) - Script finished" >> /var/log/mount-usb-systemd.log

// 拔出usb，立刻插入，然后
dmesg
udevadm info -a -p  $(udevadm info -q path -n /dev/sda1)

UDEV  [20797.033516] add      /devices/platform/soc/3f980000.usb/usb1/1-1/1-1.3/1-1.3:1.0/host1/target1:0:0/1:0:0:0/block/sdb/sdb2 (block)
ACTION=add
DEVPATH=/devices/platform/soc/3f980000.usb/usb1/1-1/1-1.3/1-1.3:1.0/host1/target1:0:0/1:0:0:0/block/sdb/sdb2
SUBSYSTEM=block
DEVNAME=/dev/sdb2
DEVTYPE=partition
DISKSEQ=28
PARTN=2
SEQNUM=2119
USEC_INITIALIZED=20796742573
ID_VENDOR=JetFlash
ID_VENDOR_ENC=JetFlash
ID_VENDOR_ID=8564
ID_MODEL=Transcend_8GB
ID_MODEL_ENC=Transcend\x208GB\x20\x20\x20
ID_MODEL_ID=1000
ID_REVISION=8.07
ID_SERIAL=JetFlash_Transcend_8GB_6TGZFJ1R-0:0
ID_SERIAL_SHORT=6TGZFJ1R
ID_TYPE=disk
ID_INSTANCE=0:0
ID_BUS=usb
ID_USB_INTERFACES=:080650:
ID_USB_INTERFACE_NUM=00
ID_USB_DRIVER=usb-storage
ID_PATH=platform-3f980000.usb-usb-0:1.3:1.0-scsi-0:0:0:0
ID_PATH_TAG=platform-3f980000_usb-usb-0_1_3_1_0-scsi-0_0_0_0
ID_PART_TABLE_UUID=c005fa08-62ac-43c7-8001-d913d74483f8
ID_PART_TABLE_TYPE=gpt
ID_DRIVE_THUMB=1
ID_FS_LABEL=8G
ID_FS_LABEL_ENC=8G
ID_FS_UUID=3386-1104
ID_FS_UUID_ENC=3386-1104
ID_FS_VERSION=FAT32
ID_FS_TYPE=vfat
ID_FS_USAGE=filesystem
ID_PART_ENTRY_SCHEME=gpt
ID_PART_ENTRY_UUID=daaf2b75-664a-43bd-97f2-701df2bb7bc8
ID_PART_ENTRY_TYPE=ebd0a0a2-b9e5-4433-87c0-68b6b72699c7
ID_PART_ENTRY_NUMBER=2
ID_PART_ENTRY_OFFSET=411648
ID_PART_ENTRY_SIZE=14848000
ID_PART_ENTRY_DISK=8:16
MAJOR=8
MINOR=18
DEVLINKS=/dev/disk/by-uuid/3386-1104 /dev/disk/by-partuuid/daaf2b75-664a-43bd-97f2-701df2bb7bc8 /dev/disk/by-id/usb-JetFlash_Transcend_8GB_6TGZFJ1R-0:0-part2 /dev/disk/by-label/8G /dev/disk/by-path/platform-3f980000.usb-usb-0:1.3:1.0-scsi-0:0:0:0-part2
TAGS=:systemd:
CURRENT_TAGS=:systemd:

UDEV  [20797.042562] add      /devices/platform/soc/3f980000.usb/usb1/1-1/1-1.3/1-1.3:1.0/host1/target1:0:0/1:0:0:0/block/sdb/sdb1 (block)
ACTION=add
DEVPATH=/devices/platform/soc/3f980000.usb/usb1/1-1/1-1.3/1-1.3:1.0/host1/target1:0:0/1:0:0:0/block/sdb/sdb1
SUBSYSTEM=block
DEVNAME=/dev/sdb1
DEVTYPE=partition
DISKSEQ=28
PARTN=1
PARTNAME=EFI System Partition
SEQNUM=2118
USEC_INITIALIZED=20796742828
ID_VENDOR=JetFlash
ID_VENDOR_ENC=JetFlash
ID_VENDOR_ID=8564
ID_MODEL=Transcend_8GB
ID_MODEL_ENC=Transcend\x208GB\x20\x20\x20
ID_MODEL_ID=1000
ID_REVISION=8.07
ID_SERIAL=JetFlash_Transcend_8GB_6TGZFJ1R-0:0
ID_SERIAL_SHORT=6TGZFJ1R
ID_TYPE=disk
ID_INSTANCE=0:0
ID_BUS=usb
ID_USB_INTERFACES=:080650:
ID_USB_INTERFACE_NUM=00
ID_USB_DRIVER=usb-storage
ID_PATH=platform-3f980000.usb-usb-0:1.3:1.0-scsi-0:0:0:0
ID_PATH_TAG=platform-3f980000_usb-usb-0_1_3_1_0-scsi-0_0_0_0
ID_PART_TABLE_UUID=c005fa08-62ac-43c7-8001-d913d74483f8
ID_PART_TABLE_TYPE=gpt
ID_DRIVE_THUMB=1
ID_FS_LABEL=EFI
ID_FS_LABEL_ENC=EFI
ID_FS_UUID=67E3-17ED
ID_FS_UUID_ENC=67E3-17ED
ID_FS_VERSION=FAT32
ID_FS_TYPE=vfat
ID_FS_USAGE=filesystem
ID_PART_ENTRY_SCHEME=gpt
ID_PART_ENTRY_NAME=EFI\x20System\x20Partition
ID_PART_ENTRY_UUID=2dbd2389-ab0d-4f27-99cc-8c92bfc6b2aa
ID_PART_ENTRY_TYPE=c12a7328-f81f-11d2-ba4b-00a0c93ec93b
ID_PART_ENTRY_NUMBER=1
ID_PART_ENTRY_OFFSET=40
ID_PART_ENTRY_SIZE=409600
ID_PART_ENTRY_DISK=8:16
UDISKS_IGNORE=1
MAJOR=8
MINOR=17
DEVLINKS=/dev/disk/by-path/platform-3f980000.usb-usb-0:1.3:1.0-scsi-0:0:0:0-part1 /dev/disk/by-partlabel/EFI\x20System\x20Partition /dev/disk/by-partuuid/2dbd2389-ab0d-4f27-99cc-8c92bfc6b2aa /dev/disk/by-id/usb-JetFlash_Transcend_8GB_6TGZFJ1R-0:0-part1 /dev/disk/by-label/EFI /dev/disk/by-uuid/67E3-17ED
TAGS=:systemd:
CURRENT_TAGS=:systemd:


