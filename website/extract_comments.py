import jinja2
from comment_parser import comment_parser
import glob


TEMPLATES_PATH = "md-templates/"
filenames = glob.glob("../common/wrappingS-*.js")
output_dir = "content/wrappers/"

titles = {
    "ajax": "AJAX",
    "battery-cr": "Battery level",
    "be": "Beacon API",
    "dm": "Device memory",
    "ecma-array": "ECMAscript arrays",
    "ecma-date": "ECMAscript date",
    "ecma-shared": "ECMA shared buffers",
    "geo": "Geolocation",
    "h-c": "HTML Canvas",
    "hrt": "HTML Performance",
    "html-ls": "HTML Workers",
    "html": "HTML window name",
    "mcs": "Media devices",
    "pt2": "PT2",
    "weba": "WebAudio",
    "webgl": "WebGL",
    "nbs" : "Network Boundary Shield",
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
            line = line.replace("\\note", "Note: ")
        newtext += line + "\n"
    return newtext


env = jinja2.Environment(
    loader=jinja2.FileSystemLoader([TEMPLATES_PATH]),
    extensions=["jinja2.ext.with_"],
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
