# playftp

An FTP server for receiving NewTek 3Play clips.

## Why

tl;dr: This FTP server works with the quirks of the 3Play, and when clips come in, it adds the clip's timecode to the filename to avoid duplicate clips overwriting each other.

------

More context?

The NewTek 3Play is a powerful replay machine. I've used it for the past 5 years in hundreds of productions, across many collegiate sports including football (original) and football (American), baseball and softball, basketball, volleyball, lacrosse. Its best feature, in my opinion, is its simple tagging system, which allows the operator to very quickly label a clip with whatever rubric of terms they see fit.

As an example, I can tag a play as "Home 14 2pt" to label a clip as a successful 2 point shot by home team #14; I can do that in 4 keystrokes on the number pad. It's all about how the tags are configured, but it makes for very fast clip labeling, searching, and highlight collection.

The problem is that if #14 is having a real game, I might have 5 to 10 clips that are all labeled "Home 14 2pt". When I go to export these clips to a destination, all such clips will have the same filename: "Home 14 2pt.mov". This means that later clips will simply overwrite the earlier ones, and you'll end up only having a single exported highlight of #14's great game.

> Aside - It might be worth noting that all my experience is with the now-discontinued 3Play 4800. I have no idea if the new 3P1 or 3P2 have this same issue; I have seen comments on the NewTek Forum that they have a different method for naming now which might resolve this issue.

This FTP server catches the .mov file after it's uploaded, uses ffprobe (see: [ffmpeg](https://ffmpeg.org)) to grab the timecode of the first frame of the clip, and then adds that timecode to the filename. When the 3Play then uploads a second "Home 14 2pt.mov", it won't overwrite the earlier one anymore, because the earlier clip will have a different timecode.

1. 3Play uploads "Home 14 2pt.mov"
2. playftp catches the file
3. playftp uses `ffprobe` to get the file timecode eg. "14:12:37;20"
4. playftp prepends the filename with the timecode, changing ":" and ";" to "-" eg. "14-12-37-20-Home 14 2pt.mov"
5. 3Play uploads a different "Home 14 2pt.mov", but the first one is safely stowed with its specific timecode

Because the timecode will be ever-changing throughout the game, no two separate plays from #14 will have the same filename.

The other thing this package does is it provides easy authentication via username and password - which you can configure in .env - for the FTP server. I don't know why, but NewTek does not seem to support anonymous FTP. Which is a real shame, because you *could* send 3Play clips right to a BlackMagic HyperDeck or a Cloud Pod with hardly any configuration required... but I digress.

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
