from comment_parser import comment_parser
import glob

filenames = glob.glob("../common/wrapping*.js")

for fn in filenames:
    print(fn)
    comments = comment_parser.extract_comments(fn, mime="text/x-javascript")
    for c in comments:
        if "ingroup" in c.text():
            print(c.text())
    print("\n\n")
