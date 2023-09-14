# Mathematical Magic Mirrorball
https://github.com/FrostKiwi/Mirrorball/assets/60887273/a3a23182-7316-4ccd-8815-1c75ede86622


A combination of Video and WebApp ( https://mirrorball.frost.kiwi ). While watching, viewers can directly interact with examples and visualizations, on a second device or a separate browser tab.
The audience will be taken on a journey through the history and maths on the topic of the "Mirrorball projection".

Deceptively simple, it is an incredible intersection of Computer Science and Mathematics. This project has been made in conjuction with a paper, which you can read on arXiv: https://arxiv.org/abs/2308.10991


## Video
[![Watch the video](https://img.youtube.com/vi/rJPKTCdk-WI/0.jpg)](https://www.youtube.com/watch?v=rJPKTCdk-WI)
[![日本語版](https://img.youtube.com/vi/cmZcnhFycw8/0.jpg)](https://www.youtube.com/watch?v=cmZcnhFycw8)

## Photo contribution guide, as per [announcement](https://youtu.be/rJPKTCdk-WI?t=1822)
As shown in the sample Pull Request https://github.com/FrostKiwi/Mirrorball/pull/13, just commit the photo into any spot and mentioned how you want to be credited. To do so, you will need to fork this repo in the top right corner first. Then you can drag&drop the photo into the code. This will make GitHub officially credit you as contributor. I will move it to the correct folder ([Example commit](https://github.com/FrostKiwi/Mirrorball/commit/fc696841a197b9f00680e48aa3a2fbd5eec38d4b)), crop, rotate the image and credit the author ([Example Commit](https://github.com/FrostKiwi/Mirrorball/commit/425070687f39233e1583a73c37c2872e4ef9cbee)) and generate the thumbnail ([Example commit](https://github.com/FrostKiwi/Mirrorball/commit/e66261f7d8b7e00373bb9fd14e14ae6c9e90fc53)).

If that's too troublesome: Just message me on any Social media or E-Mail me at mirrorball@frost.kiwi.
### Submission:
The photos in the "User submissions" tab were provided by:
 * [@zjquid on GitHub](https://github.com/zjquid)
 * [Nature's Joints on Discord](https://discordapp.com/users/1142199521930137713)
 * [u/wwxxcc on Reddit](https://www.reddit.com/user/wwxxcc)
 * [u/MagicList on Reddit](https://www.reddit.com/user/MagicList/) / [@CigamPower on Github](https://github.com/CigamPower/)

## Features:

View the projection of a Mirrorball with different colorful visualizations to understand how the math works. You can project a:
 * photo
 * video
 * live webcam stream
 * capture card feed

Any format, which your web browser can decode is supported. That should cover all important file types.

### Limitations
Most of the official photo examples are 100 Megapixel photos scaled down to 8192² px resolution. The WebApp automatically downscales photos even further, if the user's device does not support that resolution. Even so, I changed all photos to 4096² px to make sure all devices show the projection. I had weird edge cases, where older iPhones support 8192² but refuse to upload the data to the VRAM, because of memory preassure, so just to be sure all photos are 4096² instead.

Same goes for Video. All sources are 4096² but the WebApp only has 2048² videos. The reason is Windows's built in decoder being very weak: https://github.com/FrostKiwi/Mirrorball/issues/11.

## Build instructions
If you want to run the code locally:
 * Clone the repo
 * Install [Node.js](https://nodejs.org/en)
 * Run `npm install` in the repo's root directory to install the dependencies as defined by the [package.json](https://github.com/FrostKiwi/Mirrorball/blob/main/package.json) file
 * Run `npx vite`, so [Vite](https://github.com/vitejs/vite) will start a local server to test the code on

# Credits:
 * The side controlbar is realized via the package [lil-gui](https://github.com/georgealways/lil-gui), package author: [@georgealways](https://github.com/georgealways)
 * The debug statistics toggled in the settings tab is the evergreen [stats.js](https://github.com/mrdoob/stats.js), package author: [@mrdoob](https://github.com/mrdoob)
 * Debug interface in the settings tab for tracking down bugs especially on iOS is provided by the awesome [eruda](https://github.com/liriliri/eruda), package author: [@liriliri](https://github.com/liriliri)
 * One key insight on state management to get redraws only when the user is actually touching the interface and be a static page otherwise was provided by [@Pomax](https://github.com/Pomax) in [this StackOverflow answer](https://stackoverflow.com/a/76633986/6240779)
 * Vector math performed via the package [gl-matrix](https://github.com/toji/gl-matrix), package author: [@toji](https://github.com/toji)
