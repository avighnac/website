# mac-wsl
A tutorial on how to set up a WSL-like Linux virtual machine on Apple silicon macbooks.

<p align="center">
  <img width="775" alt="image" src="https://github.com/user-attachments/assets/be86aac9-9759-4276-820d-8e4d18927a7b" />
</p>

# Introduction

Have you recently switched to macOS and found yourself missing the convenience of `wsl`? On Windows, spinning up a full Linux environment was as easy as typing a command in the terminal. Now, with your new Apple Silicon Mac, not only is `wsl` unavailable, but you're also dealing with an ARM-based architecture—making it even harder to run tools like `valgrind`. It can feel like a developer's nightmare.

Thanks to modern day virtualization technologies, however, setting up a Linux virtual machine on any operating system (macOS, Windows) is really easy if you know what you're doing. However, to my despair, tools like Parallels desktop seem to be the only virtual machine tools ever talked about when it comes to macOS. I've heard stories of many of my friends even paying for Parallels just because they think that's the only option they have.

However, of course this isn't true. Digging a little deeper, you'd find out about [UTM](https://mac.getutm.app/).

<img width="1202" alt="an image from the UTM home page" src="https://github.com/user-attachments/assets/61d55ad5-1bfc-463c-9eb8-b092aa2b27e8" />

UTM is amazing. It isn't talked about often enough. If you're looking for a straightforward virtualization solution, use UTM.

# QEMU

However, in this tutorial, we won't be using UTM. We'll be using the tool UTM is based on: [QEMU](https://www.qemu.org/). QEMU is a classic, and again, it isn't as well known as I'd have hoped.

# Prerequisites

- [homebrew](https://brew.sh/) from here.
- [qemu](https://www.qemu.org/), which we will be installing with homebrew.
- Any linux distribution: here I'll be using [Ubuntu Server 25.04](https://ubuntu.com/download/server)

# Installation

Install `qemu` with the following command:
```bash
brew install qemu
```

This is what we'll be using to run the virtual machine.

Make sure you've downloaded an `.iso` file for your distribution of choice. As stated above, this tutorial will be using Ubuntu Server 25.04.

Then create a folder in your `~/` directory named `vms`.

```bash
mkdir -p ~/vms/ubuntu
```

Navigate to that directory and run this command:
```bash
qemu-img create -f qcow2 ubuntu-server.qcow2 20G
```

This creates a virtual disk image that supports dynamic sizing with a max-size of 20 GB. The file grows as needed.

Next, boot up your `.iso` file for installation. For Ubuntu (and I suppose most Linux distributions that use `grub`), you'll need to use the GUI for the installation as `grub` can be weird on terminals.

```bash
qemu-system-x86_64 \
  -m 4096 \
  -smp 4 \
  -machine type=pc,accel=tcg \
  -drive file=ubuntu-server.qcow2,format=qcow2 \
  -cdrom /path/to/ubuntu.iso \
  -boot d
```

Modify the RAM (`-m`), CPU cores (`-smp`), and the `.iso` path (`-cdrom`) as needed. For the installation step, I recommend allocating generous resources—higher RAM and more CPU cores—to make the process less painfully slow. Once you run the command, a QEMU window will launch, and you’ll be guided through the Ubuntu installation. You can safely accept the default options throughout. Keep in mind that since you're emulating an x86_64 system on an ARM-based Mac, performance will be sluggish—this is expected during setup.

After around half an hour, installation should be done. Ubuntu will now instruct you to reboot. Close the QEMU window. To run the VM, you'll first need to unmount the `.iso` file. Run this command:

```bash
qemu-system-x86_64 \
  -m 4096 \
  -smp 4 \
  -machine type=pc,accel=tcg \
  -drive file=ubuntu-server.qcow2,format=qcow2 \
  -boot c \
```

Go through the setup of logging in for the first time. If you've gotten this far, congratulations! The hard part is done.

## Setting up ssh

This part of the tutorial sets up a bash script called `ubuntu` that you can use to automatically start the virtual machine, shut it down, and `ssh` into it to get a live shell.

Firstly, make sure your virtual machine is turned on *with user-mode networking*:
```bash
qemu-system-x86_64 \
  -m 4096 \
  -smp 4 \
  -machine type=pc,accel=tcg \
  -drive file=ubuntu-server.qcow2,format=qcow2 \
  -net user,hostfwd=tcp::2222-:22 \
  -net nic \
  -boot c \
```

Then generate an `ssh` key on your Mac, if you don't have one already:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Copy this key to your virtual machine:
```bash
ssh-copy-id -p 2222 username@localhost
```

Doing all of this lets you `ssh` into Linux without having to enter your root password. With just this much alone, you're pretty much set. However, as promised, here's a bash script that just makes it that much more convenient:

Save this to a file called `ubuntu`:
```bash
#!/bin/bash

# ====== MODIFY THESE ======
IMG_PATH="/Users/avighna/vms/ubuntu/ubuntu-server.qcow2"
SSH_PORT=2222
SSH_USER="avighna"
# ===========================

QEMU_CMD="qemu-system-x86_64 \
  -m 4096 \
  -smp 4 \
  -machine type=pc,accel=tcg \
  -drive file=$IMG_PATH,format=qcow2 \
  -net user,hostfwd=tcp::${SSH_PORT}-:22 \
  -net nic \
  -boot c \
  -nographic"

LOG_FILE="$HOME/qemu-ubuntu.log"

function is_running() {
  pgrep -f "qemu-system-x86_64.*$(basename $IMG_PATH)" > /dev/null
}

function start_vm() {
  if is_running; then
    echo "VM already running."
  else
    echo "Starting VM..."
    nohup $QEMU_CMD > "$LOG_FILE" 2>&1 &
    echo "Waiting ~60 seconds for VM to boot..."
    sleep 60
    echo "VM should be ready now."
  fi
}

function shutdown_vm() {
  if ! is_running; then
    echo "VM is not running."
  else
    PID=$(pgrep -f "qemu-system-x86_64.*$(basename $IMG_PATH)")
    echo "Shutting down VM (PID $PID)..."
    kill $PID
    echo "Shutdown signal sent."
  fi
}

function ssh_into_vm() {
  ssh -p $SSH_PORT ${SSH_USER}@localhost
}

case "$1" in
  --start)
    start_vm
    ;;
  --shutdown)
    shutdown_vm
    ;;
  "")
    if ! is_running; then
      start_vm
    fi
    ssh_into_vm
    ;;
  *)
    echo "Usage: $0 [--start|--shutdown]"
    ;;
esac
```

Give this script permission to execute:
```bash
chmod +x ubuntu
```

And copy it to something like `/usr/local/bin` with `sudo cp ubuntu /usr/local/bin/ubuntu`.

That's it; you're all set up. Enjoy your new Linux virtual machine on macOS!
