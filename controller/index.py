from google.appengine.ext import webapp
from model import Word
from google.appengine.api import memcache
import os
from google.appengine.ext.webapp import template
import logging

class IndexPage(webapp.RequestHandler):
  def get(self):
    result = memcache.get("index")
    if not result:
      logging.info("cache not hit(index)")
      template_values = {
        'words': Word.all().fetch(1000)
        }
      path = os.path.join(os.path.dirname(__file__), '..', 'view', 'index.html')
      result = template.render(path, template_values)
      memcache.set("index", result, 60)

    self.response.out.write(result)
