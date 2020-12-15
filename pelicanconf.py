#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = 'Blaine'
SITENAME = "Quip Trippin"
SITEURL = ''
SITETITLE = "Quip Trippin' with Blaine"
SITESUBTITLE = "Musings on Data Science, DFS, Tennis, Traveling, Pop Culture"
SITELOGO = 'siteImages/gandalf.png'

PATH = 'content'

TIMEZONE = 'America/Chicago'

DEFAULT_LANG = 'English'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (('Twitter', 'twitter.com/blainejungwirth'),)

# Social widget
SOCIAL = (('twitter', 'twitter.com/blainejungwirth'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True

THEME = r'c:\users\cloud\~\pelican-themes\flex'

PLUGIN_PATHS = [r'c:\users\cloud\~\pelican-plugins']

PLUGINS = [
    'pelican_youtube',
    'assets'
]


#MENUITEMS = (('Contact', '/contact/'), ('DFS', '/dfs/'),
#             ('Data Science', '/data-science/'),
#		('Quip Tripping', '/quip-tripping/'),
#		('Potpourri', '/potpourri/')
 #            )

BROWSER_COLOR = "#333"
MAIN_MENU = True

FEED_ALL_ATOM = "feeds/all.atom.xml"
CATEGORY_FEED_ATOM = "feeds/{slug}.atom.xml"
PYGMENTS_STYLE = "monokai"

MENUITEMS = (
    ("Archives", "/archives.html"),
    ("Categories", "/categories.html"),
)

STATIC_PATHS  = ['siteImages']