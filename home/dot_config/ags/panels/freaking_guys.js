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
