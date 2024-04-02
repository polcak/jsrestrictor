import jinja2
from comment_parser import comment_parser
import glob


TEMPLATES_PATH = "md-templates/"
filenames = glob.glob("../common/wrappingS-*.js")
output_dir = "content/wrappers/"

titles = {
    "ajax": "Ajax",
    "battery-cr": "Battery level",
    "be": "Beacon API",
    "coop-scheduling": "Cooperative Scheduling",
    "dm": "Device memory",
    "dom": "DOM API",
    "ecma-array": "ECMAscript arrays",
    "ecma-date": "ECMAscript date",
    "ecma-shared": "ECMA shared buffers",
    "eme": "Encrypted Media Extensions",
    "geo": "Geolocation",
    "gp": "Gamepad",
    "h-c": "HTML Canvas",
    "hrt": "HTML Performance",
    "html": "HTML window name",
    "html-ls": "HTML Workers",
    "html5": "HTML multimedia",
    "idle": "Idle detection",
    "mcs": "Media devices",
    "media-capabilities": "Media capabilities",
    "net": "Network information",
    "nfc": "Web NFC",
    "np": "Navigator Plugins",
    "pt2": "PT2",
    "sensor-accel": "Accelerometer",
    "sensor-gyro": "Gyroscope",
    "sensor-light": "Ambient light sensor",
    "sensor-magnet": "Magnet",
    "sensor-orient": "Orientation sensor",
    "sensor": "Generic sensor",
    "vr": "Virtual Reality 1.1",
    "weba": "WebAudio",
    "webgl": "WebGL",
    "xr": "Web XR",
    "nbs": "Network Boundary Shield",
    "pt2": "Performance Timeline (L2)",
}


def render_template_into_file(env, templatename, filename, context=None):
    template = env.get_template(templatename)
    if not context:
        context = {}
    html = template.render(**context)
    with open(filename, "wb") as fh:
        fh.write(html.encode("utf-8"))


def comment_to_md(text):
    newtext = ""
    for line in text.split("\n"):
        line = line.strip()
        line = line.replace("* ", "", 1)
        if line in ("\\file", "\\ingroup wrappers"):
            continue
        elif line in ("* "):
            line = ""
        if line.startswith("\\note"):
            line = line.replace("\\note", "**Note**: ")
        if line.startswith("\\see"):
            line = line.replace("\\see", "**See also**: ")
        if line.startswith("\\bug"):
            line = line.replace("\\bug", "**Known bug**: ")
        newtext += line + "\n"
    return newtext


env = jinja2.Environment(
    loader=jinja2.FileSystemLoader([TEMPLATES_PATH]),
    trim_blocks=True,
    lstrip_blocks=True,
)

if __name__ == "__main__":
    for fn in filenames:
        slug = fn.split("/")[-1].replace("wrappingS-", "").replace(".js", "").lower()
        comments = comment_parser.extract_comments(fn, mime="text/x-javascript")

        description = [c.text() for c in comments if "ingroup" in c.text()]
        context = {}
        context["filename"] = fn
        context["title"] = titles.get(slug, slug)

        if description:
            # print("+ " + slug)
            context["description"] = comment_to_md(description[0])
        else:
            # meter título sem link no site
            # print("  " + slug)
            pass
        outfn = output_dir + slug + ".md"
        render_template_into_file(env, "wrapper.md", outfn, context=context)
