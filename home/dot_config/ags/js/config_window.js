import Gtk from "gi://Gtk?version=3.0";

const RegularWindow = Widget.subclass(Gtk.Window);

export const ConfigWindow = RegularWindow({
    name: "desktop_cfg",
    child: Widget.Box({
        className: "panel",
        css: "border-radius: 0px",
        children: [
            Widget.Label({
                label: "heh... take that liberal.......",
            })
        ]
    })
}).keybind("Escape", () => App.closeWindow("desktop_cfg"));
