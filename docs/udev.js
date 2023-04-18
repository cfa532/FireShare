// setup udev to handle external disks plug&play automatically
// 3 files


// /etc/udev/rules.d/99-mount-usb.rules 
KERNEL=="sd[a-z][0-9]", SUBSYSTEMS=="usb", ACTION=="add", RUN+="/bin/systemctl start usb-mount@%k.service"
KERNEL=="sd[a-z][0-9]", SUBSYSTEMS=="usb", ACTION=="remove", RUN+="/bin/systemctl stop usb-mount@%k.service"

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
#!/bin/sh

ACTION=$1
DEVICE=$2
LABEL=$(lsblk -o LABEL /dev/${DEVICE} | tail -n 1)
MOUNTPOINT="/mnt/${LABEL}"

echo "$(date) - Starting script with DEVICE=${DEVICE}, LABEL=${LABEL}, MOUNTPOINT=${MOUNTPOINT}" >> /var/log/mount-usb-systemd.log

if [ "$ACTION" = "add" ]; then
  mkdir -p "${MOUNTPOINT}"
  echo "${MOUNTPOINT}" > "/run/usb-mount-${DEVICE}.mnt"
  echo "$(date) - Mounting ${DEVICE} to ${MOUNTPOINT}" >> /var/log/mount-usb-systemd.log
  mount /dev/${DEVICE} "${MOUNTPOINT}"
elif [ "$ACTION" = "remove" ]; then
  MOUNTPOINT=$(cat "/run/usb-mount-${DEVICE}.mnt")
  echo "$(date) - Unmounting ${DEVICE} ${MOUNTPOINT}" >> /var/log/mount-usb-systemd.log
  umount "${MOUNTPOINT}"
  rmdir "${MOUNTPOINT}"
  rm "/run/usb-mount-${DEVICE}.mnt"
fi

echo "$(date) - Script finished" >> /var/log/mount-usb-systemd.log
