const battery = await Service.import("battery");

import { BatteryIcon } from "../bar.js";

export const Storage = (circleSize = Variable(200), sizeScale = 0.9) => {
    const totalGigabytes = Variable(500);
    const usedGigabytes = Variable(10);
    const usedPercent = Variable(0.1);

    function updateStorage() {
        // grab output
        let output = Utils.exec(`bash -c "df -h --output=size,used,pcent / | sed -n '2p'"`);

        // turn all multiple spaces into a single space
        output = output.replace(/\s+/g, " ");
        // remove leading and trailing whitespace
        output = output.replace(/(^\s+|\s+$)/g, "");

        // split by matching only repeating numbers
        const split = output.match(/\d+/g);

        if (split) {
            totalGigabytes.value = Number(split[0]);
            usedGigabytes.value = Number(split[1]);
            usedPercent.value = Number(split[2]) / 100;
        }
    }

    updateStorage();
    Utils.interval(60_000 * 15, () => updateStorage);

    const progress = Widget.CircularProgress({
        css: circleSize.bind().as(s => `
            min-width: ${s * sizeScale}px;
            min-height: ${s * sizeScale}px;
        `),
        startAt: 0.75,
        endAt: 0.75,
        rounded: true,
        value: usedPercent.bind()
    });

    return Widget.CenterBox({
        className: "desktop-widget",
        centerWidget: Widget.Overlay({
            child: progress,
            overlay: Widget.Box({
                vertical: true,
                vpack: "center",
                children: [
                    Widget.Label({
                        label: "󰋊",
                        className: "desktop-widget-icon"
                    }),
                    Widget.Label({
                        label: usedPercent.bind().as(u => `${u * 100}% used`),
                        className: "desktop-widget-desc"
                    }),
                    // Widget.Label({
                    //     label: usedGigabytes.bind().as(() =>
                    //         `${usedGigabytes.value}gb / ${totalGigabytes.value}gb`
                    //     ),
                    //     className: "desktop-widget-desc"
                    // })
                ]
            }),
        })
    });
};

export const Battery = (circleSize = Variable(200), sizeScale = 0.9) => Widget.CenterBox({
    className: "desktop-widget",
    centerWidget: Widget.Overlay({
        child: Widget.CircularProgress({
            css: circleSize.bind().as(s => `
                min-width: ${s * sizeScale}px;
                min-height: ${s * sizeScale}px;
            `),
            startAt: 0.75,
            endAt: 0.75,
            rounded: true,
            value: battery.bind("percent").as(p => p / 100)
        }),
        overlay: Widget.Box({
            vertical: true,
            vpack: "center",
            setup: self => {
                const bat = BatteryIcon();
                bat.class_name = "desktop-widget-icon";
                self.children = [
                    bat,
                    Widget.Label({
                        label: battery.bind("percent").as(p => `${p}%`),
                        className: "desktop-widget-desc"
                    })
                ]
            }
        }),
    })
})
