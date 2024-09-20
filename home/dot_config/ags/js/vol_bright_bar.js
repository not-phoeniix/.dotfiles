const audio = await Service.import("audio");
import brightness from "./brightness.js";

import { VolumeIcon } from "./bar.js";

const VolBar = () => Widget.Box({
    spacing: 15,
    className: "widget",
    children: [
        VolumeIcon(),
        Widget.LevelBar({
            barMode: "continuous",
            widthRequest: 400,
            hexpand: true
        }).hook(audio.speaker, self => {
            self.value = audio.speaker.is_muted ? 0 : audio.speaker.volume;
        })
    ]
});

const BrightBar = () => Widget.Box({
    spacing: 15,
    className: "widget",
    children: [
        Widget.Label("󰃠"),
        Widget.LevelBar({
            barMode: "continuous",
            widthRequest: 400,
            hexpand: true
        }).hook(brightness, self => {
            self.value = brightness.screen_value
        })
    ]
});

const BarSwitcher = () => Widget.Stack({
    children: {
        "volume": VolBar(),
        "bright": BrightBar()
    },
    setup: self => {
        // hook into audio & brightness to change the shown 
        //   page when either of those events are sent out
        self.hook(audio.speaker, () => self.shown = "volume", "notify::volume");
        self.hook(audio.speaker, () => self.shown = "volume", "notify::is-muted");
        self.hook(brightness, () => self.shown = "bright");
    }
});

export const VolBrightBar = (monitor = 0) => Widget.Window({
    monitor,
    name: `vol_bright_bar${monitor}`,
    anchor: ["bottom"],
    child: Widget.Box({
        className: "panel",
        css: "margin: 20px;",
        child: BarSwitcher()
    }),
    setup: self => {
        let currentTimeout = null;

        // function that adjusts timer of when to keep showing the bar
        function onChanged() {
            if (currentTimeout == null) {
                App.openWindow(self.name ?? "");
            } else {
                // destroy existing timeout if it's not null
                currentTimeout.destroy();
            }

            // start a new timer every time volume changes
            currentTimeout = setTimeout(() => {
                App.closeWindow(self.name ?? "");
                currentTimeout = null;
            }, 1500);
        }

        // hook function into the muted, volume change, and brightness services
        self.hook(audio.speaker, onChanged, "notify::volume");
        self.hook(audio.speaker, onChanged, "notify::is-muted");
        self.hook(brightness, onChanged);
    }
});
