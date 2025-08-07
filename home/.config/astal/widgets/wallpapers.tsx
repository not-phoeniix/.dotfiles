import { bind } from "astal";
import { App, Astal, Gdk } from "astal/gtk3";
import settings from "../extra/settings";

// function 

export default function (monitor: Gdk.Monitor) {
    return <window
        gdkmonitor={monitor}
        layer={Astal.Layer.OVERLAY}
        anchor={Astal.WindowAnchor.NONE}
        application={App}
        visible={false}
        name="wallpapers">

        <box className="panel" css="margin: 10px">
            <label>{bind(settings.wallpaperDir)}</label>
        </box>

    </window>;
}