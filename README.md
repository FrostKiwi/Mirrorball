# Mathematical Magic Mirrorball
https://github.com/FrostKiwi/Mirrorball/assets/60887273/a3a23182-7316-4ccd-8815-1c75ede86622


A combination of Video and WebApp ( https://mirrorball.frost.kiwi ). While watching, viewers can directly interact with examples and visualizations, on a second device or a separate browser tab.
The audience will be taken on a journey through the history and maths on the topic of the "Mirrorball projection".

Deceptively simple, it is an incredible intersection of Computer Science and Mathematics.


## Video
[![Watch the video](https://img.youtube.com/vi/rJPKTCdk-WI/0.jpg)](https://www.youtube.com/watch?v=rJPKTCdk-WI)

## Photo contribution guide, regarding https://youtu.be/rJPKTCdk-WI?t=1822
Basically, just fork, drag and drop the photo anywhere in the code, no matter the directory, no matter the size or format, commit and submit the Pull Request. I will move the photo to the correct place, input the required cropping and rotation numbers, create the thumbnail and make sure you are properly credited in any way you wish.
Or just E-Mail me at mirrorball@frost.kiwi

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

## Credits for other packages:
 * The side controlbar is realized via [@georgealways](https://github.com/georgealways) [lil-gui](https://github.com/georgealways/lil-gui)
 * The debug statistics toggled in the settings tab is the evergreen [stats.js](https://github.com/mrdoob/stats.js) by [@mrdoob](https://github.com/mrdoob)
 * One key insight on state management to get redraws only when the user is actually touching the interface and be a static page otherwise was provided by [@Pomax](https://github.com/Pomax) in [this StackOverflow answer](https://stackoverflow.com/questions/76633899/can-requestanimationframe-be-called-from-input-events-and-still-respect-refresh/76633986?noredirect=1#comment135118794_76633986)
