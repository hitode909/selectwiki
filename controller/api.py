import logging
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import memcache
from django.utils import simplejson
from model import Word,Description

class WordsPage(webapp.RequestHandler):
  def get(self):
    result = memcache.get("words")
    if not result:
      result = simplejson.dumps(
        {"words": [ w.name for w in Word.all().fetch(1000) ]},
        ensure_ascii=False)
      memcache.set("words", result)
    
    self.response.content_type = "application/json"
    self.response.out.write(result)
    return

class WordPage(webapp.RequestHandler):
  def get(self):
    result_hash = {"errors": []}
    word = None
    word_name = self.request.get('word')
    if not word_name:
      self.response.set_status(404)
      result_hash['errors'].append('word is empty')
    else:
      result = memcache.get("word-" + word_name)
      if not result:
        logging.info("cache not hit(%s)" % (word.name))
        word = Word.get_by_name(word_name)

    if word:
      result_hash['word'] = word.to_hash
    else:
      result_hash['errors'].append('word not found')

    result = simplejson.dumps(result_hash, ensure_ascii=False)
    memcache.set("word-" + word_name, result)
    
    self.response.content_type = "application/json"
    self.response.out.write(result)
    return

  def post(self):
    result_hash = {"errors": []}
    word_name = self.request.get('word')
    word = None
    if not word_name:
      result_hash['errors'].append('word is empty')
    else:
      description_body = self.request.get('description')
      word = Word.get_or_insert_by_name(word_name)
      if word:
        result_hash['word'] = word.to_hash
      else:
        result_hash['errors'].append('word not found')

    if description_body:
      word.add_description(description_body)
      memcache.delete("words")
      memcache.delete("word-"+word_name)
    else:
      result_hash['errors'].append('description is empty')

    result = simplejson.dumps(result_hash, ensure_ascii=False)

    logging.info("description add(%s, %s)" % (word.name, description_body))
    self.response.content_type = "application/json"
    self.response.out.write(result)
    return

  def delete(self):
    result_hash = {"errors": []}
    word_name = self.request.get('word')
    word = None
    if not word_name:
      result_hash['errors'].append('word is empty')
    description_key = self.request.get('key')
    if not description_key:
      result_hash['errors'].append('key is empty')
    word = Word.get_by_name(word_name)
    if word:
      result_hash['word'] = word.to_hash
    else:
      result_hash['errors'].append('word not found')

    desc = word.get_description(description_key)
    if not desc:
      result_hash['errors'].append('description not found')

    logging.info("description delete(%s, %s)" % (word.name, desc.body))
    desc.delete()
    result = simplejson.dumps(result_hash, ensure_ascii=False)
    
    self.response.content_type = "application/json"
    self.response.out.write(result)
    return
