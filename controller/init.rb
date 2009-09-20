require 'json'

class Controller < Ramaze::Controller
  layout :default
  helper :xhtml
  engine :Etanni
end

class JsonController < Controller
  provide(:html, :type => 'application/json'){|a,s|
    s.to_hash.to_json
  }
end

require 'controller/main'
require 'controller/api'
