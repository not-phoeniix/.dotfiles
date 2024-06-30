import Gtk from "gi://Gtk?version=3.0"

const RegularWindow = Widget.subclass(Gtk.Window);

export const ConfigWindow = RegularWindow({
    name: "config_window",
    child: Widget.Box({
        className: "panel",
        children: [
            Widget.Label({
                label: "heh... take that liberal.......",
            })
        ]
    })
});
