const Guy = (imgUrl, imgWidth, imgHeight, requestor = "idk lol") => Widget.Box({
    vertical: false,
    spacing: 20,
    children: [
        // requestor label
        Widget.Label({ label: `requested by: ${requestor}` }),

        // image of guy itself
        Widget.Box({
            widthRequest: imgWidth,
            heightRequest: imgHeight,
            css: `
                background-image: url("${imgUrl}");
                background-size: 100%;
            `
        })
    ]
});

export const FreakingGuys = (guysArray = []) => Widget.Window({
    monitor: 0,
    name: "freaking_guys",
    child: Widget.Box({
        className: "panel",
        vertical: true,
        spacing: 10,
        children: guysArray.map(g => Guy(g.url, g.width, g.height, g.requestor))
    })
})

// children: [
//     Guy(
//         `https://www.thoughtco.com/thmb/K9BqMNlRYBg01mVVc4yK_XLEzfE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/GettyImages-635477020-14202280a8714a179f5850decf0d254e.jpg`,
//         200,
//         150,
//         "Goose"
//     ),
//     Guy(
//         `https://media.discordapp.net/attachments/1197980930615300137/1254128092713193492/IMG_4777.png?ex=66785d4d&is=66770bcd&hm=adf08fd8193c8865962c71c5b501d17abd50a26f82cc05e4ac04dc70515305c6&=&format=webp&quality=lossless&width=753&height=912`,
//         200,
//         240,
//         "Ophie"
//     )
// ]
