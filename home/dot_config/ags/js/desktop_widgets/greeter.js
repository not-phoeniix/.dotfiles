import { HourMilit } from "../variables.js";

export const Greeter = (Name = Variable("[name]")) => Widget.CenterBox({
    className: "desktop-widget greeter",
    vertical: true,
    centerWidget: Widget.Box({
        spacing: 5,
        vertical: true,
        children: [
            Widget.Label({
                label: Name.bind().as(n => `Hi ${n} !!`),
                className: "greet-name",
                wrap: true,
                truncate: "middle",
            }),
            Widget.Label({
                className: "greet-time accent",
                label: HourMilit.bind().as(h => {
                    let hour = Number(h);
                    let time = "";
                    if (hour >= 22 || hour <= 3) {
                        // between 10pm and 3am, "night"
                        time = "Night";
                    } else if (hour >= 16) {
                        // >= 6pm, "evening"
                        time = "Evening";
                    } else if (hour >= 12) {
                        // >=noon, "afternoon"
                        time = "Afternoon";
                    } else {
                        // otherwise, "morning"
                        time = "Morning";
                    }

                    return `Good ${time} :]`
                })
            })
        ]
    })
});