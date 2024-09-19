const audio = await Service.import("audio");

import { VolumeIcon } from "./bar.js";

const VolBar = () => Widget.Box({
    vertical: false,
    spacing: 10,
    children: [
        VolumeIcon(),
        Widget.LevelBar({
            barMode: "continuous",
            vertical: false,
            widthRequest: 400,
            // heightRequest: 15,
        }).hook(audio.speaker, self => {
            self.value = audio.speaker.is_muted ? 0 : audio.speaker.volume;
        })
    ]
});

export const VolBrightBar = (monitor = 0) => Widget.Window({
    monitor,
    name: `vol_bright_bar${monitor}`,
    anchor: ["bottom"],
    child: Widget.Box({
        className: "panel",
        css: "margin: 20px;",
        child: VolBar()
    }),
    setup: self => {
        let currentTimeout = null;

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

        self.hook(audio.speaker, onChanged, "notify::volume");
        self.hook(audio.speaker, onChanged, "notify::is-muted");
    }
});
