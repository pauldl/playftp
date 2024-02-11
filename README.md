# playftp
An FTP server for receiving NewTek 3Play clips.

## Prerequisite

In order to use this, you'll need ffmpeg installed. Technically, you only need ffprobe - it's used to determine the timecode of the clip that's sent.

On a Mac, I simply install it with homebrew:

```bash
brew install ffmpeg
```

Once installed, you can determine the location of ffprobe like so:

```bash
which ffprobe
# should output something like `/opt/homebrew/bin/ffprobe`
```

## Setup

1. Clone this repo.
2. `npm install` to get the dependencies
3. copy `.env.sample` to `.env`
4. Update the contents of `.env` to the appropriate values
5. Run using `node index.js`

## Configure 3Play

In 3Play, you would set up an "FTP" export. I've found the settings can be a bit... finicky.

The server name should specify the protocol, and add a trailing slash at the end. i.e.: `ftp://123.123.123.25/`.

Make sure you specify the same username and password as the .env file. You are welcome to change these values - if you change them, make sure you stop & reload the server so that it catches the updated values.

## TODO:

- Put a GUI of some kind together for configuration & saving the .env file
- Add some daemonization instructions for booting this at launch / resetting as needed