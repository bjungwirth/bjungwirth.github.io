#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = 'Blaine'
SITENAME = "Quip Trippin"
SITEURL = 'http://jungwirb.io'
SITETITLE = "Quip Trippin' with Blaine"
SITESUBTITLE = "Musings on Data Science, DFS, Tennis, Traveling, Pop Culture"
SITELOGO = 'siteImages/gandalf.png'

THEME = r'c:\users\cloud\~\pelican-themes\flex'


PATH = 'content'

PLUGIN_PATHS = [r'c:\users\cloud\~\pelican-plugins']

STATIC_PATHS = [
    'CNAME', 'siteImages', 'images'
]

EXTRA_PATH_METADATA = {
    'CNAME': {'path': 'CNAME'},
}

MAIN_MENU = True


TIMEZONE = 'America/Chicago'

DEFAULT_LANG = 'English'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
#LINKS = (("twitter", "https://twitter.com/blainejungwirth/"),)

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True

BROWSER_COLOR = "#333"

FEED_ALL_ATOM = "feeds/all.atom.xml"
CATEGORY_FEED_ATOM = "feeds/{slug}.atom.xml"
PYGMENTS_STYLE = "monokai"

MENUITEMS = (
    ("Archives", "/archives.html"),
    ("Categories", "/categories.html")
)

#PLUGINS = [
#    'pelican_youtube',
#    'assets'
#]

# Social widget
SOCIAL = (
    ("twitter", "https://twitter.com/blainejungwirth/"),
)
