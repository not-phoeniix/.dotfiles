const mpris = await Service.import("mpris");

import { Hour, Minute, Day, Month, Year } from "./variables.js";

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

// #region Music

const CoverArt = (player, size = 200) => Widget.Box({
    className: "media-cover-art",
    widthRequest: size,
    heightRequest: size,
    css: player.bind("coverPath").as(p =>
        `background-image: url('${p}');`
    )
});

function formatSecString(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const sec0 = sec < 10 ? "0" : "";
    return `${min}:${sec0}${sec}`
}

const MediaInfo = (player) => Widget.Box({
    vertical: true,
    vpack: "center",
    className: "media-info",
    spacing: 10,
    children: [
        Widget.Label({
            className: "media-title",
            label: player.bind("trackTitle").as(t => ` ${t}`),
            wrap: true,
            hpack: "start"
        }),
        Widget.Label({
            className: "media-artist",
            maxWidthChars: 40,
            truncate: "end",
            label: player.bind("trackArtists").as(a => "󰠃 " + a.join(", ")),
            hpack: "start"
        }),

        Widget.Box({
            vertical: true,
            spacing: 5,
            children: [
                Widget.LevelBar({
                    className: "media-progress-bar",
                    widthRequest: 300,
                    heightRequest: 6,
                }).poll(1000, (self) => {
                    self.value = player.position / player.length;
                }),

                Widget.CenterBox({
                    startWidget: Widget.Label({
                        className: "media-progress-label",
                        hpack: "start"
                    }).poll(1000, (self) => {
                        self.label = formatSecString(player.position);
                    }),

                    endWidget: Widget.Label({
                        className: "media-progress-label",
                        label: player.bind("length").as(l => formatSecString(l)),
                        hpack: "end"
                    })
                })
            ]
        })

    ]
});

const Player = (player) => Widget.Box({
    vertical: false,
    children: [
        CoverArt(player),
        MediaInfo(player),
    ]
});

const players = mpris.bind("players");

const NowPlaying = Widget.Box({
    className: "widget",
    css: "padding: 0px",
    vertical: true,
    child: players.as(p => Player(p[0])),
    visible: players.as(p => p.length > 0)
});

// #endregion

// #region Calendar

const DateLabel = Widget.Box({
    vertical: false,
    hpack: "center",
    spacing: 12,
    css: "margin: 20px",
    children: [
        Widget.Label({ label: Month.bind() }),
        Widget.Label({ label: Day.bind() }),
        Widget.Label({ label: Year.bind(), className: "accent" }),
    ]
});

const Calendar = Widget.Box({
    vertical: true,
    className: "widget"
}).hook(
    App,
    (self, windowName, visible) => {
        if (windowName == "dashboard" && visible) {
            self.children = [
                DateLabel,
                Widget.Calendar({
                    showDayNames: true,
                    showHeading: true,
                })
            ];
        }
    },
    "window-toggled"
);

// #endregion

export const Dashboard = Widget.Window({
    monitor: 0,
    name: "dashboard",
    keymode: "on-demand",
    anchor: ["top", "bottom", "right"],
    child: Widget.Box({
        className: "panel",
        css: `
            border-top-right-radius: 0px;
            border-bottom-right-radius: 0px;
        `,
        vertical: true,
        spacing: 15,
        children: [
            Time,
            NowPlaying,
            Calendar
        ]
    })
}).keybind("Escape", () => App.closeWindow("dashboard"));
