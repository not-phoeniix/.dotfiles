import { Hour, Minute } from "../variables.js";

export const DigitalClock = () => Widget.CenterBox({
    className: "desktop-widget digital-clock",
    centerWidget: Widget.Box({
        spacing: 10,
        children: [
            Widget.Label({ label: Hour.bind(), }),
            Widget.Label({ label: Minute.bind(), className: "accent" })
        ]
    })
});