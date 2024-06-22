import { Hour, Minute, Day, Month, Year } from "../variables.js"

// #region Time

const Uptime = Variable("up -19 hours lol");
const NumUpdatables = Variable("0");

// every minute poll for uptime
Utils.interval(60_000, () => {
    Utils.execAsync("uptime -p")
        .then(out => Uptime.value = out)
        .catch(err => print(err));
});

// every hour poll for updates
Utils.interval(3600_000, () => {
    Utils.execAsync(`bash -c "checkupdates | wc -l"`)
        .then(out => NumUpdatables.value = out)
        .catch(err => print(err));
});

const Time = Widget.Box({
    vertical: true,
    vexpand: true,
    vpack: "center",
    spacing: 10,
    children: [
        Widget.Box({
            hpack: "center",
            spacing: 24,
            children: [
                Widget.Label({ label: Hour.bind(), className: "bigtext" }),
                Widget.Label({ label: Minute.bind(), className: "bigtext accent" }),
            ]
        }),

        Widget.Label({
            label: Uptime.bind().as(u => `  ${u}`),
            className: "sub-header",
            css: "margin-top: 20px"
        }),
        Widget.Label({
            label: NumUpdatables.bind().as(n => `󰏔  ${n} updatable packages :3`),
            className: "sub-header"
        })
    ]
});

// #endregion

const Calendar = Widget.Box({
    vertical: true,
    className: "widget",
    children: [

        // current date label
        Widget.Box({
            vertical: false,
            hpack: "center",
            spacing: 12,
            css: "margin: 20px",
            children: [
                Widget.Label({ label: Month.bind() }),
                Widget.Label({ label: Day.bind() }),
                Widget.Label({ label: Year.bind(), className: "accent" }),
            ]
        }),

        // calendar itself
        Widget.Calendar({
            showDayNames: true,
            showHeading: true,
        })
    ]
});

export const Dashboard = () => Widget.Window({
    monitor: 0,
    name: "dashboard",
    anchor: ["top", "bottom", "right"],
    child: Widget.Box({
        className: "panel",
        css: `border-top-right-radius: 0px;
              border-bottom-right-radius: 0px;`,
        vertical: true,
        children: [
            Time,
            Calendar
        ]
    })
});
