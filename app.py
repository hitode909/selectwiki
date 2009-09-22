import cgi

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from controller.api import WordPage,WordsPage

application = webapp.WSGIApplication(
                                     [
                                      ('/api/words', WordsPage),
                                      ('/api/word/', WordPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
